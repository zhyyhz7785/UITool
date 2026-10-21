import { baseLayout, box, chip, cmd, dialog, editor, look, menu, okCancel, row, section, stack, tab, viewMenu, zones, type WorkTypeDef } from "../kit";

const commands = [
  cmd("file.new", "新建", "文件", "new", { keybinding: "Ctrl+N", core: "file.new" }),
  cmd("file.open", "打开…", "文件", "open", { keybinding: "Ctrl+O", core: "file.open" }),
  cmd("file.save", "保存", "文件", "save", { keybinding: "Ctrl+S", core: "file.save" }),
  cmd("edit.undo", "撤销", "编辑", "undo", { keybinding: "Ctrl+Z", core: "edit.undo" }),
  cmd("edit.redo", "重做", "编辑", "redo", { keybinding: "Ctrl+Y", core: "edit.redo" }),
  cmd("model.grid", "轴网", "建模", "grid"),
  cmd("model.beam", "梁", "建模", "line"),
  cmd("model.column", "柱", "建模", "rect"),
  cmd("model.wall", "墙", "建模", "rect"),
  cmd("model.slab", "板", "建模", "rect"),
  cmd("struct.material", "材料与截面", "定义", "material"),
  cmd("struct.loads", "荷载工况与组合", "荷载", "loadcase"),
  cmd("struct.options", "分析参数", "分析", "settings"),
  cmd("analyze.run", "运行分析", "分析", "play", { keybinding: "F5", core: "analyze.run" })
];

const menus = [
  menu("file", "文件", ["file.new", "file.open", "file.save"]),
  menu("edit", "编辑", ["edit.undo", "edit.redo"]),
  menu("model", "建模", ["model.grid", "model.beam", "model.column", "model.wall", "model.slab", "struct.material"]),
  menu("load", "荷载", ["struct.loads"]),
  menu("analyze", "分析", ["struct.options", "analyze.run"]),
  viewMenu
];

const dialogs = [
  dialog({
    id: "material",
    title: "材料与截面",
    command: "struct.material",
    groups: ["材料", "截面"],
    fields: [
      { id: "mat", label: "材料", type: "select", group: "材料", value: "c30", options: [{ value: "c30", label: "C30" }, { value: "c40", label: "C40" }, { value: "q355", label: "Q355" }] },
      { id: "e", label: "弹性模量", type: "text", group: "材料", value: "3.0e4" },
      { id: "sec", label: "截面", type: "select", group: "截面", value: "rect", options: [{ value: "rect", label: "矩形" }, { value: "circ", label: "圆形" }] },
      { id: "b", label: "宽度", type: "number", group: "截面", value: 400 },
      { id: "h", label: "高度", type: "number", group: "截面", value: 600 }
    ],
    actions: okCancel("指定")
  }),
  dialog({
    id: "loads",
    title: "荷载工况与组合",
    command: "struct.loads",
    groups: ["工况", "组合"],
    fields: [
      { id: "cases", label: "工况", type: "table", group: "工况", columns: ["名称", "类型", "系数"], rows: [["D", "恒载", "1.3"], ["L", "活载", "1.5"], ["W", "风", "1.5"]] },
      { id: "combo", label: "组合", type: "text", group: "组合", value: "1.3D + 1.5L" }
    ],
    actions: okCancel("保存")
  }),
  dialog({
    id: "options",
    title: "分析参数",
    command: "struct.options",
    groups: ["求解", "输出"],
    fields: [
      { id: "solver", label: "求解器", type: "select", group: "求解", value: "sparse", options: [{ value: "sparse", label: "稀疏" }, { value: "direct", label: "直接" }] },
      { id: "pdelta", label: "P-Delta", type: "toggle", group: "求解", value: false },
      { id: "modes", label: "振型数", type: "number", group: "输出", value: 12 }
    ],
    actions: okCancel("确定")
  })
];

const tools = ["model.grid", "model.beam", "model.column", "model.wall", "model.slab", "analyze.run"];

function bench() {
  const layout = baseLayout();
  layout.dialogStyle = "sheet";
  layout.toolbars.top = { visible: true, style: "icon", rows: [row("m", "建模", tools)] };
  layout.panel = { ...layout.panel, visible: true, align: "justify", size: 200 };
  return {
    ...look("hy-dark"),
    layout,
    activity: [stack("tree", "工程", "list-tree", [section("model", "模型树", "list-tree", "outline", "top"), section("lib", "构件库", "files", "explorer", "bottom")])],
    auxiliary: [box("props", "特性", "props", "properties")],
    panel: [tab("result", "结果", "cadtable", "resultTable"), tab("log", "输出", "terminal", "output")],
    editors: [editor("vp", "模型", "persp", "viewport3d")],
    statusBar: zones([chip("story", "3F")], [chip("unit", "kN, m")])
  };
}

function wizard() {
  const layout = baseLayout();
  layout.dialogStyle = "wizard";
  layout.activityBar.visible = true;
  layout.panel.visible = false;
  layout.toolbars.top = { visible: true, style: "icon", rows: [row("m", "建模", tools)] };
  return {
    ...look("hy-dark"),
    layout,
    activity: [
      box("model", "建模", "rect", "explorer"),
      box("load", "荷载", "loadcase", "outline"),
      box("run", "分析", "play", "output"),
      box("result", "结果", "cadtable", "resultTable")
    ],
    auxiliary: [box("props", "特性", "props", "properties")],
    panel: [],
    editors: [editor("vp", "模型", "persp", "viewport3d")],
    statusBar: zones([chip("step", "建模")])
  };
}

function ribbon() {
  const layout = baseLayout();
  layout.toolbars.top = {
    visible: true,
    style: "ribbon",
    rows: [
      row("model", "建模", ["model.grid", "model.beam", "model.column", "model.wall", "model.slab", "struct.material"]),
      row("load", "荷载", ["struct.loads"]),
      row("run", "分析", ["struct.options", "analyze.run"]),
      row("out", "结果", ["file.save"])
    ]
  };
  layout.panel = { ...layout.panel, visible: true, position: "right", size: 320 };
  return {
    ...look("hy-dark"),
    layout,
    activity: [stack("tree", "工作树", "list-tree", [section("model", "模型", "list-tree", "outline"), section("lib", "库", "files", "explorer", "bottom")])],
    auxiliary: [box("props", "特性", "props", "properties")],
    panel: [tab("result", "结果", "cadtable", "resultTable"), tab("log", "输出", "terminal", "output")],
    editors: [editor("vp", "模型", "persp", "viewport3d")],
    statusBar: zones([chip("unit", "kN, m")])
  };
}

export const structure: WorkTypeDef = {
  id: "structure",
  name: "结构分析",
  summary: "建模、荷载、分析和结果。三套方案共用同一批定义对话框。",
  views: ["explorer", "outline", "output", "properties", "resultTable", "viewport3d"],
  commands,
  menus,
  dialogs,
  schemes: [
    { id: "structure-best", tier: "best", name: "工程分析工作台", desc: "左模型树、右特性、底部通栏结果表。", source: "01-AutoCAD侧/C · ETABS", reason: "模型和结果同时可见", score: { efficiency: 55, aesthetic: 19, learn: 13 }, ui: bench() },
    { id: "structure-good", tier: "good", name: "流程向导", desc: "活动栏按建模、荷载、分析、结果分步，弹窗也分步。", source: "PKPM / 盈建科", reason: "一步一块，对照要切换", score: { efficiency: 44, aesthetic: 16, learn: 12 }, ui: wizard() },
    { id: "structure-basic", tier: "basic", name: "功能区加右侧结果", desc: "功能区和工作树，结果表在右侧。", source: "MIDAS Civil NX", reason: "结果和模型左右抢宽度", score: { efficiency: 40, aesthetic: 15, learn: 13 }, ui: ribbon() }
  ]
};
