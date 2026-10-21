//! 内核。
//!
//! 界面只通过两件事和内核打交道：
//! - `Core::call(method, params)`：方法调用，参数和返回值都是 JSON；
//! - `EventSink::emit(event, data)`：内核主动推送事件。
//!
//! 方法名与数据形状的约定在前端 `src/core/contract.ts`，两边保持一致。
//! 新增功能：在 `Core::call` 的 match 里加一个分支，再在 contract.ts 加类型、mock.ts 加模拟。

use serde::Serialize;
use serde_json::{json, Value};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

/// 事件出口。Tauri 外壳把它转成前端事件；测试里可以换成收集器。
pub trait EventSink: Send + Sync + 'static {
    fn emit(&self, event: &str, data: Value);
}

#[derive(Debug, Clone, Serialize)]
pub struct CoreError {
    pub code: String,
    pub message: String,
}

impl CoreError {
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self { code: code.into(), message: message.into() }
    }
    pub fn not_found(method: &str) -> Self {
        Self::new("not_found", format!("内核没有方法：{method}"))
    }
    pub fn bad_params(message: impl Into<String>) -> Self {
        Self::new("bad_params", message)
    }
}

impl std::fmt::Display for CoreError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}: {}", self.code, self.message)
    }
}

impl std::error::Error for CoreError {}

pub type CoreResult = Result<Value, CoreError>;

#[derive(Debug, Clone)]
pub struct AppMeta {
    pub name: String,
    pub version: String,
}

pub struct Core {
    meta: AppMeta,
    sink: Arc<dyn EventSink>,
    seq: AtomicU64,
}

impl Core {
    pub fn new(sink: Arc<dyn EventSink>, meta: AppMeta) -> Self {
        Self { meta, sink, seq: AtomicU64::new(0) }
    }

    /// 唯一的方法入口。
    pub fn call(&self, method: &str, params: Value) -> CoreResult {
        match method {
            "app.info" => Ok(json!({
                "name": self.meta.name,
                "version": self.meta.version,
                "core": "rust",
                "platform": std::env::consts::OS,
            })),
            "workspace.tree" => Ok(demo_tree()),
            "file.read" => {
                let path = params.get("path").and_then(Value::as_str).ok_or_else(|| CoreError::bad_params("缺少 path"))?;
                Ok(json!({ "path": path, "text": format!("// {path}\n// 由 Rust 内核返回。在 core/src/lib.rs 里改成真实读取。\n") }))
            }
            "task.run" => self.task_run(&params),
            "ocr.open" => self.ocr_open(&params),
            "ocr.copy" => Ok(json!({ "text": last_ocr_text() })),
            "ocr.save" => {
                let format = params.get("format").and_then(Value::as_str).unwrap_or("md");
                let ext = if format == "txt" { "txt" } else if format == "hocr" { "hocr" } else { "md" };
                let stem = last_ocr_path().trim_end_matches(|c: char| c != '.').trim_end_matches('.').to_string();
                let stem = if stem.is_empty() { "附图".to_string() } else { stem };
                self.log("info", format!("已保存 {stem}.{ext}（未写文件）"));
                Ok(json!({ "path": format!("{stem}.{ext}"), "text": last_ocr_text() }))
            }
            "echo" => Ok(params),
            _ => Err(CoreError::not_found(method)),
        }
    }

    /// 图片立刻返回样例；PDF 先回报忙，再逐页推进度。不跑识别模型。
    fn ocr_open(&self, params: &Value) -> CoreResult {
        let source = params.get("source").and_then(Value::as_str).unwrap_or("image");
        let source = if source == "pdf" { "pdf" } else { "image" };
        let path = params.get("path").and_then(Value::as_str).unwrap_or(if source == "pdf" { "扫描件.pdf" } else { "附图.jpg" });
        if path == "nomodel" {
            let doc = ocr_doc("nomodel", source, path, 0, json!([]));
            store_ocr(path, "");
            self.sink.emit("ocr.result", doc.clone());
            self.log("info", "未找到 OCR 模型");
            return Ok(doc);
        }
        if path == "empty" {
            let doc = ocr_doc("empty", source, path, 1, json!([]));
            store_ocr(path, "");
            self.sink.emit("ocr.result", doc.clone());
            self.log("info", "没有识别到文字");
            return Ok(doc);
        }
        let pages = if source == "pdf" { 3 } else { 1 };
        if source == "pdf" {
            let busy = ocr_doc("busy", source, path, pages, json!([]));
            self.sink.emit("ocr.progress", json!({ "source": source, "page": 0, "pageCount": pages }));
            let sink = self.sink.clone();
            let path_owned = path.to_string();
            thread::spawn(move || {
                for page in 1..=pages {
                    thread::sleep(Duration::from_millis(180));
                    sink.emit("ocr.progress", json!({ "source": "pdf", "page": page, "pageCount": pages }));
                }
                let ready = ocr_doc("ready", "pdf", &path_owned, pages, ocr_pages(true));
                store_ocr(&path_owned, &ocr_plain(&ready));
                sink.emit("ocr.result", ready);
                sink.emit("log", json!({ "level": "info", "message": format!("识别完成：{path_owned}"), "time": now_ms() }));
            });
            return Ok(busy);
        }
        let ready = ocr_doc("ready", source, path, pages, ocr_pages(false));
        store_ocr(path, &ocr_plain(&ready));
        self.sink.emit("ocr.result", ready.clone());
        self.log("info", format!("识别完成：{path}"));
        Ok(ready)
    }

    pub fn log(&self, level: &str, message: impl Into<String>) {
        self.sink.emit("log", json!({ "level": level, "message": message.into(), "time": now_ms() }));
    }

    /// 示例长任务：后台线程推进度事件。
    fn task_run(&self, params: &Value) -> CoreResult {
        let name = params.get("name").and_then(Value::as_str).unwrap_or("任务").to_string();
        let total = params.get("steps").and_then(Value::as_u64).unwrap_or(5).clamp(1, 1000);
        let task_id = format!("task-{}", self.seq.fetch_add(1, Ordering::Relaxed) + 1);
        self.log("info", format!("开始任务：{name}"));
        let sink = self.sink.clone();
        let id = task_id.clone();
        thread::spawn(move || {
            for done in 1..=total {
                thread::sleep(Duration::from_millis(400));
                sink.emit("task.progress", json!({ "taskId": id, "name": name, "done": done, "total": total, "finished": done == total }));
            }
            sink.emit("log", json!({ "level": "info", "message": format!("任务完成：{name}"), "time": now_ms() }));
        });
        Ok(json!({ "taskId": task_id }))
    }
}

fn last_slot() -> &'static Mutex<(String, String)> {
    static SLOT: Mutex<(String, String)> = Mutex::new((String::new(), String::new()));
    &SLOT
}

fn store_ocr(path: &str, text: &str) {
    *last_slot().lock().unwrap() = (path.to_string(), text.to_string());
}

fn last_ocr_text() -> String {
    last_slot().lock().unwrap().1.clone()
}

fn last_ocr_path() -> String {
    let path = last_slot().lock().unwrap().0.clone();
    if path.is_empty() { "附图.jpg".into() } else { path }
}

fn ocr_doc(status: &str, source: &str, path: &str, page_count: u32, pages: Value) -> Value {
    json!({
        "status": status,
        "source": source,
        "path": path,
        "engine": "ppocrv6-small",
        "pageCount": page_count,
        "page": 0,
        "pages": pages
    })
}

fn ocr_line(text: &str, marks: &[(usize, f64)]) -> Value {
    let glyphs: Vec<Value> = text.chars().enumerate().map(|(i, ch)| {
        let conf = marks.iter().find(|(n, _)| *n == i).map(|(_, c)| *c).unwrap_or(0.98);
        json!({ "ch": ch.to_string(), "conf": conf })
    }).collect();
    json!({ "glyphs": glyphs })
}

fn ocr_pages(pdf: bool) -> Value {
    let clinic = json!([
        ocr_line("市第一医院 · 内科门诊", &[]),
        ocr_line("门诊病历", &[]),
        ocr_line("姓名　张伟　　性别　男　　年龄　34", &[]),
        ocr_line("就诊日期　2026-03-18　　编号　A-1842", &[]),
        ocr_line("主诉　反复咳嗽三周，夜间加重。", &[(5, 0.83)]),
        ocr_line("现病史　无明显发热，偶有胸问，活动后气短。", &[(13, 0.51)]),
        ocr_line("体格检查　双肺呼吸音粗，未闻及湿罗音。", &[(16, 0.82)]),
        ocr_line("初步诊断　急性支气菅炎", &[(9, 0.44)]),
        ocr_line("处理　口服药物，三日后复诊。如加重请及时就诊。", &[(12, 0.74)])
    ]);
    if !pdf {
        return json!([clinic]);
    }
    json!([
        clinic,
        [ocr_line("检验报告", &[]), ocr_line("白细胞　6.2", &[]), ocr_line("中性粒比　0.71", &[(0, 0.62)])],
        [ocr_line("医嘱", &[]), ocr_line("多饮水，三日后复诊。", &[])]
    ])
}

fn ocr_plain(doc: &Value) -> String {
    let Some(pages) = doc.get("pages").and_then(Value::as_array) else { return String::new() };
    pages.iter().map(|page| {
        page.as_array().map(|lines| {
            lines.iter().map(|line| {
                line.get("glyphs").and_then(Value::as_array).map(|gs| {
                    gs.iter().filter_map(|g| g.get("ch").and_then(Value::as_str)).collect::<String>()
                }).unwrap_or_default()
            }).collect::<Vec<_>>().join("\n")
        }).unwrap_or_default()
    }).collect::<Vec<_>>().join("\n\n")
}

fn now_ms() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

fn demo_tree() -> Value {
    let file = |name: &str, path: &str| json!({ "name": name, "path": path, "kind": "file" });
    json!([
        { "name": "src", "path": "src", "kind": "dir", "children": [
            file("main.rs", "src/main.rs"),
            file("model.rs", "src/model.rs"),
            { "name": "solver", "path": "src/solver", "kind": "dir", "children": [file("mod.rs", "src/solver/mod.rs")] }
        ]},
        { "name": "docs", "path": "docs", "kind": "dir", "children": [file("说明.md", "docs/说明.md")] },
        file("README.md", "README.md"),
        file("Cargo.toml", "Cargo.toml")
    ])
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Mutex;

    #[derive(Default)]
    struct Collect(Mutex<Vec<String>>);
    impl EventSink for Collect {
        fn emit(&self, event: &str, _data: Value) {
            self.0.lock().unwrap().push(event.to_string());
        }
    }

    fn core() -> (Core, Arc<Collect>) {
        let sink = Arc::new(Collect::default());
        (Core::new(sink.clone(), AppMeta { name: "t".into(), version: "0".into() }), sink)
    }

    #[test]
    fn echo_and_unknown() {
        let (c, _) = core();
        assert_eq!(c.call("echo", json!({"a": 1})).unwrap(), json!({"a": 1}));
        assert_eq!(c.call("nope", Value::Null).unwrap_err().code, "not_found");
    }

    #[test]
    fn ocr_image_is_ready() {
        let (c, sink) = core();
        let doc = c.call("ocr.open", json!({"source": "image", "path": "附图.jpg"})).unwrap();
        assert_eq!(doc["engine"], "ppocrv6-small");
        assert_eq!(doc["status"], "ready");
        let text = c.call("ocr.copy", Value::Null).unwrap();
        assert!(text["text"].as_str().unwrap().contains("门诊病历"));
        let saved = c.call("ocr.save", json!({"format": "txt"})).unwrap();
        assert_eq!(saved["path"], "附图.txt");
        let events = sink.0.lock().unwrap();
        assert!(events.iter().any(|e| e == "ocr.result"));
    }

    #[test]
    fn ocr_pdf_emits_progress() {
        let (c, sink) = core();
        let doc = c.call("ocr.open", json!({"source": "pdf", "path": "扫描件.pdf"})).unwrap();
        assert_eq!(doc["status"], "busy");
        thread::sleep(Duration::from_millis(800));
        let events = sink.0.lock().unwrap();
        assert!(events.iter().any(|e| e == "ocr.progress"));
        assert!(events.iter().any(|e| e == "ocr.result"));
    }

    #[test]
    fn task_emits_progress() {
        let (c, sink) = core();
        c.call("task.run", json!({"name": "x", "steps": 1})).unwrap();
        thread::sleep(Duration::from_millis(700));
        let events = sink.0.lock().unwrap();
        assert!(events.iter().any(|e| e == "task.progress"));
    }
}
