/**
 * 浏览器里的模拟内核，返回和 Rust 内核相同形状的数据，方便只做界面时不启动 Tauri。
 * 与 core/src/lib.rs 保持同名同形。
 */
import type { CoreError, CoreEvents, CoreMethods, OcrDocument, TreeNode } from "./contract";
import type { Transport } from "./index";
import { buildOcrDocument, ocrPlain } from "./ocrSample";
import { ocrSession } from "./ocrSession";

type Handler = (data: unknown) => void;

const demoTree: TreeNode[] = [
  {
    name: "src",
    path: "src",
    kind: "dir",
    children: [
      { name: "main.rs", path: "src/main.rs", kind: "file" },
      { name: "model.rs", path: "src/model.rs", kind: "file" },
      { name: "solver", path: "src/solver", kind: "dir", children: [{ name: "mod.rs", path: "src/solver/mod.rs", kind: "file" }] }
    ]
  },
  { name: "docs", path: "docs", kind: "dir", children: [{ name: "说明.md", path: "docs/说明.md", kind: "file" }] },
  { name: "README.md", path: "README.md", kind: "file" },
  { name: "Cargo.toml", path: "Cargo.toml", kind: "file" }
];

export function createMockTransport(): Transport {
  const handlers = new Map<string, Set<Handler>>();
  const emit = <E extends keyof CoreEvents>(event: E, data: CoreEvents[E]) => handlers.get(event)?.forEach((h) => h(data));
  const log = (message: string, level: CoreEvents["log"]["level"] = "info") => emit("log", { level, message, time: Date.now() });
  let seq = 0;
  let job = 0;
  let last: OcrDocument | null = null;

  const publish = (doc: OcrDocument) => {
    last = doc;
    ocrSession.set(doc);
    emit("ocr.result", doc);
  };

  const methods: { [M in keyof CoreMethods]: (p: CoreMethods[M]["params"]) => CoreMethods[M]["result"] } = {
    "app.info": () => ({ name: document.title || "App", version: "0.1.0", core: "mock", platform: "browser" }),
    "workspace.tree": () => demoTree,
    "file.read": ({ path }) => ({ path, text: `// ${path}\n// 模拟内核返回的内容。接入真实内核后由 Rust 读取文件。\n\nfn main() {\n    println!("hello");\n}\n` }),
    "task.run": ({ name, steps = 5 }) => {
      const taskId = `task-${++seq}`;
      log(`开始任务：${name}`);
      let done = 0;
      const timer = setInterval(() => {
        done++;
        emit("task.progress", { taskId, name, done, total: steps, finished: done >= steps });
        if (done >= steps) {
          clearInterval(timer);
          log(`任务完成：${name}`);
        }
      }, 400);
      return { taskId };
    },
    "ocr.open": (params) => {
      const id = ++job;
      const opened = buildOcrDocument(params, "open");
      if (opened.status !== "busy") {
        publish(opened);
        log(opened.status === "ready" ? `识别完成：${opened.path}` : opened.status === "nomodel" ? "未找到 OCR 模型" : "没有识别到文字");
        return opened;
      }
      ocrSession.set(opened);
      emit("ocr.progress", { source: opened.source, page: 0, pageCount: opened.pageCount });
      let page = 0;
      const timer = setInterval(() => {
        if (id !== job) {
          clearInterval(timer);
          return;
        }
        page += 1;
        ocrSession.setProgress(page, opened.pageCount);
        emit("ocr.progress", { source: opened.source, page, pageCount: opened.pageCount });
        if (page >= opened.pageCount) {
          clearInterval(timer);
          const ready = buildOcrDocument(params, "done");
          publish(ready);
          log(`识别完成：${ready.path}`);
        }
      }, 180);
      return opened;
    },
    "ocr.copy": () => {
      const text = ocrPlain(last);
      ocrSession.notify("已复制");
      log(text ? "已复制识别文字" : "没有可复制的文字");
      return { text };
    },
    "ocr.save": (params) => {
      const format = params && "format" in params && params.format ? params.format : "md";
      const text = ocrPlain(last);
      const stem = (last?.path ?? "附图").replace(/\.[^.]+$/, "");
      const path = `${stem}.${format === "txt" ? "txt" : format === "hocr" ? "hocr" : "md"}`;
      ocrSession.notify(`已保存 · ${path}（稿，未写文件）`);
      log(`已保存 ${path}（未写文件）`);
      return { path, text };
    },
    echo: (p) => p
  };

  return {
    kind: "mock",
    async call(method, params) {
      await new Promise((r) => setTimeout(r, 30));
      const fn = (methods as Record<string, (p: unknown) => unknown>)[method];
      if (!fn) throw { code: "not_found", message: `内核没有方法：${method}` } satisfies CoreError;
      return fn(params);
    },
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(handler);
      return () => handlers.get(event)?.delete(handler);
    }
  };
}
