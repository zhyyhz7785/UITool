import type { SideContainer, UiConfig } from "@tpl/workbench/types";

function container(id: string, title: string, icon: string, view: string): SideContainer {
  return { id, title, icon, header: "show", headerActions: [], bottomOrder: "down", sections: [{ id, title, view, icon, anchor: "top", header: false, actions: [] }] };
}

/** UITool 自己的界面，也是用模板工作台搭的。 */
export const designerConfig: UiConfig = {
  version: 2,
  app: { name: "uitool", title: "UITool · 界面设计器", identifier: "com.hy.uitool", version: "0.1.0", description: "设计 Tauri 2 + React 界面并导出工程", icon: "layout" },
  theme: { id: "hy-dark", accent: null, overrides: {} },
  density: "compact",
  icons: { style: "hy", areas: {}, overrides: {} },
  layout: {
    titleBar: {
      style: "custom",
      menu: "inline",
      commandCenter: true,
      appIcon: true,
      left: [],
      right: [
        { id: "tb-side", command: "workbench.action.toggleSidebarVisibility", icon: "sideleft", tooltip: "切换主侧栏" },
        { id: "tb-panel", command: "workbench.action.togglePanel", icon: "bottom", tooltip: "切换面板" },
        { id: "tb-aux", command: "workbench.action.toggleAuxiliaryBar", icon: "sideright", tooltip: "切换辅助侧栏" }
      ]
    },
    activityBar: { visible: true, position: "side", bottom: [{ id: "settings", command: "workbench.action.openSettings", icon: "settings", tooltip: "设置" }] },
    primarySideBar: { visible: true, position: "left", width: 300 },
    auxiliaryBar: { visible: true, width: 360 },
    panel: { visible: false, position: "bottom", size: 220, align: "center", actions: [{ id: "panel-close", command: "workbench.action.togglePanel", icon: "x", tooltip: "关闭面板" }] },
    editor: { tabs: true, breadcrumbs: false, tabActions: [], breadcrumbActions: [] },
    statusBar: { visible: true },
    toolbars: { top: { visible: false, rows: [] }, side: { visible: false, position: "left", rows: [] } }
  },
  activity: [
    container("presets", "预设", "layout", "presets"),
    container("layout", "布局", "sideleft", "layoutView"),
    container("theme", "主题与配色", "palette", "themeView"),
    container("parts", "部件内容", "components", "partsView"),
    container("icons", "工具图标", "shapes", "iconsView"),
    container("link", "连接", "link", "linkView"),
    container("dialogs", "副页面", "blocks", "dialogsView")
  ],
  auxiliary: [container("props", "属性", "props", "propertiesView")],
  panel: [
    { id: "json", title: "ui.config.json", icon: "braces", view: "jsonView" },
    { id: "guide", title: "说明", icon: "help", view: "guideView" }
  ],
  editors: [{ id: "preview", title: "预览", icon: "monitor", view: "previewView" }],
  menus: [
    { id: "file", title: "文件", items: [{ command: "ut.new" }, { command: "ut.open" }, { command: "ut.save" }, { separator: true }, { command: "ut.export" }, { separator: true }, { command: "workbench.action.quit" }] },
    { id: "edit", title: "编辑", items: [{ command: "ut.undo" }, { command: "ut.redo" }, { separator: true }, { command: "ut.toggleSelect" }, { command: "ut.clearSelection" }] },
    {
      id: "view",
      title: "视图",
      items: [
        { command: "workbench.action.showCommands" },
        { separator: true },
        { command: "workbench.action.toggleSidebarVisibility" },
        { command: "workbench.action.toggleAuxiliaryBar" },
        { command: "workbench.action.togglePanel" },
        { separator: true },
        { command: "workbench.action.selectTheme" }
      ]
    },
    { id: "help", title: "帮助", items: [{ command: "ut.guide" }, { command: "workbench.action.showAbout" }] }
  ],
  statusBar: {
    start: [
      { id: "mode", text: "选择区域", icon: "pointer", kind: "accent", tooltip: "预览里点击选中区域 / 试用界面（Ctrl+E）", command: "ut.toggleSelect" },
      { id: "selected", text: "未选中" }
    ],
    center: [],
    end: [
      { id: "history", text: "" },
      { id: "theme", text: "", icon: "palette", tooltip: "设计器自身的主题", command: "workbench.action.selectTheme" }
    ]
  },
  commands: [
    { id: "ut.new", title: "新建设计", category: "设计", icon: "new", keybinding: "Ctrl+N" },
    { id: "ut.open", title: "打开设计…", category: "设计", icon: "open", keybinding: "Ctrl+O" },
    { id: "ut.save", title: "保存设计…", category: "设计", icon: "save", keybinding: "Ctrl+S" },
    { id: "ut.export", title: "导出工程 zip…", category: "设计", icon: "package", keybinding: "Ctrl+Shift+E" },
    { id: "ut.undo", title: "撤销", category: "设计", icon: "undo", keybinding: "Ctrl+Z" },
    { id: "ut.redo", title: "重做", category: "设计", icon: "redo", keybinding: "Ctrl+Y" },
    { id: "ut.toggleSelect", title: "切换：选择区域 / 试用", category: "设计", icon: "pointer", keybinding: "Ctrl+E" },
    { id: "ut.clearSelection", title: "取消选中", category: "设计", keybinding: "Escape" },
    { id: "ut.guide", title: "使用说明", category: "帮助", icon: "help" }
  ]
};
