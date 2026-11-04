//! ZeroRoll PC app. The web app runs unchanged in the window; this side adds what a
//! browser cannot do: look at the machine, download a local model and a llama-server
//! build (resumable, SHA-256 checked), and run llama-server on localhost so the router's
//! basic tier can use it. Every file it touches lives under the app data folder.

mod download;
mod llama;
mod system;

use std::path::{Component, Path, PathBuf};
use tauri::{Manager, RunEvent};

/// Resolves a path the web side gave us inside the app data folder, refusing anything
/// absolute or with `..`, so the frontend can never read or write outside it.
pub(crate) fn data_path(app: &tauri::AppHandle, rel: &str) -> Result<PathBuf, String> {
    let base = app.path().app_data_dir().map_err(|e| e.to_string())?;
    safe_join(&base, rel)
}

fn safe_join(base: &Path, rel: &str) -> Result<PathBuf, String> {
    let rel_path = Path::new(rel);
    if rel.is_empty() || rel_path.is_absolute() || rel_path.components().any(|c| !matches!(c, Component::Normal(_))) {
        return Err(format!("Refused path outside the app folder: {rel}"));
    }
    Ok(base.join(rel_path))
}

#[cfg(test)]
mod tests {
    use super::safe_join;
    use std::path::Path;

    #[test]
    fn keeps_paths_inside_the_app_folder() {
        let base = Path::new("/data/zeroroll");
        assert_eq!(safe_join(base, "models/m.gguf").unwrap(), base.join("models/m.gguf"));
        for bad in ["", "../x", "models/../../x", "/etc/passwd", "./x"] {
            assert!(safe_join(base, bad).is_err(), "{bad} should be refused");
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .manage(llama::LlamaState::default())
        .manage(download::Downloads::default())
        .invoke_handler(tauri::generate_handler![
            system::system_check,
            download::download_file,
            download::cancel_download,
            download::extract_zip,
            download::file_exists,
            llama::start_llama,
            llama::stop_llama,
            llama::llama_status,
        ])
        .build(tauri::generate_context!())
        .expect("error while building ZeroRoll");

    app.run(|handle, event| {
        // Never leave llama-server running after the window closes.
        if let RunEvent::Exit = event {
            llama::stop_now(handle);
        }
    });
}
