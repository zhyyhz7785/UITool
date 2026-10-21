import { baseLayout, box, chip, cmd, dialog, editor, look, menu, okCancel, row, section, stack, tab, viewMenu, zones, type WorkTypeDef } from "../kit";

const commands = [
  cmd("file.open", "打开…", "文件", "open", { keybinding: "Ctrl+O", core: "file.open" }),
  cmd("file.save", "保存", "文件", "save", { keybinding: "Ctrl+S", core: "file.save" }),
  cmd("edit.undo", "撤销", "编辑", "undo", { keybinding: "Ctrl+Z", core: "edit.undo" }),
  cmd("edit.redo", "重做", "编辑", "redo", { keybinding: "Ctrl+Y", core: "edit.redo" }),
  cmd("data.sort", "排序", "数据", "filter"),
  cmd("data.filter", "筛选", "数据", "filter"),
  cmd("sheet.import", "导入数据", "数据", "import"),
  cmd("sheet.format", "条件格式", "开始", "color"),
  cmd("sheet.pivot", "数据透视", "插入", "pivot"),
  cmd("formula.sum", "求和", "公式", "cadtable")
];

const menus = [
  menu("file", "文件", ["file.open", "file.save", "sep", "sheet.import"]),
  menu("edit", "编辑", ["edit.undo", "edit.redo"]),
  menu("start", "开始", ["sheet.format", "formula.sum"]),
  menu("insert", "插入", ["sheet.pivot"]),
  menu("data", "数据", ["data.sort", "data.filter", "sheet.import"]),
  viewMenu
];

const dialogs = [
  dialog({
    id: "import",
    title: "导入数据",
    command: "sheet.import",
    groups: ["来源", "选项"],
    fields: [
      { id: "path", label: "文件", type: "text", group: "来源", placeholder: ".csv / .xlsx" },
      { id: "sheet", label: "工作表", type: "text", group: "来源", value: "Sheet1" },
      { id: "header", label: "首行是标题", type: "toggle", group: "选项", value: true }
    ],
    actions: okCancel("导入")
  }),
  dialog({
    id: "format",
    title: "条件格式",
    command: "sheet.format",
    groups: ["规则", "外观"],
    fields: [
      { id: "range", label: "区域", type: "text", group: "规则", value: "B2:B99" },
      { id: "op", label: "条件", type: "select", group: "规则", value: "gt", options: [{ value: "gt", label: "大于" }, { value: "lt", label: "小于" }, { value: "dup", label: "重复值" }] },
      { id: "n", label: "值", type: "number", group: "规则", value: 0 },
      { id: "color", label: "填充", type: "color", group: "外观", value: "#f4c7c3" }
    ],
    actions: okCancel("应用")
  }),
  dialog({
    id: "pivot",
    title: "数据透视",
    command: "sheet.pivot",
    groups: ["字段", "值"],
    fields: [
      { id: "rows", label: "行", type: "text", group: "字段", value: "项目" },
      { id: "cols", label: "列", type: "text", group: "字段", value: "月份" },
      { id: "val", label: "值", type: "select", group: "值", value: "sum", options: [{ value: "sum", label: "求和" }, { value: "count", label: "计数" }, { value: "avg", label: "平均" }] }
    ],
    actions: okCancel("创建")
  })
];

const home = ["file.save", "edit.undo", "edit.redo", "formula.sum", "data.filter", "sheet.format"];

function excel() {
  const layout = baseLayout();
  layout.primarySideBar.visible = false;
  layout.auxiliaryBar.visible = false;
  layout.editor.tabs = false;
  layout.toolbars.top = {
    visible: true,
    style: "ribbon",
    rows: [
      row("home", "开始", home),
      row("insert", "插入", ["sheet.pivot"]),
      row("formula", "公式", ["formula.sum"]),
      row("data", "数据", ["data.sort", "data.filter", "sheet.import"])
    ]
  };
  return {
    ...look("hy-white"),
    layout,
    activity: [stack("books", "工作簿", "files", [section("tables", "表", "files", "explorer"), section("fields", "字段", "list-tree", "outline", "bottom")])],
    auxiliary: [box("rec", "记录", "props", "properties")],
    panel: [tab("log", "输出", "terminal", "output")],
    editors: [editor("grid", "Sheet1", "cadtable", "sheet")],
    statusBar: zones([chip("sum", "求和 0", "cadtable")], [chip("zoom", "100%")])
  };
}

function airtable() {
  const layout = baseLayout();
  layout.dialogStyle = "sheet";
  layout.activityBar.visible = false;
  layout.editor.tabs = false;
  layout.toolbars.top = { visible: true, style: "labeled", rows: [row("view", "视图", ["data.filter", "data.sort", "sheet.pivot"])] };
  return {
    ...look("hy-light"),
    layout,
    activity: [stack("base", "基地", "files", [section("tables", "表", "files", "explorer", "top"), section("fields", "字段", "list-tree", "outline", "bottom")])],
    auxiliary: [box("rec", "记录", "props", "properties")],
    panel: [tab("log", "输出", "terminal", "output")],
    editors: [editor("grid", "网格", "cadtable", "sheet")],
    statusBar: zones([chip("n", "2 条记录")])
  };
}

function workbench() {
  const layout = baseLayout();
  layout.activityBar.visible = true;
  layout.panel.visible = true;
  layout.titleBar.commandCenter = true;
  return {
    ...look("hy-dark"),
    layout,
    activity: [box("tables", "表", "files", "explorer"), box("fields", "字段", "list-tree", "outline")],
    auxiliary: [box("rec", "记录", "props", "properties")],
    panel: [tab("log", "输出", "terminal", "output")],
    editors: [editor("grid", "Sheet1", "cadtable", "sheet")],
    statusBar: zones([chip("cell", "B2")])
  };
}

export const sheet: WorkTypeDef = {
  id: "sheet",
  name: "数据表格",
  summary: "网格、公式和透视。三套方案共用导入、条件格式和透视对话框。",
  views: ["explorer", "outline", "output", "properties", "sheet"],
  commands,
  menus,
  dialogs,
  schemes: [
    { id: "sheet-best", tier: "best", name: "功能区表格", desc: "开始、插入、公式、数据四个页签，编辑栏和求和在表格视图里。", source: "Excel · WPS 表格", reason: "填表命令按页放好", score: { efficiency: 53, aesthetic: 17, learn: 14 }, ui: excel() },
    { id: "sheet-good", tier: "good", name: "表列表加记录", desc: "左表和字段，右记录详情，弹窗用抽屉。", source: "Airtable", reason: "改一条记录方便，批量公式远一点", score: { efficiency: 46, aesthetic: 19, learn: 11 }, ui: airtable() },
    { id: "sheet-basic", tier: "basic", name: "工作台页签", desc: "活动栏装表和字段，底栏是输出。", source: "VSCode 布局", reason: "不像表格软件", score: { efficiency: 36, aesthetic: 15, learn: 9 }, ui: workbench() }
  ]
};
