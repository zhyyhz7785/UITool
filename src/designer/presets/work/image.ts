import { baseLayout, box, chip, cmd, dialog, editor, look, menu, okCancel, row, section, stack, tab, viewMenu, zones, type WorkTypeDef } from "../kit";

const commands = [
  cmd("file.open", "打开…", "文件", "open", { keybinding: "Ctrl+O", core: "file.open" }),
  cmd("file.save", "保存", "文件", "save", { keybinding: "Ctrl+S", core: "file.save" }),
  cmd("edit.undo", "撤销", "编辑", "undo", { keybinding: "Ctrl+Z", core: "edit.undo" }),
  cmd("edit.redo", "重做", "编辑", "redo", { keybinding: "Ctrl+Y", core: "edit.redo" }),
  cmd("tool.select", "选择", "工具", "pointer"),
  cmd("tool.brush", "画笔", "工具", "brush"),
  cmd("tool.crop", "裁剪", "工具", "crop"),
  cmd("tool.text", "文字", "工具", "mtext"),
  cmd("tool.rect", "矩形", "工具", "rect"),
  cmd("image.new", "新建画布", "文件", "new", { keybinding: "Ctrl+N" }),
  cmd("image.size", "图像大小", "图像", "crop"),
  cmd("image.export", "导出为", "文件", "export"),
  { ...cmd("image.ocr", "识别文字", "图像", "search", { core: "ocr.open" }), params: { source: "image", path: "附图.jpg" } }
];

const menus = [
  menu("file", "文件", ["image.new", "file.open", "file.save", "sep", "image.export"]),
  menu("edit", "编辑", ["edit.undo", "edit.redo"]),
  menu("image", "图像", ["image.size", "image.ocr"]),
  menu("tool", "工具", ["tool.select", "tool.brush", "tool.crop", "tool.text", "tool.rect"]),
  viewMenu
];

const dialogs = [
  dialog({
    id: "new",
    title: "新建画布",
    command: "image.new",
    groups: ["尺寸", "背景"],
    fields: [
      { id: "w", label: "宽度", type: "number", group: "尺寸", value: 1920 },
      { id: "h", label: "高度", type: "number", group: "尺寸", value: 1080 },
      { id: "unit", label: "单位", type: "select", group: "尺寸", value: "px", options: [{ value: "px", label: "像素" }, { value: "mm", label: "毫米" }] },
      { id: "bg", label: "背景", type: "color", group: "背景", value: "#ffffff" },
      { id: "transparent", label: "透明", type: "toggle", group: "背景", value: false }
    ],
    actions: okCancel("创建")
  }),
  dialog({
    id: "size",
    title: "图像大小",
    command: "image.size",
    fields: [
      { id: "w", label: "宽度", type: "number", value: 1920 },
      { id: "h", label: "高度", type: "number", value: 1080 },
      { id: "resample", label: "重定像素", type: "toggle", value: true }
    ],
    actions: okCancel("确定")
  }),
  dialog({
    id: "export",
    title: "导出为",
    command: "image.export",
    groups: ["文件", "质量"],
    fields: [
      { id: "format", label: "格式", type: "select", group: "文件", value: "png", options: [{ value: "png", label: "PNG" }, { value: "jpg", label: "JPEG" }, { value: "webp", label: "WebP" }] },
      { id: "path", label: "位置", type: "text", group: "文件" },
      { id: "quality", label: "质量", type: "number", group: "质量", value: 90 }
    ],
    actions: okCancel("导出")
  })
];

const tools = ["tool.select", "tool.brush", "tool.crop", "tool.text", "tool.rect"];

function photoshop() {
  const layout = baseLayout();
  layout.primarySideBar.visible = false;
  layout.toolbars.side = { visible: true, position: "left", style: "icon", rows: [row("tools", "工具", tools)] };
  layout.toolbars.top = { visible: true, style: "labeled", rows: [row("opt", "选项", ["tool.brush", "tool.rect", "tool.text"])] };
  return {
    ...look("hy-dark"),
    layout,
    activity: [box("files", "文件", "files", "explorer")],
    auxiliary: [stack("right", "面板", "layer", [section("layers", "图层", "layer", "outline", "top"), section("props", "属性", "props", "properties", "bottom")])],
    panel: [tab("log", "输出", "terminal", "output")],
    editors: [editor("art", "画布", "image", "canvas"), editor("ocr", "识别", "search", "ocr")],
    statusBar: zones([chip("zoom", "100%")])
  };
}

function figma() {
  const layout = baseLayout();
  layout.dialogStyle = "sheet";
  layout.activityBar.visible = false;
  layout.toolbars.top = { visible: true, style: "icon", rows: [row("tools", "工具", tools)] };
  return {
    ...look("hy-white", "comfortable"),
    layout,
    activity: [stack("left", "图层", "layer", [section("layers", "图层", "layer", "outline", "top"), section("files", "文件", "files", "explorer", "bottom")])],
    auxiliary: [box("inspect", "检查器", "props", "properties")],
    panel: [tab("log", "输出", "terminal", "output")],
    editors: [editor("art", "画布", "image", "canvas"), editor("ocr", "识别", "search", "ocr")],
    statusBar: zones([chip("zoom", "100%")])
  };
}

function corel() {
  const layout = baseLayout();
  layout.primarySideBar.visible = false;
  layout.toolbars.top = {
    visible: true,
    style: "labeled",
    rows: [row("std", "标准", ["image.new", "file.open", "file.save", "edit.undo", "edit.redo"]), row("prop", "属性", tools)]
  };
  layout.toolbars.side = { visible: true, position: "left", style: "icon", rows: [row("box", "工具箱", tools)] };
  return {
    ...look("hy-light"),
    layout,
    activity: [stack("left", "对象", "layer", [section("layers", "对象", "layer", "outline"), section("files", "文件", "files", "explorer", "bottom")])],
    auxiliary: [box("docker", "泊坞窗", "props", "properties")],
    panel: [tab("log", "输出", "terminal", "output")],
    editors: [editor("art", "页面", "image", "canvas"), editor("ocr", "识别", "search", "ocr")],
    statusBar: zones([chip("page", "页面 1")])
  };
}

export const image: WorkTypeDef = {
  id: "image",
  name: "图像 / 平面",
  summary: "画布、图层和导出。三套方案共用新建、尺寸和导出对话框。",
  views: ["canvas", "explorer", "ocr", "outline", "output", "properties"],
  commands,
  menus,
  dialogs,
  schemes: [
    { id: "image-best", tier: "best", name: "工具栏加图层面板", desc: "左工具、上选项栏、右图层和属性。", source: "Photoshop", reason: "工具在边缘，图层一直可见", score: { efficiency: 54, aesthetic: 20, learn: 14 }, ui: photoshop() },
    { id: "image-good", tier: "good", name: "浅色三栏检查器", desc: "左图层、右检查器，弹窗用抽屉。", source: "Figma", reason: "换工具得到顶栏", score: { efficiency: 47, aesthetic: 22, learn: 12 }, ui: figma() },
    { id: "image-basic", tier: "basic", name: "两排文字工具栏", desc: "上侧两排带文字，右侧泊坞窗，图层树收起。", source: "CorelDRAW", reason: "两排工具把画布压窄", score: { efficiency: 40, aesthetic: 14, learn: 12 }, ui: corel() }
  ]
};
