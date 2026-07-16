use std::fs;
use tauri::Manager;

#[tauri::command]
fn save_media(app: tauri::AppHandle, name: String, data: Vec<u8>) -> Result<String, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("media");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    fs::write(dir.join(&name), data).map_err(|e| e.to_string())?;
    Ok(name)
}

#[tauri::command]
fn delete_media(app: tauri::AppHandle, name: String) -> Result<(), String> {
    let path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("media")
        .join(&name);
    let _ = fs::remove_file(path);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![save_media, delete_media])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
