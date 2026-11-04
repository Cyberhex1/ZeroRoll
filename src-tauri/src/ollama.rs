//! Talks to Ollama (https://ollama.com) on 127.0.0.1:11434. The player installs Ollama;
//! the app checks it is running, pulls models through it (Ollama checks every layer's
//! SHA-256 itself and resumes interrupted pulls), and sends the basic tier's chats to it.
//! The calls go through Rust so the webview's origin never hits Ollama's CORS rules.

use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{AppHandle, Emitter, State};

const BASE: &str = "http://127.0.0.1:11434";
const NOT_RUNNING: &str = "Ollama is not running on this PC. Start the Ollama app (or install it from ollama.com/download) and try again.";

#[derive(Default)]
pub struct Pulls(Mutex<HashMap<String, Arc<AtomicBool>>>);

#[derive(Serialize)]
pub struct OllamaStatus {
    pub running: bool,
    pub version: Option<String>,
    /// Installed model tags, e.g. "gemma3:12b".
    pub models: Vec<String>,
}

#[derive(Serialize, Clone)]
struct Progress<'a> {
    id: &'a str,
    received: u64,
    total: Option<u64>,
    stage: &'a str,
    status: &'a str,
}

fn client(timeout: Duration) -> Result<reqwest::Client, String> {
    // No proxy: Ollama is on localhost, and a system proxy would only get in the way.
    reqwest::Client::builder().no_proxy().timeout(timeout).build().map_err(|e| e.to_string())
}

fn conn_err(e: reqwest::Error) -> String {
    if e.is_connect() { NOT_RUNNING.into() } else if e.is_timeout() { format!("timeout: Ollama took too long to answer ({e}).") } else { format!("Ollama request failed: {e}") }
}

async fn error_text(res: reqwest::Response) -> String {
    let status = res.status();
    let body = res.text().await.unwrap_or_default();
    let msg = serde_json::from_str::<Value>(&body).ok().and_then(|v| v["error"].as_str().map(String::from)).unwrap_or(body);
    format!("Ollama error ({status}): {msg}")
}

#[tauri::command]
pub async fn ollama_status() -> OllamaStatus {
    let Ok(c) = client(Duration::from_secs(3)) else { return OllamaStatus { running: false, version: None, models: vec![] } };
    let version = match c.get(format!("{BASE}/api/version")).send().await {
        Ok(r) if r.status().is_success() => r.json::<Value>().await.ok().and_then(|v| v["version"].as_str().map(String::from)),
        _ => return OllamaStatus { running: false, version: None, models: vec![] },
    };
    let models = match c.get(format!("{BASE}/api/tags")).send().await {
        Ok(r) => r
            .json::<Value>()
            .await
            .ok()
            .and_then(|v| v["models"].as_array().map(|a| a.iter().filter_map(|m| m["name"].as_str().map(String::from)).collect()))
            .unwrap_or_default(),
        Err(_) => vec![],
    };
    OllamaStatus { running: true, version, models }
}

/// Starts `ollama serve` when Ollama is installed but not running. Returns once it answers.
#[tauri::command]
pub async fn ollama_start() -> Result<OllamaStatus, String> {
    if ollama_status().await.running {
        return Ok(ollama_status().await);
    }
    #[allow(unused_mut)]
    let mut candidates = vec![std::path::PathBuf::from("ollama")];
    #[cfg(windows)]
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        candidates.insert(0, std::path::Path::new(&local).join("Programs").join("Ollama").join("ollama.exe"));
    }
    #[cfg(target_os = "macos")]
    candidates.insert(0, "/Applications/Ollama.app/Contents/Resources/ollama".into());
    let mut started = false;
    for exe in candidates {
        let mut cmd = Command::new(&exe);
        cmd.arg("serve").stdin(std::process::Stdio::null()).stdout(std::process::Stdio::null()).stderr(std::process::Stdio::null());
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
        }
        if cmd.spawn().is_ok() {
            started = true;
            break;
        }
    }
    if !started {
        return Err("Ollama is not installed. Get it from ollama.com/download, then press Check again.".into());
    }
    for _ in 0..20 {
        tokio::time::sleep(Duration::from_millis(500)).await;
        let s = ollama_status().await;
        if s.running {
            return Ok(s);
        }
    }
    Err("Ollama was started but did not answer within 10 seconds.".into())
}

/// Opens Ollama's download page in the default browser.
#[tauri::command]
pub fn open_ollama_download() -> Result<(), String> {
    let url = "https://ollama.com/download";
    #[cfg(windows)]
    let r = {
        use std::os::windows::process::CommandExt;
        Command::new("cmd").args(["/C", "start", "", url]).creation_flags(0x0800_0000).spawn()
    };
    #[cfg(target_os = "macos")]
    let r = Command::new("open").arg(url).spawn();
    #[cfg(all(unix, not(target_os = "macos")))]
    let r = Command::new("xdg-open").arg(url).spawn();
    r.map(|_| ()).map_err(|e| e.to_string())
}

/// Pulls a model, emitting `download-progress` events with the given `id`. Pausing stops
/// the stream; Ollama keeps the layers it has and resumes them on the next pull.
#[tauri::command]
pub async fn ollama_pull(app: AppHandle, pulls: State<'_, Pulls>, id: String, model: String) -> Result<(), String> {
    let cancel = Arc::new(AtomicBool::new(false));
    pulls.0.lock().unwrap().insert(id.clone(), cancel.clone());
    let result = async {
        let c = client(Duration::from_secs(60 * 60 * 6))?;
        let res = c.post(format!("{BASE}/api/pull")).json(&json!({ "model": model, "stream": true })).send().await.map_err(conn_err)?;
        if !res.status().is_success() {
            return Err(error_text(res).await);
        }
        let mut stream = res.bytes_stream();
        let mut buf: Vec<u8> = vec![];
        while let Some(chunk) = stream.next().await {
            if cancel.load(Ordering::Relaxed) {
                return Err("cancelled".into());
            }
            buf.extend_from_slice(&chunk.map_err(|e| format!("Download interrupted: {e}"))?);
            while let Some(pos) = buf.iter().position(|&b| b == b'\n') {
                let line: Vec<u8> = buf.drain(..=pos).collect();
                let Ok(v) = serde_json::from_slice::<Value>(&line) else { continue };
                if let Some(err) = v["error"].as_str() {
                    return Err(format!("Ollama could not download {model}: {err}"));
                }
                let status = v["status"].as_str().unwrap_or("");
                let stage = if status == "success" { "done" } else if status.starts_with("verifying") || status.starts_with("writing") { "verifying" } else { "downloading" };
                app.emit(
                    "download-progress",
                    Progress { id: &id, received: v["completed"].as_u64().unwrap_or(0), total: v["total"].as_u64(), stage, status },
                )
                .ok();
                if status == "success" {
                    return Ok(());
                }
            }
        }
        Err(format!("Ollama stopped before {model} finished downloading. Press Download again to resume."))
    }
    .await;
    pulls.0.lock().unwrap().remove(&id);
    result
}

#[tauri::command]
pub fn cancel_pull(pulls: State<'_, Pulls>, id: String) -> bool {
    if let Some(flag) = pulls.0.lock().unwrap().get(&id) {
        flag.store(true, Ordering::Relaxed);
        return true;
    }
    false
}

#[derive(Deserialize)]
pub struct ChatRequest {
    model: String,
    system: Option<String>,
    messages: Vec<Value>,
    temperature: Option<f64>,
    max_tokens: Option<u32>,
    num_ctx: Option<u32>,
    json: Option<bool>,
    timeout_ms: Option<u64>,
}

#[derive(Serialize)]
pub struct ChatReply {
    text: String,
    truncated: bool,
}

/// One non-streaming chat turn through Ollama's /api/chat.
#[tauri::command]
pub async fn ollama_chat(req: ChatRequest) -> Result<ChatReply, String> {
    let c = client(Duration::from_millis(req.timeout_ms.unwrap_or(90_000)))?;
    let mut messages = vec![];
    if let Some(s) = req.system.filter(|s| !s.is_empty()) {
        messages.push(json!({ "role": "system", "content": s }));
    }
    messages.extend(req.messages);
    let mut body = json!({
        "model": req.model,
        "messages": messages,
        "stream": false,
        "options": {
            "temperature": req.temperature.unwrap_or(0.8),
            "num_predict": req.max_tokens.unwrap_or(1024),
            "num_ctx": req.num_ctx.unwrap_or(8192),
        },
    });
    if req.json.unwrap_or(false) {
        body["format"] = json!("json");
    }
    let res = c.post(format!("{BASE}/api/chat")).json(&body).send().await.map_err(conn_err)?;
    if !res.status().is_success() {
        return Err(error_text(res).await);
    }
    let v: Value = res.json().await.map_err(|e| format!("Ollama sent an unreadable reply: {e}"))?;
    Ok(ChatReply {
        text: v["message"]["content"].as_str().unwrap_or("").to_string(),
        truncated: v["done_reason"].as_str() == Some("length"),
    })
}
