//! ZeroRoll PC app. The web app runs unchanged in the window; this side adds what a
//! browser cannot do: look at the machine and talk to Ollama on localhost, so the
//! router's basic tier can use a local model.

mod ollama;
mod system;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ollama::Pulls::default())
        .invoke_handler(tauri::generate_handler![
            system::system_check,
            ollama::ollama_status,
            ollama::ollama_start,
            ollama::open_ollama_download,
            ollama::ollama_pull,
            ollama::cancel_pull,
            ollama::ollama_chat,
        ])
        .run(tauri::generate_context!())
        .expect("error while running ZeroRoll");
}
