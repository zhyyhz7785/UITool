/**
 * 前端与内核之间的接口约定。界面只依赖这里的方法名和数据形状。
 * 内核（core/ 目录下的 Rust crate）实现同名方法；浏览器里由 mock.ts 模拟。
 * 新增功能：在 CoreMethods / CoreEvents 里加一项，再在 Rust 的 Core::call 和 mock.ts 各实现一次。
 */

export interface TreeNode {
  name: string;
  path: string;
  kind: "file" | "dir";
  children?: TreeNode[];
}

export interface AppInfo {
  name: string;
  version: string;
  core: string;
  platform: string;
}

/** 一个字。置信度 0～1；低于 0.7 可能错误，低于 0.9 可能有误。 */
export interface OcrGlyph {
  ch: string;
  conf: number;
}

export interface OcrLine {
  glyphs: OcrGlyph[];
}

/** `ocr.open` 的返回。busy 表示 PDF 还在逐页。 */
export interface OcrDocument {
  status: "busy" | "ready" | "empty" | "nomodel";
  source: "image" | "pdf";
  path: string;
  engine: string;
  pageCount: number;
  page: number;
  pages: OcrLine[][];
}

export interface OcrOpenParams {
  source: "image" | "pdf";
  path?: string;
}

/** 方法：名字 → 参数 / 返回值 */
export interface CoreMethods {
  "app.info": { params: void; result: AppInfo };
  "workspace.tree": { params: void; result: TreeNode[] };
  "file.read": { params: { path: string }; result: { path: string; text: string } };
  "task.run": { params: { name: string; steps?: number }; result: { taskId: string } };
  "ocr.open": { params: OcrOpenParams; result: OcrDocument };
  "ocr.copy": { params: void; result: { text: string } };
  "ocr.save": { params: { format?: string } | void; result: { path: string; text: string } };
  echo: { params: unknown; result: unknown };
}

/** 事件：内核主动推给界面 */
export interface CoreEvents {
  log: { level: "info" | "warn" | "error"; message: string; time: number };
  "task.progress": { taskId: string; name: string; done: number; total: number; finished: boolean };
  "ocr.progress": { source: "image" | "pdf"; page: number; pageCount: number };
  "ocr.result": OcrDocument;
}

export type CoreMethod = keyof CoreMethods;
export type CoreEvent = keyof CoreEvents;

export interface CoreError {
  code: string;
  message: string;
}
