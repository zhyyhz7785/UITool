/// 把导出的 zip / 设计文件写到用户在保存对话框里选的路径。
#[tauri::command]
fn write_file(path: String, data: Vec<u8>) -> Result<(), String> {
    if let Some(dir) = std::path::Path::new(&path).parent() {
        std::fs::create_dir_all(dir).map_err(|e| format!("创建目录失败：{e}"))?;
    }
    std::fs::write(&path, data).map_err(|e| format!("写入 {path} 失败：{e}"))
}

/// 读连接对面的界面规格。界面侧先限定路径。
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| format!("读取 {path} 失败：{e}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![write_file, read_file])
        .run(tauri::generate_context!())
        .expect("启动 UITool 失败");
}
