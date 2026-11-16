import { groupFromPanel, STATUS_TOGGLES } from "hy3d-spec";
import type { AppMeta, SchemeUi, ToolGroup, UiConfig } from "@tpl/workbench/types";
import { buildConfig } from "../index";
import { baseLayout, box, chip, cmd, editor, look, menu, tab, zones } from "../kit";
import { hy3dFullCommands, hy3dFullMenus, hy3dFullTabs } from "./hy3d.generated";

/** 面上已经排好的大按钮保持原尺寸，其余命令各占一颗小按钮，图标都露在页签上。 */
function showAll(group: ToolGroup): ToolGroup {
  const face = new Map((group.slots ?? []).map((slot) => [slot.command, slot]));
  const seen = new Set<string>();
  const slots: NonNullable<ToolGroup["slots"]> = [];
  for (const id of group.commands) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const prev = face.get(id);
    slots.push({ command: id, size: prev?.size ?? "small", ...(prev?.text ? { text: prev.text } : {}) });
  }
  return { ...group, slots };
}

/** 壳层照 CAD 二维制图的功能区：标题栏、页签、左侧图层/特性/大纲、底命令栏。 */
function ribbonUi(): SchemeUi {
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
    rows: hy3dFullTabs.map((t) => {
      const groups = t.panels.map((p) => showAll(groupFromPanel(p)));
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
    panel: [tab("cmd", "命令栏", "terminal", "commandline"), tab("log", "输出", "term", "output")],
    editors: [editor("start", "开始", "file", "viewport2d"), editor("sample", "示例", "file", "viewport2d")],
    statusBar
  };
}

function commands() {
  return hy3dFullCommands.map((c) =>
    cmd(c.id, c.title, c.category, c.icon, c.keybinding ? { keybinding: c.keybinding, core: c.id } : { core: c.id })
  );
}

function menus() {
  return hy3dFullMenus.map((m) =>
    menu(
      m.id,
      m.title,
      m.id === "view"
        ? [...m.items, "sep", "workbench.action.selectScheme", "workbench.action.toggleSidebarVisibility", "workbench.action.toggleAuxiliaryBar", "workbench.action.togglePanel", "workbench.action.toggleToolbarPosition"]
        : m.items
    )
  );
}

/** HY3d：功能区构造，命令图标用 hy3d 全套（h3- 前缀，不改其它模板的同名图标）。 */
export function buildHy3dTemplate(keep?: AppMeta): UiConfig {
  const cfg = buildConfig("cad2d", "cad2d-best", keep);
  cfg.app = {
    ...cfg.app,
    name: "hy3d",
    title: "HY3d",
    identifier: "com.hy.hy3d",
    description: "功能区构造与 CAD 二维制图的功能区相同，页签上是 hy3d 全套图标。"
  };
  cfg.commands = commands();
  cfg.menus = menus();
  const ui = ribbonUi();
  const menuCopy = () => JSON.parse(JSON.stringify(cfg.menus)) as UiConfig["menus"];
  for (const scheme of cfg.schemes ?? []) {
    scheme.menus = menuCopy();
    if (scheme.id !== "cad2d-best") continue;
    scheme.ui = JSON.parse(JSON.stringify(ui)) as SchemeUi;
    scheme.desc = "页签沿用功能区。每个命令一颗按钮，hy3d 全套图标都在面上。标题栏、左侧图层特性和大纲、底命令栏与功能区相同。";
  }
  cfg.theme = ui.theme;
  cfg.density = ui.density;
  cfg.icons = ui.icons;
  cfg.layout = ui.layout;
  cfg.activity = ui.activity;
  cfg.auxiliary = ui.auxiliary;
  cfg.panel = ui.panel;
  cfg.editors = ui.editors;
  cfg.statusBar = ui.statusBar;
  return cfg;
}
