import { baseLayout, box, chip, cmd, dialog, editor, look, menu, okCancel, row, section, stack, tab, viewMenu, zones, type WorkTypeDef } from "../kit";

const commands = [
  cmd("file.new", "新建", "文件", "new", { keybinding: "Ctrl+N", core: "file.new" }),
  cmd("file.open", "打开…", "文件", "open", { keybinding: "Ctrl+O", core: "file.open" }),
  cmd("file.save", "保存", "文件", "save", { keybinding: "Ctrl+S", core: "file.save" }),
  cmd("edit.undo", "撤销", "编辑", "undo", { keybinding: "Ctrl+Z", core: "edit.undo" }),
  cmd("edit.redo", "重做", "编辑", "redo", { keybinding: "Ctrl+Y", core: "edit.redo" }),
  cmd("mesh.select", "选择", "工具", "pointer"),
  cmd("mesh.move", "移动", "工具", "move"),
  cmd("mesh.rotate", "旋转", "工具", "rotate"),
  cmd("mesh.scale", "缩放", "工具", "scale"),
  cmd("create.param", "创建参数", "创建", "plus"),
  cmd("mat.edit", "材质", "着色", "material"),
  cmd("render.setup", "渲染设置", "渲染", "render"),
  cmd("render.go", "渲染", "渲染", "camera", { keybinding: "F12", core: "render.go" })
];

const menus = [
  menu("file", "文件", ["file.new", "file.open", "file.save"]),
  menu("edit", "编辑", ["edit.undo", "edit.redo"]),
  menu("tool", "工具", ["mesh.select", "mesh.move", "mesh.rotate", "mesh.scale"]),
  menu("create", "创建", ["create.param", "mat.edit"]),
  menu("render", "渲染", ["render.setup", "render.go"]),
  viewMenu
];

const dialogs = [
  dialog({
    id: "create",
    title: "创建参数",
    command: "create.param",
    groups: ["类型", "尺寸"],
    fields: [
      { id: "kind", label: "物体", type: "select", group: "类型", value: "cube", options: [{ value: "cube", label: "立方体" }, { value: "sphere", label: "球体" }, { value: "cyl", label: "圆柱" }] },
      { id: "size", label: "尺寸", type: "number", group: "尺寸", value: 2 },
      { id: "seg", label: "分段", type: "number", group: "尺寸", value: 16 }
    ],
    actions: okCancel("创建")
  }),
  dialog({
    id: "material",
    title: "材质",
    command: "mat.edit",
    groups: ["表面", "贴图"],
    fields: [
      { id: "name", label: "名称", type: "text", group: "表面", value: "默认" },
      { id: "color", label: "基色", type: "color", group: "表面", value: "#b9b9b9" },
      { id: "metal", label: "金属度", type: "number", group: "表面", value: 0 },
      { id: "map", label: "贴图", type: "text", group: "贴图", placeholder: "无" }
    ],
    actions: okCancel("指定")
  }),
  dialog({
    id: "render",
    title: "渲染设置",
    command: "render.setup",
    groups: ["输出", "采样"],
    fields: [
      { id: "w", label: "宽度", type: "number", group: "输出", value: 1920 },
      { id: "h", label: "高度", type: "number", group: "输出", value: 1080 },
      { id: "samples", label: "采样", type: "number", group: "采样", value: 64 },
      { id: "denoise", label: "降噪", type: "toggle", group: "采样", value: true }
    ],
    actions: okCancel("确定")
  })
];

const tools = ["mesh.select", "mesh.move", "mesh.rotate", "mesh.scale", "create.param", "render.go"];

function blender() {
  const layout = baseLayout();
  layout.dialogStyle = "sheet";
  layout.primarySideBar.visible = false;
  layout.toolbars.side = { visible: true, position: "left", style: "icon", rows: [row("t", "工具", tools)] };
  layout.panel = { ...layout.panel, visible: true, size: 160 };
  layout.auxiliaryBar.width = 300;
  return {
    ...look("blender"),
    layout,
    activity: [box("content", "内容", "files", "explorer")],
    auxiliary: [stack("right", "场景", "list-tree", [section("outliner", "大纲", "list-tree", "outline", "top"), section("props", "属性", "props", "properties", "bottom")])],
    panel: [tab("time", "时间线", "play", "timeline"), tab("log", "信息", "info", "output")],
    editors: [editor("vp", "三维视口", "persp", "viewport3d")],
    statusBar: zones([chip("mode", "物体模式")])
  };
}

function unreal() {
  const layout = baseLayout();
  layout.primarySideBar.visible = false;
  layout.toolbars.top = { visible: true, style: "icon", rows: [row("t", "主工具栏", ["file.save", ...tools])] };
  layout.panel = { ...layout.panel, visible: true, align: "justify", size: 200 };
  return {
    ...look("unreal-starship"),
    layout,
    activity: [box("content", "内容", "files", "explorer")],
    auxiliary: [stack("right", "场景", "list-tree", [section("outliner", "大纲", "list-tree", "outline", "top"), section("props", "细节", "props", "properties", "bottom")])],
    panel: [tab("content", "内容浏览器", "files", "explorer"), tab("time", "时间线", "play", "timeline"), tab("log", "输出", "terminal", "output")],
    editors: [editor("vp", "视口", "persp", "viewport3d")],
    statusBar: zones([chip("fps", "60 fps")])
  };
}

function max() {
  const layout = baseLayout();
  layout.primarySideBar.visible = false;
  layout.toolbars.side = { visible: true, position: "left", style: "icon", rows: [row("t", "工具", tools)] };
  layout.panel.visible = false;
  layout.auxiliaryBar.width = 280;
  return {
    ...look("hy-dark"),
    layout,
    activity: [],
    auxiliary: [
      box("create", "创建", "plus", "properties"),
      box("modify", "修改", "props", "properties"),
      box("hier", "层次", "list-tree", "outline"),
      box("show", "显示", "files", "explorer")
    ],
    panel: [tab("time", "时间线", "play", "timeline"), tab("log", "输出", "terminal", "output")],
    editors: [editor("vp", "视口", "persp", "viewport3d")],
    statusBar: zones([chip("sel", "未选择")])
  };
}

export const model3d: WorkTypeDef = {
  id: "model3d",
  name: "三维建模",
  summary: "视口、大纲、属性、时间和渲染。三套方案共用创建和材质对话框。",
  views: ["explorer", "outline", "output", "properties", "timeline", "viewport3d"],
  commands,
  menus,
  dialogs,
  schemes: [
    { id: "model3d-best", tier: "best", name: "Blender 式", desc: "左工具栏，右大纲和属性上下同时在，底时间线。", source: "05-Blender侧/A", reason: "大纲和属性不用换页", score: { efficiency: 53, aesthetic: 21, learn: 12 }, ui: blender() },
    { id: "model3d-good", tier: "good", name: "底部内容浏览器", desc: "右大纲和细节，底部拉通的内容浏览器。", source: "05-Unreal侧/A · Unity", reason: "找资源快，底栏偏高", score: { efficiency: 48, aesthetic: 18, learn: 13 }, ui: unreal() },
    { id: "model3d-basic", tier: "basic", name: "右侧命令分页", desc: "创建、修改、层次、显示分成右侧页签。", source: "04-3dsMax侧/A", reason: "分页不能一起看", score: { efficiency: 41, aesthetic: 15, learn: 14 }, ui: max() }
  ]
};
