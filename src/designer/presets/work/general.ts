import { baseLayout, box, chip, cmd, dialog, editor, look, menu, okCancel, row, section, stack, tab, zones, type WorkTypeDef } from "../kit";

/** 以后新软件从这里改。没有文档、PDF、文献、OCR 或医学模块。 */
const commands = [
  cmd("file.new", "新建", "文件", "new", { keybinding: "Ctrl+N" }),
  cmd("file.open", "打开", "文件", "open", { keybinding: "Ctrl+O" }),
  cmd("file.save", "保存", "文件", "save", { keybinding: "Ctrl+S" }),
  cmd("edit.undo", "撤销", "编辑", "undo", { keybinding: "Ctrl+Z" }),
  cmd("edit.redo", "重做", "编辑", "redo", { keybinding: "Ctrl+Y" }),
  cmd("app.confirm", "确认操作", "文件", "help"),
  cmd("app.settings", "设置", "帮助", "settings"),
  cmd("help.about", "关于", "帮助", "help")
];

const menus = [
  menu("file", "文件", ["file.new", "file.open", "file.save", "sep", "app.confirm"]),
  menu("edit", "编辑", ["edit.undo", "edit.redo"]),
  menu("view", "视图", [
    "workbench.action.selectScheme",
    "sep",
    "workbench.action.toggleSidebarVisibility",
    "workbench.action.toggleAuxiliaryBar",
    "workbench.action.togglePanel",
    "workbench.action.toggleToolbarPosition"
  ]),
  menu("help", "帮助", ["app.settings", "help.about"])
];

const dialogs = [
  dialog({
    id: "confirm",
    title: "确认",
    command: "app.confirm",
    body: "确定要继续吗？",
    fields: [],
    actions: okCancel("确定")
  }),
  dialog({
    id: "settings",
    title: "设置",
    command: "app.settings",
    groups: ["外观"],
    fields: [
      { id: "density", label: "密度", type: "select", group: "外观", value: "compact", options: [{ value: "compact", label: "紧凑" }, { value: "comfortable", label: "舒适" }] }
    ],
    actions: okCancel("应用")
  })
];

const views = ["explorer", "outline", "output", "problems", "properties", "search", "settings", "terminal", "text"];

function bench() {
  const layout = baseLayout();
  layout.activityBar.visible = true;
  layout.activityBar.position = "side";
  layout.titleBar.commandCenter = true;
  layout.auxiliaryBar.visible = true;
  layout.auxiliaryBar.width = 280;
  layout.primarySideBar.width = 260;
  layout.panel.visible = false;
  layout.panel.size = 180;
  layout.editor.tabs = true;
  layout.toolbars.top = { visible: true, style: "labeled", rows: [row("main", "常用", ["file.new", "file.open", "file.save", "edit.undo", "edit.redo"])] };
  return {
    ...look("hy-dark", "compact"),
    layout,
    activity: [
      stack("explorer", "资源管理器", "home", [section("files", "文件", "home", "explorer"), section("outline", "大纲", "toc", "outline", "bottom")]),
      box("search", "搜索", "search", "search")
    ],
    auxiliary: [box("props", "属性", "props", "properties"), box("settings", "设置", "settings", "settings")],
    panel: [tab("terminal", "终端", "term", "terminal"), tab("output", "输出", "term", "output"), tab("problems", "问题", "error", "problems")],
    editors: [editor("page", "未命名", "file", "text")],
    statusBar: zones([chip("ready", "就绪")], [chip("enc", "UTF-8")])
  };
}

export const general: WorkTypeDef = {
  id: "general",
  name: "通用模板",
  summary: "简洁的桌面软件工作台。从 HyMdTauri 的工作台收掉文档业务，导出后是独立的 Tauri 2 + React + TypeScript 工程。",
  views,
  commands,
  menus,
  dialogs,
  schemes: [
    {
      id: "general-bench",
      skin: "workbench",
      name: "软件工作台",
      desc: "标题栏、菜单、活动栏、工具栏、文件树、左右栏、标签页、可选底部面板和状态栏。业务区留空，以后再加。",
      source: "HyMdTauri 工作台，去掉文档专属模块",
      ui: bench()
    }
  ]
};
