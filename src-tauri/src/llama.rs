//! Runs llama-server (llama.cpp) on 127.0.0.1 with the chosen model. The app starts it,
//! the router's basic tier talks to its OpenAI-compatible /v1 API, and it is stopped when
//! the player switches it off or the app exits.

use serde::Serialize;
use std::net::TcpListener;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::time::Duration;
use tauri::{AppHandle, Manager, State};

use crate::data_path;

#[derive(Default)]
pub struct LlamaState(Mutex<Option<Running>>);

pub struct Running {
    child: Child,
    port: u16,
    model: String,
}

#[derive(Serialize)]
pub struct LlamaStatus {
    pub running: bool,
    pub port: Option<u16>,
    pub base_url: Option<String>,
    pub model: Option<String>,
}

fn free_port() -> Result<u16, String> {
    let l = TcpListener::bind("127.0.0.1:0").map_err(|e| e.to_string())?;
    Ok(l.local_addr().map_err(|e| e.to_string())?.port())
}

fn status_of(r: &Option<Running>) -> LlamaStatus {
    match r {
        Some(r) => LlamaStatus {
            running: true,
            port: Some(r.port),
            base_url: Some(format!("http://127.0.0.1:{}/v1", r.port)),
            model: Some(r.model.clone()),
        },
        None => LlamaStatus { running: false, port: None, base_url: None, model: None },
    }
}

/// Starts llama-server. `server` and `model` are paths inside the app data folder.
/// Waits until /health answers (loading a 12B model can take a while) before returning.
#[tauri::command]
pub async fn start_llama(
    app: AppHandle,
    state: State<'_, LlamaState>,
    server: String,
    model: String,
    context: Option<u32>,
    gpu_layers: Option<i32>,
) -> Result<LlamaStatus, String> {
    stop_now(&app);
    let server_path = data_path(&app, &server)?;
    let model_path = data_path(&app, &model)?;
    if !server_path.is_file() {
        return Err("llama-server is not installed yet.".into());
    }
    if !model_path.is_file() {
        return Err("The model file is not downloaded yet.".into());
    }
    let port = free_port()?;
    let mut cmd = Command::new(&server_path);
    cmd.args([
        "--host", "127.0.0.1",
        "--port", &port.to_string(),
        "-m", &model_path.to_string_lossy(),
        "-c", &context.unwrap_or(8192).to_string(),
        "-ngl", &gpu_layers.unwrap_or(999).to_string(),
        "--jinja",
    ])
    .stdin(Stdio::null())
    .stdout(Stdio::null())
    .stderr(Stdio::null());
    if let Some(dir) = server_path.parent() {
        // CUDA and Vulkan builds load their DLLs / shared libraries from beside the binary.
        cmd.current_dir(dir);
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
    }
    let child = cmd.spawn().map_err(|e| format!("Could not start llama-server: {e}"))?;
    let model_name = model_path.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default();
    *state.0.lock().unwrap() = Some(Running { child, port, model: model_name });

    let health = format!("http://127.0.0.1:{port}/health");
    let client = reqwest::Client::new();
    for _ in 0..300 {
        tokio::time::sleep(Duration::from_millis(1000)).await;
        {
            let mut guard = state.0.lock().unwrap();
            if let Some(r) = guard.as_mut() {
                if let Ok(Some(code)) = r.child.try_wait() {
                    *guard = None;
                    return Err(format!("llama-server exited while loading the model ({code}). The model may be too large for this machine."));
                }
            }
        }
        if let Ok(res) = client.get(&health).timeout(Duration::from_secs(2)).send().await {
            if res.status().is_success() {
                return Ok(status_of(&state.0.lock().unwrap()));
            }
        }
    }
    stop_now(&app);
    Err("llama-server did not become ready within 5 minutes.".into())
}

#[tauri::command]
pub fn stop_llama(app: AppHandle) -> LlamaStatus {
    stop_now(&app);
    status_of(&None)
}

#[tauri::command]
pub fn llama_status(state: State<'_, LlamaState>) -> LlamaStatus {
    let mut guard = state.0.lock().unwrap();
    if let Some(r) = guard.as_mut() {
        if let Ok(Some(_)) = r.child.try_wait() {
            *guard = None;
        }
    }
    status_of(&guard)
}

pub fn stop_now(app: &AppHandle) {
    if let Some(state) = app.try_state::<LlamaState>() {
        if let Some(mut r) = state.0.lock().unwrap().take() {
            r.child.kill().ok();
            r.child.wait().ok();
        }
    }
}
