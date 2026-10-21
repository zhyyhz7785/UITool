/** 添加按钮时可选的常用命令。图标是语义 id，随图标风格变化。 */
export interface CatalogCommand {
  id: string;
  title: string;
  category: string;
  icon: string;
  keybinding?: string;
  core?: string;
}

export const commandCatalog: CatalogCommand[] = [
  { id: "file.new", title: "新建", category: "文件", icon: "new", keybinding: "Ctrl+N", core: "file.new" },
  { id: "file.open", title: "打开…", category: "文件", icon: "open", keybinding: "Ctrl+O", core: "file.open" },
  { id: "file.save", title: "保存", category: "文件", icon: "save", keybinding: "Ctrl+S", core: "file.save" },
  { id: "file.saveAs", title: "另存为…", category: "文件", icon: "saveas", keybinding: "Ctrl+Shift+S", core: "file.saveAs" },
  { id: "file.export", title: "导出…", category: "文件", icon: "export", core: "file.export" },
  { id: "edit.undo", title: "撤销", category: "编辑", icon: "undo", keybinding: "Ctrl+Z", core: "edit.undo" },
  { id: "edit.redo", title: "重做", category: "编辑", icon: "redo", keybinding: "Ctrl+Y", core: "edit.redo" },
  { id: "edit.find", title: "查找", category: "编辑", icon: "find", keybinding: "Ctrl+F", core: "edit.find" },
  { id: "edit.replace", title: "替换", category: "编辑", icon: "replace", keybinding: "Ctrl+H", core: "edit.replace" },
  { id: "edit.copy", title: "复制", category: "编辑", icon: "copy", keybinding: "Ctrl+C" },
  { id: "edit.paste", title: "粘贴", category: "编辑", icon: "paste", keybinding: "Ctrl+V" },
  { id: "view.zoomIn", title: "放大", category: "视图", icon: "zoom-in" },
  { id: "view.zoomOut", title: "缩小", category: "视图", icon: "zoom-out" },
  { id: "view.zoomFit", title: "适应窗口", category: "视图", icon: "zoom-fit" },
  { id: "view.pan", title: "平移", category: "视图", icon: "pan" },
  { id: "draw.line", title: "直线", category: "绘图", icon: "line", core: "draw.line" },
  { id: "draw.polyline", title: "多段线", category: "绘图", icon: "polyline", core: "draw.polyline" },
  { id: "draw.circle", title: "圆", category: "绘图", icon: "circle", core: "draw.circle" },
  { id: "draw.arc", title: "圆弧", category: "绘图", icon: "arc", core: "draw.arc" },
  { id: "draw.rect", title: "矩形", category: "绘图", icon: "rect", core: "draw.rect" },
  { id: "modify.move", title: "移动", category: "修改", icon: "move", core: "modify.move" },
  { id: "modify.copy", title: "复制", category: "修改", icon: "copy", core: "modify.copy" },
  { id: "modify.rotate", title: "旋转", category: "修改", icon: "rotate", core: "modify.rotate" },
  { id: "modify.scale", title: "缩放", category: "修改", icon: "scale", core: "modify.scale" },
  { id: "modify.trim", title: "修剪", category: "修改", icon: "trim", core: "modify.trim" },
  { id: "modify.offset", title: "偏移", category: "修改", icon: "offset", core: "modify.offset" },
  { id: "view.top", title: "俯视", category: "三维", icon: "view-top" },
  { id: "view.front", title: "前视", category: "三维", icon: "view-front" },
  { id: "view.persp", title: "透视", category: "三维", icon: "persp" },
  { id: "snap.ortho", title: "正交", category: "捕捉", icon: "ortho" },
  { id: "snap.snap", title: "捕捉", category: "捕捉", icon: "snap" },
  { id: "snap.grid", title: "栅格", category: "捕捉", icon: "grid" },
  { id: "task.run", title: "运行", category: "运行", icon: "play", keybinding: "F5", core: "task.run" },
  { id: "workbench.action.showCommands", title: "显示所有命令", category: "工作台", icon: "search" },
  { id: "workbench.action.toggleSidebarVisibility", title: "切换主侧栏", category: "工作台", icon: "sideleft" },
  { id: "workbench.action.toggleAuxiliaryBar", title: "切换辅助侧栏", category: "工作台", icon: "sideright" },
  { id: "workbench.action.togglePanel", title: "切换面板", category: "工作台", icon: "bottom" },
  { id: "workbench.action.openSettings", title: "设置", category: "工作台", icon: "settings" },
  { id: "workbench.action.selectTheme", title: "颜色主题", category: "工作台", icon: "palette" }
];

export const catalogGroups = [...new Set(commandCatalog.map((c) => c.category))];
