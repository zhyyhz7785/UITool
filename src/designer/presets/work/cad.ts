import { groupFromPanel } from "hy3d-spec";
import { baseLayout, box, chip, cmd, dialog, editor, look, menu, okCancel, row, section, stack, tab, zones, type WorkTypeDef } from "../kit";
import { hy3dBenchRows, hy3dCommands, hy3dMenus, hy3dQuick, hy3dStatus, hy3dTabs } from "./cad.hy3dCommands";

/** 命令 id、快捷键、菜单、功能区都来自 hy3d 当前的 ui/design 和 ui/commands。 */
const commands = hy3dCommands.map((c) =>
  cmd(c.id, c.title, c.category, c.icon, c.keybinding ? { keybinding: c.keybinding, core: c.id } : { core: c.id })
);

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

/** 功能区。页签、面上按钮、下拉和大按钮跟 hy3d ribbon.json 同一份。文字编辑器页隐藏。三种布局皮肤共用这一份命令。 */
function ribbonUi(kind: "top" | "compact" | "hy" = "top") {
  const layout = baseLayout();
  layout.dialogStyle = "sheet";
  layout.activityBar = { visible: true, position: "side", bottom: [] };
  layout.titleBar.menu = kind === "hy" ? "inline" : "ownrow";
  layout.titleBar.commandCenter = false;
  layout.titleBar.search = true;
  layout.titleBar.left = hy3dQuick.map((id) => {
    const command = hy3dCommands.find((c) => c.id === id);
    return { id: "q-" + id, command: id, text: command?.title || id };
  });
  layout.titleBar.right = [];
  layout.toolbars.top = {
    visible: true,
    style: "ribbon",
    rows: hy3dTabs.map((t) => {
      const groups = t.panels.map((p) => groupFromPanel(p));
      const start = groups.flatMap((g) => g.commands.filter(Boolean).map((command) => ({ id: `${t.id}-${g.id}-${command}`, command })));
      return { id: t.id, title: t.title, start, center: [], end: [], groups, ...(t.hidden ? { hidden: true } : {}) };
    })
  };
  layout.auxiliaryBar.visible = false;
  layout.auxiliaryBar.width = kind === "compact" ? 266 : 240;
  layout.primarySideBar.width = kind === "compact" ? 208 : 240;
  layout.panel = { ...layout.panel, visible: true, size: kind === "hy" ? 96 : 120 };
  const statusBar = zones(
    [chip("coord", "0.0000, 0.0000, 0.0000")],
    [...hy3dStatus.map((t) => ({ id: "st-" + t.id, command: t.id, text: t.short })), chip("scale", "1:1")]
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

/** 分析工作台。工具排来自 hy3d workbench.json。皮肤注册表里已没有单独入口，规格文件仍读写。 */
function benchUi() {
  const layout = baseLayout();
  layout.activityBar.visible = false;
  layout.toolbars.top = {
    visible: true,
    style: "icon",
    rows: hy3dBenchRows.map((r) => row(r.id, r.title, r.commands))
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
  name: "HY3D",
  summary: "完整 CAD 工作台。命令、菜单和功能区来自 hy3d 当前的 ui/design。布局皮肤以 ui/skin.js 已注册的为准。",
  views,
  commands,
  menus,
  dialogs,
  schemes: [
    { id: "cad2d-best", skin: "ribbon-top", palette: "acad-b", name: "功能区上置", desc: "默认皮肤。页签单独一行，命令跟 ribbon.json 同一份。左侧图层、特性和大纲，底命令栏。", source: "ui/skin.js · ribbon-top", ui: ribbonUi("top"), menus },
    { id: "cad2d-compact", skin: "ribbon-compact", palette: "acad-b", name: "紧凑制图", desc: "同一份功能区命令，侧栏按紧凑制图的宽度。颜色和尺寸用产品自己的 CSS 变量。", source: "ui/skins/ribbon-compact", ui: ribbonUi("compact"), menus },
    {
      id: "cad2d-hy-ribbon",
      skin: "hy-ribbon",
      palette: "acad-b",
      name: "HY Ribbon",
      desc: "标题栏并入功能页。组名在上，命令是上图标下文字。常显数量记在 hy3d.ui.hyRibbon，不另造命令表。",
      source: "ui/skins/hy-ribbon",
      ui: ribbonUi("hy"),
      menus,
      chrome: { hyRibbon: { v: 1, mode: "full", groups: {} } }
    },
    { id: "cad2d-basic", skin: "workbench", palette: "acad-b", listed: false, name: "分析工作台", desc: "工具排来自 workbench.json。当前皮肤注册表没有单独入口，读写规格时仍保留。", source: "ui/design/workbench.json", ui: benchUi(), menus }
  ]
};
