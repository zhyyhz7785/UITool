import { baseLayout, box, chip, cmd, dialog, editor, look, menu, okCancel, row, section, stack, tab, viewMenu, zones, type WorkTypeDef } from "../kit";

const commands = [
  cmd("file.new", "新建", "文件", "new", { keybinding: "Ctrl+N", core: "file.new" }),
  cmd("file.open", "打开…", "文件", "open", { keybinding: "Ctrl+O", core: "file.open" }),
  cmd("file.save", "保存", "文件", "save", { keybinding: "Ctrl+S", core: "file.save" }),
  cmd("task.run", "运行", "任务", "play", { keybinding: "F5", core: "task.run" }),
  cmd("app.prefs", "偏好设置", "工具", "settings"),
  cmd("app.wizard", "新建任务", "文件", "plus"),
  cmd("app.about", "关于", "帮助", "info")
];

const menus = [
  menu("file", "文件", ["file.new", "file.open", "file.save", "sep", "app.wizard"]),
  menu("task", "任务", ["task.run"]),
  menu("tools", "工具", ["app.prefs"]),
  menu("help", "帮助", ["app.about"]),
  viewMenu
];

const dialogs = [
  dialog({
    id: "prefs",
    title: "偏好设置",
    command: "app.prefs",
    groups: ["常规", "外观"],
    fields: [
      { id: "lang", label: "语言", type: "select", group: "常规", value: "zh", options: [{ value: "zh", label: "简体中文" }, { value: "en", label: "English" }] },
      { id: "start", label: "启动时打开上次的文件", type: "toggle", group: "常规", value: true },
      { id: "theme", label: "主题", type: "select", group: "外观", value: "system", options: [{ value: "system", label: "跟随系统" }, { value: "light", label: "浅色" }, { value: "dark", label: "深色" }] },
      { id: "accent", label: "强调色", type: "color", group: "外观", value: "#4cc2ff" }
    ],
    actions: okCancel("保存")
  }),
  dialog({
    id: "wizard",
    title: "新建任务",
    command: "app.wizard",
    groups: ["名称", "选项", "确认"],
    fields: [
      { id: "name", label: "名称", type: "text", group: "名称", placeholder: "任务名" },
      { id: "folder", label: "位置", type: "text", group: "名称" },
      { id: "kind", label: "类型", type: "select", group: "选项", value: "blank", options: [{ value: "blank", label: "空白" }, { value: "sample", label: "示例" }] },
      { id: "open", label: "创建后打开", type: "toggle", group: "确认", value: true }
    ],
    actions: okCancel("创建")
  }),
  dialog({
    id: "about",
    title: "关于",
    command: "app.about",
    fields: [
      { id: "name", label: "名称", type: "text", value: "Hy App" },
      { id: "ver", label: "版本", type: "text", value: "0.1.0" }
    ],
    actions: [{ id: "ok", label: "关闭", primary: true }]
  })
];

function fluent() {
  const layout = baseLayout();
  layout.titleBar.menu = "hidden";
  layout.auxiliaryBar.visible = false;
  layout.editor.tabs = false;
  layout.primarySideBar.width = 220;
  return {
    ...look("fluent", "comfortable"),
    layout,
    activity: [stack("nav", "导航", "home", [section("list", "列表", "files", "explorer", "top"), section("toc", "大纲", "list-tree", "outline", "bottom")])],
    auxiliary: [box("detail", "详情", "props", "properties")],
    panel: [tab("log", "输出", "terminal", "output")],
    editors: [editor("home", "主页", "home", "welcome")],
    statusBar: zones([chip("ready", "就绪")])
  };
}

function mac() {
  const layout = baseLayout();
  layout.dialogStyle = "sheet";
  layout.activityBar = { visible: true, position: "top", bottom: [] };
  layout.auxiliaryBar.visible = false;
  layout.editor.tabs = false;
  layout.titleBar.menu = "hidden";
  return {
    ...look("mac", "comfortable"),
    layout,
    activity: [
      box("general", "通用", "settings", "explorer"),
      box("look", "外观", "palette", "outline"),
      box("privacy", "隐私", "props", "properties"),
      box("about", "关于", "info", "output")
    ],
    auxiliary: [],
    panel: [],
    editors: [editor("home", "主页", "home", "welcome")],
    statusBar: zones()
  };
}

function classic() {
  const layout = baseLayout();
  layout.primarySideBar.visible = false;
  layout.auxiliaryBar.visible = false;
  layout.editor.tabs = false;
  layout.toolbars.top = { visible: true, style: "icon", rows: [row("main", "工具", ["file.new", "file.open", "file.save", "task.run", "app.prefs"])] };
  return {
    ...look("hy-light"),
    layout,
    activity: [stack("nav", "导航", "files", [section("list", "列表", "files", "explorer"), section("toc", "大纲", "list-tree", "outline", "bottom")])],
    auxiliary: [box("detail", "详情", "props", "properties")],
    panel: [tab("log", "输出", "terminal", "output")],
    editors: [editor("home", "主页", "home", "welcome")],
    statusBar: zones([chip("ready", "就绪")])
  };
}

export const utility: WorkTypeDef = {
  id: "utility",
  name: "通用小工具",
  summary: "导航加内容页。三套方案共用偏好、新建任务和关于。",
  views: ["explorer", "outline", "output", "properties", "welcome"],
  commands,
  menus,
  dialogs,
  schemes: [
    { id: "utility-best", tier: "best", name: "左侧导航", desc: "左边是列表，右边是内容页。", source: "03-通用桌面工具/B · Win11 设置", reason: "一项一事，不用记菜单", score: { efficiency: 48, aesthetic: 22, learn: 13 }, ui: fluent() },
    { id: "utility-good", tier: "good", name: "顶部图标页签", desc: "页签在侧栏顶部，弹窗用抽屉。", source: "03-通用桌面工具/C · macOS 偏好", reason: "分类一多页签就挤", score: { efficiency: 42, aesthetic: 21, learn: 12 }, ui: mac() },
    { id: "utility-basic", tier: "basic", name: "菜单加工具栏", desc: "经典菜单和一排图标，导航默认收起。", source: "经典桌面", reason: "设置项要钻菜单", score: { efficiency: 34, aesthetic: 12, learn: 11 }, ui: classic() }
  ]
};
