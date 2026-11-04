//! Resumable, SHA-256-checked downloads into the app data folder.
//!
//! Bytes go to `<dest>.part`; an interrupted download resumes with an HTTP Range request.
//! The file is renamed into place only after its hash matches, so a half-written or
//! tampered model is never loaded.

use futures_util::StreamExt;
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, State};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

use crate::data_path;

#[derive(Default)]
pub struct Downloads(Mutex<HashMap<String, Arc<AtomicBool>>>);

#[derive(Serialize, Clone)]
struct Progress<'a> {
    id: &'a str,
    received: u64,
    total: Option<u64>,
    stage: &'a str,
}

async fn hash_existing(path: &std::path::Path, hasher: &mut Sha256) -> Result<u64, String> {
    let mut f = tokio::fs::File::open(path).await.map_err(|e| e.to_string())?;
    let mut buf = vec![0u8; 1 << 20];
    let mut n_total = 0u64;
    loop {
        let n = f.read(&mut buf).await.map_err(|e| e.to_string())?;
        if n == 0 {
            break;
        }
        hasher.update(&buf[..n]);
        n_total += n as u64;
    }
    Ok(n_total)
}

/// Downloads `url` to `dest` (relative to the app data folder) and checks it against
/// `sha256` (hex). Emits `download-progress` events with the given `id`.
#[tauri::command]
pub async fn download_file(
    app: AppHandle,
    downloads: State<'_, Downloads>,
    id: String,
    url: String,
    dest: String,
    sha256: String,
) -> Result<String, String> {
    let expected = sha256.trim().to_lowercase();
    if expected.len() != 64 || !expected.chars().all(|c| c.is_ascii_hexdigit()) {
        return Err("Refusing to download without a valid SHA-256 to check it against.".into());
    }
    if !url.starts_with("https://") {
        return Err("Only https downloads are allowed.".into());
    }
    let final_path = data_path(&app, &dest)?;
    if let Some(parent) = final_path.parent() {
        tokio::fs::create_dir_all(parent).await.map_err(|e| e.to_string())?;
    }
    let part_path = final_path.with_extension(format!(
        "{}part",
        final_path.extension().map(|e| format!("{}.", e.to_string_lossy())).unwrap_or_default()
    ));

    let cancel = Arc::new(AtomicBool::new(false));
    downloads.0.lock().unwrap().insert(id.clone(), cancel.clone());

    let result = async {
        // Re-hash what is already on disk so a resumed file is checked end to end.
        let mut hasher = Sha256::new();
        let mut received = if part_path.exists() { hash_existing(&part_path, &mut hasher).await? } else { 0 };

        let client = reqwest::Client::builder().user_agent("ZeroRoll-desktop").build().map_err(|e| e.to_string())?;
        let mut req = client.get(&url);
        if received > 0 {
            req = req.header(reqwest::header::RANGE, format!("bytes={received}-"));
        }
        let res = req.send().await.map_err(|e| format!("Download failed: {e}"))?;
        let status = res.status();
        if status == reqwest::StatusCode::RANGE_NOT_SATISFIABLE {
            // The part file is already complete (or larger than the source): verify it below.
        } else if !status.is_success() {
            return Err(format!("Download failed: HTTP {status}"));
        } else if received > 0 && status != reqwest::StatusCode::PARTIAL_CONTENT {
            // The server ignored the Range header; start over.
            received = 0;
            hasher = Sha256::new();
            tokio::fs::remove_file(&part_path).await.ok();
        }
        let total = res.content_length().map(|n| n + received);

        if status != reqwest::StatusCode::RANGE_NOT_SATISFIABLE {
            let mut file = tokio::fs::OpenOptions::new().create(true).append(true).open(&part_path).await.map_err(|e| e.to_string())?;
            let mut stream = res.bytes_stream();
            let mut last_emit = 0u64;
            while let Some(chunk) = stream.next().await {
                if cancel.load(Ordering::Relaxed) {
                    file.flush().await.ok();
                    return Err("cancelled".into());
                }
                let chunk = chunk.map_err(|e| format!("Download interrupted: {e}"))?;
                file.write_all(&chunk).await.map_err(|e| e.to_string())?;
                hasher.update(&chunk);
                received += chunk.len() as u64;
                if received - last_emit > 4 << 20 {
                    last_emit = received;
                    app.emit("download-progress", Progress { id: &id, received, total, stage: "downloading" }).ok();
                }
            }
            file.flush().await.map_err(|e| e.to_string())?;
        }

        app.emit("download-progress", Progress { id: &id, received, total, stage: "verifying" }).ok();
        let actual = hex::encode(hasher.finalize());
        if actual != expected {
            tokio::fs::remove_file(&part_path).await.ok();
            return Err(format!("The downloaded file did not match its checksum (expected {expected}, got {actual}). It was deleted; try again."));
        }
        tokio::fs::rename(&part_path, &final_path).await.map_err(|e| e.to_string())?;
        app.emit("download-progress", Progress { id: &id, received, total, stage: "done" }).ok();
        Ok(final_path.to_string_lossy().to_string())
    }
    .await;

    downloads.0.lock().unwrap().remove(&id);
    result
}

/// Stops a download; the `.part` file is kept so it can resume later.
#[tauri::command]
pub fn cancel_download(downloads: State<'_, Downloads>, id: String) -> bool {
    if let Some(flag) = downloads.0.lock().unwrap().get(&id) {
        flag.store(true, Ordering::Relaxed);
        return true;
    }
    false
}

#[tauri::command]
pub fn file_exists(app: AppHandle, path: String) -> Result<bool, String> {
    Ok(data_path(&app, &path)?.is_file())
}

/// Extracts a downloaded zip (the llama-server build) into a folder in the app data folder.
#[tauri::command]
pub fn extract_zip(app: AppHandle, zip: String, dest: String) -> Result<Vec<String>, String> {
    let zip_path = data_path(&app, &zip)?;
    let dest_dir = data_path(&app, &dest)?;
    std::fs::create_dir_all(&dest_dir).map_err(|e| e.to_string())?;
    let file = std::fs::File::open(&zip_path).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;
    let mut names = vec![];
    for i in 0..archive.len() {
        let mut entry = archive.by_index(i).map_err(|e| e.to_string())?;
        // enclosed_name rejects absolute paths and `..` (zip-slip).
        let Some(rel) = entry.enclosed_name() else { continue };
        // Flatten: llama.cpp zips sometimes nest everything under build/bin.
        let Some(fname) = rel.file_name() else { continue };
        if entry.is_dir() {
            continue;
        }
        let out_path = dest_dir.join(fname);
        let mut out = std::fs::File::create(&out_path).map_err(|e| e.to_string())?;
        std::io::copy(&mut entry, &mut out).map_err(|e| e.to_string())?;
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            if let Some(mode) = entry.unix_mode() {
                std::fs::set_permissions(&out_path, std::fs::Permissions::from_mode(mode & 0o755)).ok();
            }
        }
        names.push(fname.to_string_lossy().to_string());
    }
    Ok(names)
}
