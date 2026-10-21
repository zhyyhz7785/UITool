import { groupFromPanel, STATUS_TOGGLES } from "hy3d-spec";
import { baseLayout, box, chip, cmd, dialog, editor, look, menu, okCancel, row, section, stack, tab, zones, type WorkTypeDef } from "../kit";
import { BENCH_DEF, BENCH_TOP, BLENDER_MENUS, BLENDER_TABS, hy3dCommands, hy3dMenus } from "./cad.hy3dCommands";

/** 命令 id、快捷键、菜单、功能区都来自 hy3d `ui/commands.json`。 */
const commands = hy3dCommands.map((c) =>
  cmd(c.id, c.title, c.category, c.icon, c.keybinding ? { keybinding: c.keybinding, core: c.id } : { core: c.id })
);

const blenderMenus = BLENDER_MENUS.map((m) => menu(m.id, m.title, m.items));

const menus = hy3dMenus.map((m) =>
  menu(
    m.id,
    m.title,
    m.id === "view"
      ? [...m.items, "sep", "workbench.action.selectScheme", "workbench.action.toggleSidebarVisibility", "workbench.action.toggleAuxiliaryBar", "workbench.action.togglePanel", "workbench.action.toggleToolbarPosition"]
      : m.items
  )
);

const dialogs = [
  dialog({
    id: "layers",
    title: "图层特性管理器",
    command: "cad.layer",
    fields: [
      { id: "layers", label: "图层", type: "table", columns: ["名称", "开", "颜色", "线型"], rows: [["0", "开", "白", "Continuous"], ["轴线", "开", "红", "Center"], ["标注", "开", "绿", "Continuous"]] }
    ],
    actions: okCancel("确定")
  }),
  dialog({
    id: "dimstyle",
    title: "标注样式",
    command: "cad.dimstyle",
    groups: ["文字", "线"],
    fields: [
      { id: "name", label: "样式名", type: "text", group: "文字", value: "ISO-25" },
      { id: "height", label: "文字高度", type: "number", group: "文字", value: 2.5 },
      { id: "color", label: "颜色", type: "color", group: "线", value: "#00ff00" },
      { id: "scale", label: "全局比例", type: "number", group: "线", value: 1 }
    ],
    actions: okCancel("保存")
  }),
  dialog({
    id: "plot",
    title: "打印出图",
    command: "file.plot",
    groups: ["图纸", "范围"],
    fields: [
      { id: "device", label: "打印机", type: "select", group: "图纸", value: "pdf", options: [{ value: "pdf", label: "PDF" }, { value: "dwf", label: "DWF" }] },
      { id: "paper", label: "图幅", type: "select", group: "图纸", value: "a3", options: [{ value: "a3", label: "A3" }, { value: "a2", label: "A2" }, { value: "a1", label: "A1" }] },
      { id: "extent", label: "范围", type: "select", group: "范围", value: "extents", options: [{ value: "extents", label: "范围" }, { value: "window", label: "窗口" }, { value: "display", label: "显示" }] },
      { id: "fit", label: "布满图纸", type: "toggle", group: "范围", value: true }
    ],
    actions: okCancel("打印")
  })
];

/** 三套方案共用：视口、图层、属性、大纲、命令栏、输出。 */
const views = ["commandline", "layers", "outline", "output", "properties", "viewport2d"];

function panelTabs() {
  return [tab("cmd", "命令栏", "terminal", "commandline"), tab("log", "输出", "term", "output")];
}

/** B · Ribbon。八个选项卡。面上按钮、下拉和大按钮跟 hy3d 同一张表。 */
function ribbonUi() {
  const layout = baseLayout();
  layout.dialogStyle = "sheet";
  layout.activityBar = { visible: true, position: "side", bottom: [] };
  layout.titleBar.menu = "ownrow";
  layout.titleBar.commandCenter = false;
  layout.titleBar.search = true;
  layout.titleBar.left = [
    { id: "q-ui.undo", command: "ui.undo", text: "撤销" },
    { id: "q-ui.redo", command: "ui.redo", text: "重做" },
    { id: "q-edit.adjust", command: "edit.adjust", text: "调整上一步" }
  ];
  layout.titleBar.right = [];
  layout.toolbars.top = {
    visible: true,
    style: "ribbon",
    rows: BLENDER_TABS.map((t) => {
      const groups = t.panels.map((p) => groupFromPanel(p));
      const start = groups.flatMap((g) => g.commands.filter(Boolean).map((command) => ({ id: `${t.id}-${g.id}-${command}`, command })));
      return { id: t.id, title: t.title, start, center: [], end: [], groups };
    })
  };
  layout.auxiliaryBar.visible = false;
  layout.panel = { ...layout.panel, visible: true, size: 120 };
  const statusBar = zones(
    [chip("coord", "0.0000, 0.0000, 0.0000")],
    [...STATUS_TOGGLES.map((t) => ({ id: "st-" + t.id, command: t.id, text: t.short })), chip("scale", "1:1")]
  );
  statusBar.center = [chip("model", "模型"), chip("layout", "布局")];
  return {
    ...look("autocad"),
    layout,
    activity: [box("layers", "图层", "layer", "layers"), box("props", "特性", "props", "properties"), box("tree", "大纲", "list-tree", "outline")],
    auxiliary: [],
    panel: panelTabs(),
    editors: [editor("start", "开始", "file", "viewport2d"), editor("sample", "示例", "file", "viewport2d")],
    statusBar
  };
}

/** 默认选项卡的各面板排成一条竖条，面板之间加分隔。 */
function defaultShelf() {
  const home = BLENDER_TABS.find((t) => t.title === "默认");
  const start: { id: string; command?: string; separator?: boolean }[] = [];
  (home?.panels ?? []).forEach((panel, pi) => {
    if (pi) start.push({ id: "sep-" + pi, separator: true });
    panel.ids.forEach((command) => start.push({ id: "t-" + command, command }));
  });
  return { id: "tools", title: "默认", start, center: [], end: [] };
}

/** A · Blender。页签是命令目录的八个选项卡，左侧竖条是当前选项卡的面板。 */
function shelfUi() {
  const layout = baseLayout();
  layout.activityBar.visible = false;
  layout.toolbars.top.visible = false;
  layout.toolbars.side = { visible: true, position: "left", style: "icon", rows: [defaultShelf()] };
  layout.panel = { ...layout.panel, visible: false, size: 96 };
  layout.primarySideBar.width = 200;
  layout.auxiliaryBar.width = 260;
  layout.editor.tabs = true;
  return {
    ...look("blender"),
    layout,
    activity: [
      stack("tree", "大纲", "list-tree", [section("tree", "大纲", "list-tree", "outline", "top"), section("layers", "图层", "layer", "layers", "bottom")])
    ],
    auxiliary: [box("props", "属性", "props", "properties")],
    panel: panelTabs(),
    editors: BLENDER_TABS.map((t) => editor(t.id, t.title, "persp", "viewport2d")),
    statusBar: zones(
      [chip("coord", "X 0.00  Y 0.00")],
      [chip("snap", "捕捉", "snap"), chip("grid", "栅格", "grid"), chip("ortho", "正交", "ortho")]
    )
  };
}

/** C · 分析工作台。两行工具，左工作树和图层，右特性，底输出。视口只有一块。 */
function benchUi() {
  const layout = baseLayout();
  layout.activityBar.visible = false;
  layout.toolbars.top = {
    visible: true,
    style: "icon",
    rows: [row("file", "文件", BENCH_TOP), row("def", "定义", BENCH_DEF)]
  };
  layout.panel = { ...layout.panel, visible: true, size: 160 };
  return {
    ...look("autocad"),
    layout,
    activity: [
      stack("left", "模型", "list-tree", [section("tree", "工作树", "list-tree", "outline", "top"), section("layers", "图层", "layer", "layers", "bottom")])
    ],
    auxiliary: [box("props", "特性", "props", "properties")],
    panel: panelTabs(),
    editors: [editor("vp", "模型", "persp", "viewport2d")],
    statusBar: zones([chip("coord", "X 0.00  Y 0.00")])
  };
}

export const cad: WorkTypeDef = {
  id: "cad2d",
  name: "CAD 二维制图",
  summary: "hy3d 的绘图、修改、标注和结构命令。命令栏只手动开关。",
  views,
  commands,
  menus,
  dialogs,
  schemes: [
    { id: "cad2d-best", tier: "best", name: "功能区", desc: "页签：默认、插入、视图、管理、输出、文件、结构、帮助。每页是目录里的面板，左侧图层、特性和大纲，底命令栏。", source: "01-AutoCAD侧/B-Ribbon-AutoCAD原生风格.html", reason: "命令按页放好，找得最快", score: { efficiency: 52, aesthetic: 20, learn: 14 }, ui: ribbonUi(), menus },
    { id: "cad2d-good", tier: "good", name: "Blender", desc: "页签按命令目录：默认、插入、视图、管理、输出、文件、结构、帮助。左侧竖条是当前选项卡的面板。", source: "01-AutoCAD侧/A-独立窗口-Blender式深色.html", reason: "视口更大，命令和规划的选项卡对齐", score: { efficiency: 46, aesthetic: 18, learn: 13 }, ui: shelfUi(), menus: blenderMenus },
    { id: "cad2d-basic", tier: "basic", name: "分析工作台", desc: "两行工具，左工作树和图层，右特性，底输出。只有一块视口。", source: "01-AutoCAD侧/C-工程分析工作台-SAP2000式.html", reason: "分析信息挤在一起，画图时视口最小", score: { efficiency: 38, aesthetic: 15, learn: 12 }, ui: benchUi(), menus }
  ]
};
