//! 外壳：界面 → invoke("core_call") → Core::call；Core 的事件 → 前端事件 "core://event"。

use app_core::{AppMeta, Core, CoreError, EventSink};
use serde_json::{json, Value};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager, State};

struct TauriSink(AppHandle);

impl EventSink for TauriSink {
    fn emit(&self, event: &str, data: Value) {
        let _ = self.0.emit("core://event", json!({ "event": event, "data": data }));
    }
}

/// 界面调用内核的唯一命令。放到阻塞线程池里执行，不卡界面。
#[tauri::command]
async fn core_call(core: State<'_, Arc<Core>>, method: String, params: Option<Value>) -> Result<Value, CoreError> {
    let core = core.inner().clone();
    tauri::async_runtime::spawn_blocking(move || core.call(&method, params.unwrap_or(Value::Null)))
        .await
        .map_err(|e| CoreError::new("internal", e.to_string()))?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let info = app.package_info();
            let meta = AppMeta { name: info.name.clone(), version: info.version.to_string() };
            let core = Core::new(Arc::new(TauriSink(app.handle().clone())), meta);
            app.manage(Arc::new(core));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![core_call])
        .run(tauri::generate_context!())
        .expect("启动失败");
}
