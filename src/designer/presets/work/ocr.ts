import type { CommandDef } from "@tpl/workbench/types";
import { baseLayout, box, chip, cmd, dialog, editor, look, menu, okCancel, row, section, stack, tab, viewMenu, zones, type WorkTypeDef } from "../kit";

const openImage: CommandDef = { ...cmd("ocr.openImage", "打开图片", "文件", "image", { core: "ocr.open" }), params: { source: "image", path: "附图.jpg" } };
const openPdf: CommandDef = { ...cmd("ocr.openPdf", "打开 PDF", "文件", "open", { core: "ocr.open" }), params: { source: "pdf", path: "扫描件.pdf" } };

const commands = [
  openImage,
  openPdf,
  cmd("ocr.copy", "复制全部", "识别", "copy", { core: "ocr.copy" }),
  cmd("ocr.save", "保存", "识别", "save", { keybinding: "Ctrl+S", core: "ocr.save" }),
  cmd("ocr.saveAs", "另存为", "文件", "save"),
  cmd("ocr.askImage", "图片路径…", "文件", "image"),
  cmd("ocr.askPdf", "PDF 页范围…", "文件", "open")
];

const menus = [
  menu("file", "文件", ["ocr.openImage", "ocr.openPdf", "ocr.save", "sep", "ocr.askImage", "ocr.askPdf", "ocr.saveAs"]),
  menu("ocr", "识别", ["ocr.copy", "ocr.save"]),
  viewMenu
];

const dialogs = [
  dialog({
    id: "open-image",
    title: "打开图片",
    command: "ocr.askImage",
    fields: [{ id: "path", label: "文件", type: "text", value: "附图.jpg" }],
    actions: okCancel("打开")
  }),
  dialog({
    id: "open-pdf",
    title: "打开 PDF",
    command: "ocr.askPdf",
    fields: [
      { id: "path", label: "文件", type: "text", value: "扫描件.pdf" },
      { id: "from", label: "从第几页", type: "number", value: 1 },
      { id: "to", label: "到第几页", type: "number", value: 3 }
    ],
    actions: okCancel("打开")
  }),
  dialog({
    id: "save-as",
    title: "另存为",
    command: "ocr.saveAs",
    fields: [
      {
        id: "format",
        label: "格式",
        type: "select",
        value: "md",
        options: [
          { value: "md", label: "Markdown（.md）" },
          { value: "txt", label: "Text（.txt）" },
          { value: "hocr", label: "hOCR（.hocr）" }
        ]
      },
      { id: "path", label: "位置", type: "text", value: "附图.md" }
    ],
    actions: okCancel("保存")
  })
];

const main = ["ocr.openImage", "ocr.openPdf", "ocr.copy", "ocr.save"];

function best() {
  const layout = baseLayout();
  layout.panel.visible = true;
  layout.toolbars.top = { visible: true, style: "labeled", rows: [row("ocr", "识别", main)] };
  return {
    ...look("hy-light"),
    layout,
    activity: [box("files", "文件", "files", "explorer")],
    auxiliary: [stack("side", "校对", "search", [section("pages", "页", "files", "outline", "top"), section("props", "属性", "props", "properties", "bottom")])],
    panel: [tab("log", "输出", "terminal", "output")],
    editors: [editor("page", "识别", "search", "ocr")],
    statusBar: zones([chip("engine", "ppocrv6-small")])
  };
}

function good() {
  const layout = baseLayout();
  layout.dialogStyle = "sheet";
  layout.panel.visible = true;
  layout.toolbars.top = { visible: true, style: "labeled", rows: [row("ocr", "识别", main)] };
  return {
    ...look("hy-white", "comfortable"),
    layout,
    activity: [stack("left", "页", "files", [section("pages", "页", "files", "outline", "top"), section("files", "文件", "files", "explorer", "bottom")])],
    auxiliary: [box("props", "属性", "props", "properties")],
    panel: [tab("log", "输出", "terminal", "output")],
    editors: [editor("page", "识别", "search", "ocr")],
    statusBar: zones([chip("engine", "ppocrv6-small")])
  };
}

function basic() {
  const layout = baseLayout();
  layout.panel.visible = true;
  layout.toolbars.top = {
    visible: true,
    style: "labeled",
    rows: [row("file", "文件", ["ocr.openImage", "ocr.openPdf", "ocr.save", "ocr.saveAs"]), row("proof", "校对", ["ocr.copy", "ocr.askImage", "ocr.askPdf", "ocr.save"])]
  };
  return {
    ...look("hy-dark"),
    layout,
    activity: [box("files", "文件", "files", "explorer")],
    auxiliary: [box("props", "属性", "props", "properties")],
    panel: [tab("pages", "页", "files", "outline"), tab("log", "输出", "terminal", "output")],
    editors: [editor("page", "识别", "search", "ocr")],
    statusBar: zones([chip("engine", "ppocrv6-small")])
  };
}

export const ocr: WorkTypeDef = {
  id: "ocr",
  name: "识别文字",
  summary: "图片和 PDF 共用一页。打开图片、打开 PDF 都调用 ocr.open。",
  views: ["explorer", "ocr", "outline", "output", "properties"],
  commands,
  menus,
  dialogs,
  schemes: [
    { id: "ocr-best", tier: "best", name: "顶栏加右页列表", desc: "打开图片和 PDF 在顶栏，识别页占中，右边是页和属性。", source: "Umi-OCR 左图右文", reason: "两种输入都在顶栏，校对不用换页", score: { efficiency: 52, aesthetic: 21, learn: 14 }, ui: best() },
    { id: "ocr-good", tier: "good", name: "左页列表", desc: "页放在左边，适合多页 PDF，弹窗用抽屉。", source: "FineReader 页列表", reason: "单张图片时左栏偏空", score: { efficiency: 46, aesthetic: 22, learn: 12 }, ui: good() },
    { id: "ocr-basic", tier: "basic", name: "两排文字工具", desc: "顶上两排带文字，页列表沉到底栏。", source: "工具堆在顶上", reason: "两排工具把识别页压矮", score: { efficiency: 38, aesthetic: 15, learn: 11 }, ui: basic() }
  ]
};
