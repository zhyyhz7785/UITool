import { baseLayout, box, chip, cmd, dialog, editor, look, menu, okCancel, row, section, stack, tab, viewMenu, zones, type WorkTypeDef } from "../kit";

const commands = [
  cmd("file.open", "打开…", "文件", "open", { keybinding: "Ctrl+O", core: "file.open" }),
  cmd("file.save", "保存", "文件", "save", { keybinding: "Ctrl+S", core: "file.save" }),
  cmd("edit.undo", "撤销", "编辑", "undo", { keybinding: "Ctrl+Z", core: "edit.undo" }),
  cmd("edit.redo", "重做", "编辑", "redo", { keybinding: "Ctrl+Y", core: "edit.redo" }),
  cmd("clip.cut", "剪切", "剪辑", "cut"),
  cmd("clip.split", "剃刀", "剪辑", "trim"),
  cmd("play.toggle", "播放", "播放", "play", { keybinding: "Space", core: "play.toggle" }),
  cmd("seq.new", "新建序列", "文件", "new", { keybinding: "Ctrl+N" }),
  cmd("seq.export", "导出媒体", "文件", "export"),
  cmd("clip.speed", "速度和时长", "剪辑", "play")
];

const menus = [
  menu("file", "文件", ["seq.new", "file.open", "file.save", "sep", "seq.export"]),
  menu("edit", "编辑", ["edit.undo", "edit.redo"]),
  menu("clip", "剪辑", ["clip.cut", "clip.split", "clip.speed", "play.toggle"]),
  viewMenu
];

const dialogs = [
  dialog({
    id: "sequence",
    title: "新建序列",
    command: "seq.new",
    groups: ["预设", "时间"],
    fields: [
      { id: "preset", label: "预设", type: "select", group: "预设", value: "1080", options: [{ value: "1080", label: "1080p 25" }, { value: "4k", label: "4K 25" }] },
      { id: "name", label: "名称", type: "text", group: "预设", value: "序列 01" },
      { id: "fps", label: "帧率", type: "number", group: "时间", value: 25 }
    ],
    actions: okCancel("创建")
  }),
  dialog({
    id: "export",
    title: "导出媒体",
    command: "seq.export",
    groups: ["格式", "输出"],
    fields: [
      { id: "format", label: "格式", type: "select", group: "格式", value: "h264", options: [{ value: "h264", label: "H.264" }, { value: "prores", label: "ProRes" }] },
      { id: "path", label: "位置", type: "text", group: "输出" },
      { id: "range", label: "仅工作区", type: "toggle", group: "输出", value: true }
    ],
    actions: okCancel("导出")
  }),
  dialog({
    id: "speed",
    title: "速度和时长",
    command: "clip.speed",
    fields: [
      { id: "speed", label: "速度 %", type: "number", value: 100 },
      { id: "ripple", label: "波纹编辑", type: "toggle", value: true },
      { id: "reverse", label: "倒放", type: "toggle", value: false }
    ],
    actions: okCancel("应用")
  })
];

const tools = ["play.toggle", "clip.cut", "clip.split", "edit.undo", "edit.redo"];

function premiere() {
  const layout = baseLayout();
  layout.toolbars.top = { visible: true, style: "icon", rows: [row("edit", "剪辑", tools)] };
  layout.panel = { ...layout.panel, visible: true, align: "justify", size: 220 };
  return {
    ...look("hy-dark"),
    layout,
    activity: [stack("proj", "项目", "files", [section("bin", "项目", "files", "explorer", "top"), section("fx", "效果", "shapes", "outline", "bottom")])],
    auxiliary: [box("fxctl", "效果控件", "props", "properties")],
    panel: [tab("tl", "时间线", "play", "timeline"), tab("log", "输出", "terminal", "output")],
    editors: [editor("mon", "节目", "monitor", "monitor")],
    statusBar: zones([chip("tc", "00:00:01:00")])
  };
}

function capcut() {
  const layout = baseLayout();
  layout.dialogStyle = "sheet";
  layout.titleBar.menu = "hidden";
  layout.toolbars.top = { visible: true, style: "icon", rows: [row("edit", "剪辑", tools)] };
  layout.panel = { ...layout.panel, visible: true, align: "justify", size: 200 };
  return {
    ...look("hy-dark", "comfortable"),
    layout,
    activity: [stack("media", "素材", "files", [section("bin", "素材", "files", "explorer", "top"), section("fx", "效果", "shapes", "outline", "bottom")])],
    auxiliary: [box("insp", "属性", "props", "properties")],
    panel: [tab("tl", "时间线", "play", "timeline"), tab("log", "输出", "terminal", "output")],
    editors: [editor("mon", "预览", "monitor", "monitor")],
    statusBar: zones([chip("tc", "00:01")])
  };
}

function pages() {
  const layout = baseLayout();
  layout.activityBar = { visible: true, position: "top", bottom: [] };
  layout.panel = { ...layout.panel, visible: true, size: 180 };
  layout.auxiliaryBar.visible = false;
  return {
    ...look("hy-dark"),
    layout,
    activity: [
      box("media", "媒体", "files", "explorer"),
      box("edit", "剪辑", "cut", "outline"),
      box("color", "调色", "color", "properties"),
      box("deliver", "交付", "export", "output")
    ],
    auxiliary: [],
    panel: [tab("tl", "时间线", "play", "timeline")],
    editors: [editor("mon", "监视器", "monitor", "monitor")],
    statusBar: zones([chip("page", "剪辑")])
  };
}

export const video: WorkTypeDef = {
  id: "video",
  name: "视频时间线",
  summary: "监视器、素材和时间线。三套方案共用序列、导出和速度对话框。",
  views: ["explorer", "monitor", "outline", "output", "properties", "timeline"],
  commands,
  menus,
  dialogs,
  schemes: [
    { id: "video-best", tier: "best", name: "监视器加通栏时间线", desc: "左项目和效果，右效果控件，底部时间线拉通。", source: "Premiere Pro", reason: "剪辑时四块同时在", score: { efficiency: 52, aesthetic: 18, learn: 13 }, ui: premiere() },
    { id: "video-good", tier: "good", name: "少菜单时间线", desc: "没有传统菜单，密度舒适，弹窗用抽屉。", source: "剪映", reason: "高级命令不在表面", score: { efficiency: 45, aesthetic: 20, learn: 11 }, ui: capcut() },
    { id: "video-basic", tier: "basic", name: "顶部分页", desc: "媒体、剪辑、调色、交付分页，一次只看一页。", source: "DaVinci Resolve", reason: "换页才能看到另一类工具", score: { efficiency: 38, aesthetic: 16, learn: 10 }, ui: pages() }
  ]
};
