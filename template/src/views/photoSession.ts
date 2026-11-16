import type { CommandHandler } from "../workbench/types";

/** 图片编辑面和「图像」预设共用的命令 id。弹窗三个不进 handlers，交给工作台打开。 */
export const CMD = {
  open: "photo.open",
  save: "photo.save",
  saveCopy: "photo.saveCopy",
  copyClip: "photo.copyClip",
  batch: "photo.batch",
  undo: "edit.undo",
  redo: "edit.redo",
  selectAll: "photo.selectAll",
  applySel: "photo.applySel",
  applyAll: "photo.applyAll",
  copyParams: "photo.copyParams",
  pasteParams: "photo.pasteParams",
  params: "photo.params",
  replaceMd: "photo.replaceMd",
  clearOthers: "photo.clearOthers",
  toggleQueue: "photo.toggleQueue",
  modeCrop: "photo.mode.crop",
  modeAdjust: "photo.mode.adjust",
  modeFilter: "photo.mode.filter",
  modeMarkup: "photo.mode.markup",
  modeErase: "photo.mode.erase",
  modeBg: "photo.mode.bg",
  modeScan: "photo.mode.scan",
  modeExport: "photo.mode.export",
  rotL: "photo.rotL",
  rotR: "photo.rotR",
  flipH: "photo.flipH",
  flipV: "photo.flipV",
  swap: "photo.swap",
  cropDone: "photo.cropDone",
  cropCancel: "photo.cropCancel",
  help: "photo.help"
} as const;

export type PhotoMode = "crop" | "adjust" | "filter" | "markup" | "erase" | "bg" | "scan" | "export";
export type PhotoBar = "top" | "side" | "stack";

export const PHOTO_MODES: { id: PhotoMode; cmd: string; name: string; icon: string }[] = [
  { id: "crop", cmd: CMD.modeCrop, name: "裁剪", icon: "crop" },
  { id: "adjust", cmd: CMD.modeAdjust, name: "调整", icon: "contrast" },
  { id: "filter", cmd: CMD.modeFilter, name: "滤镜", icon: "filter" },
  { id: "markup", cmd: CMD.modeMarkup, name: "标记", icon: "brush" },
  { id: "erase", cmd: CMD.modeErase, name: "擦除", icon: "eraser" },
  { id: "bg", cmd: CMD.modeBg, name: "背景", icon: "image" },
  { id: "scan", cmd: CMD.modeScan, name: "扫描件", icon: "search" },
  { id: "export", cmd: CMD.modeExport, name: "导出", icon: "export" }
];

export function photoBar(data: unknown): PhotoBar {
  const bar = data && typeof data === "object" && "bar" in data ? (data as { bar?: unknown }).bar : "";
  return bar === "side" || bar === "stack" ? bar : "top";
}

export type PhotoCmd =
  | { t: "mode"; mode: PhotoMode }
  | { t: "queue" }
  | { t: "hint"; text: string }
  | { t: "selectAll" }
  | { t: "clear" }
  | { t: "open" }
  | { t: "rot"; dir: -1 | 1 }
  | { t: "flip"; axis: "h" | "v" }
  | { t: "swap" }
  | { t: "crop"; done: boolean };

const listeners = new Set<(cmd: PhotoCmd) => void>();

export function emitPhoto(cmd: PhotoCmd) {
  listeners.forEach((fn) => fn(cmd));
}

export function subscribePhoto(fn: (cmd: PhotoCmd) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const hint = (text: string): CommandHandler => () => emitPhoto({ t: "hint", text });

export const photoHandlers: Record<string, CommandHandler> = {
  [CMD.open]: () => emitPhoto({ t: "open" }),
  [CMD.save]: hint("已保存（示意）"),
  [CMD.saveCopy]: hint("已另存副本（示意）"),
  [CMD.copyClip]: hint("已复制到剪贴板（示意）"),
  [CMD.undo]: hint("已撤销（示意）"),
  [CMD.redo]: hint("已重做（示意）"),
  [CMD.selectAll]: () => emitPhoto({ t: "selectAll" }),
  [CMD.applySel]: hint("已应用到选中（示意）"),
  [CMD.applyAll]: hint("已应用到全部（示意）"),
  [CMD.copyParams]: hint("已复制参数（示意）"),
  [CMD.pasteParams]: hint("已粘贴参数（示意）"),
  [CMD.replaceMd]: hint("已替换文稿引用（示意）"),
  [CMD.clearOthers]: () => emitPhoto({ t: "clear" }),
  [CMD.toggleQueue]: () => emitPhoto({ t: "queue" }),
  [CMD.modeCrop]: () => emitPhoto({ t: "mode", mode: "crop" }),
  [CMD.modeAdjust]: () => emitPhoto({ t: "mode", mode: "adjust" }),
  [CMD.modeFilter]: () => emitPhoto({ t: "mode", mode: "filter" }),
  [CMD.modeMarkup]: () => emitPhoto({ t: "mode", mode: "markup" }),
  [CMD.modeErase]: () => emitPhoto({ t: "mode", mode: "erase" }),
  [CMD.modeBg]: () => emitPhoto({ t: "mode", mode: "bg" }),
  [CMD.modeScan]: () => emitPhoto({ t: "mode", mode: "scan" }),
  [CMD.modeExport]: () => emitPhoto({ t: "mode", mode: "export" }),
  [CMD.rotL]: () => emitPhoto({ t: "rot", dir: -1 }),
  [CMD.rotR]: () => emitPhoto({ t: "rot", dir: 1 }),
  [CMD.flipH]: () => emitPhoto({ t: "flip", axis: "h" }),
  [CMD.flipV]: () => emitPhoto({ t: "flip", axis: "v" }),
  [CMD.swap]: () => emitPhoto({ t: "swap" }),
  [CMD.cropDone]: () => emitPhoto({ t: "crop", done: true }),
  [CMD.cropCancel]: () => emitPhoto({ t: "crop", done: false })
};
