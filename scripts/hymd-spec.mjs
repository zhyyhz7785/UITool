// HyMd skins/design 与 UITool「文档写作」之间的字段对照。不读盘。
export const STAMP = "由设计器连接写回";

/** 方案 → 皮肤文件、HyMd 配色名。 */
export const SCHEMES = [
  { scheme: "writing-good", skin: "vscode", colorTheme: "HyMd VS Code Dark", file: "vscode.json" },
  { scheme: "writing-basic", skin: "notion", colorTheme: "HyMd Notion Light", file: "notion.json" },
  { scheme: "writing-best", skin: "obsidian", colorTheme: "HyMd Obsidian Dark", file: "obsidian.json" }
];

const EN = {
  explorer: "Explorer",
  files: "Files",
  search: "Search",
  scm: "Source Control",
  paper: "Paper",
  bookmarks: "Bookmarks",
  refs: "References",
  related: "Related",
  theme: "Theme",
  outline: "Outline",
  docMeta: "Info",
  backlinks: "Backlinks",
  localGraph: "Local graph",
  tags: "Tags"
};

const clone = (v) => JSON.parse(JSON.stringify(v));

function titleOf(node) {
  if (!node) return "";
  if (typeof node.title === "string") return node.title;
  return node.title?.zh || node.id || "";
}

function containersFrom(list, prev) {
  const oldSections = (prev || []).flatMap((box) => box.sections || []);
  return (list || []).map((c) => {
    const old = (prev || []).find((box) => box.id === c.id);
    const sections = (c.views || []).map((view) => {
      const oldSec = old?.sections?.find((s) => s.view === view) || oldSections.find((s) => s.view === view);
      return {
        id: oldSec?.id || `${c.id}-${view}`,
        title: oldSec?.title || view,
        view,
        icon: oldSec?.icon || "layout",
        anchor: "top",
        header: oldSec?.header ?? true,
        actions: oldSec?.actions || []
      };
    });
    return {
      id: c.id,
      title: titleOf(c) || c.id,
      icon: old?.icon || sections[0]?.icon || "layout",
      header: c.header === "icon" ? "icon" : "show",
      headerActions: old?.headerActions || [],
      bottomOrder: old?.bottomOrder || "down",
      sections
    };
  });
}

function panelsFrom(views, prev) {
  return (views || []).map((view) => {
    const old = (prev || []).find((p) => p.view === view);
    return { id: old?.id || view, title: old?.title || view, icon: old?.icon || "layout", view };
  });
}

function commandItems(ids, prefix) {
  return (ids || []).filter(Boolean).map((command) => ({ id: `${prefix}-${command}`, command }));
}

/** 把一份 HyMd 皮肤规格盖到方案界面上。ribbon 是侧面或顶上的一排，没有功能区分组。 */
export function overlayHymd(ui, spec) {
  const next = clone(ui);
  const L = spec.layout || {};
  next.layout.primarySideBar = { ...next.layout.primarySideBar, visible: L.sideBar !== false };
  next.layout.auxiliaryBar = { ...next.layout.auxiliaryBar, visible: !!L.auxiliaryBar };
  next.layout.panel = { ...next.layout.panel, visible: !!L.panel };
  next.layout.statusBar = { ...next.layout.statusBar, visible: L.statusBar !== false };
  if (L.activity === "hidden") next.layout.activityBar = { ...next.layout.activityBar, visible: false };
  else if (L.activity === "top" || L.activity === "side") next.layout.activityBar = { ...next.layout.activityBar, visible: true, position: L.activity };
  next.layout.editor = { ...next.layout.editor, tabs: L.editorTabs !== false };
  next.layout.titleBar = { ...next.layout.titleBar, commandCenter: !!L.commandCenter };
  const row = {
    id: "ribbon",
    title: "功能区",
    start: commandItems(spec.ribbon?.start, "rs"),
    center: [],
    end: commandItems(spec.ribbon?.end, "re")
  };
  const has = row.start.length + row.end.length > 0;
  if (L.ribbon === "side" && has) {
    next.layout.toolbars.side = { ...next.layout.toolbars.side, visible: true, position: next.layout.toolbars.side.position || "left", style: "icon", rows: [row] };
    next.layout.toolbars.top = { ...next.layout.toolbars.top, visible: false, rows: [] };
  } else if (L.ribbon === "top" && has) {
    next.layout.toolbars.top = { ...next.layout.toolbars.top, visible: true, style: "icon", rows: [row] };
    next.layout.toolbars.side = { ...next.layout.toolbars.side, visible: false, rows: [] };
  } else {
    next.layout.toolbars.side = { ...next.layout.toolbars.side, visible: false };
    next.layout.toolbars.top = { ...next.layout.toolbars.top, visible: false };
  }
  next.activity = containersFrom(spec.side, next.activity);
  next.auxiliary = containersFrom(spec.auxiliary, next.auxiliary);
  next.panel = panelsFrom(spec.panel, next.panel);
  return next;
}

const FONT_COLORS = [
  ["default", "", "默认"],
  ["gray", "#6b7280", "灰"],
  ["red", "#dc2626", "红"],
  ["orange", "#ea580c", "橙"],
  ["yellow", "#ca8a04", "黄"],
  ["green", "#16a34a", "绿"],
  ["blue", "#2563eb", "蓝"],
  ["purple", "#7c3aed", "紫"],
  ["pink", "#db2777", "粉"]
];

const BG_COLORS = [
  ["default", "", "无"],
  ["gray", "#e5e7eb", "灰"],
  ["red", "#fecaca", "红"],
  ["orange", "#fed7aa", "橙"],
  ["yellow", "#fef08a", "黄"],
  ["green", "#bbf7d0", "绿"],
  ["blue", "#bfdbfe", "蓝"],
  ["purple", "#e9d5ff", "紫"],
  ["pink", "#fbcfe8", "粉"]
];

function swatches(prefix, rows) {
  return rows.map(([id, color, label]) => ({ id: `${prefix}-${id}`, label, color }));
}

function preferencesItem() {
  return {
    id: "preferences",
    title: "首选项",
    items: [
      { id: "pref-settings", command: "workbench.action.openSettings", title: "设置" },
      { id: "pref-theme", command: "workbench.action.selectTheme", title: "首选项：颜色主题" },
      { id: "pref-skin", command: "workbench.action.selectSkin", title: "首选项：界面皮肤" },
      { id: "pref-activity", title: "侧栏图标放在侧面" },
      { id: "pref-ws", command: "workbench.action.openWorkspaceSettings", title: "打开工作区设置" }
    ]
  };
}

function openRecentItem() {
  return {
    id: "openRecent",
    title: "最近打开",
    items: [
      { id: "recent-ws", title: "工作区" },
      { id: "recent-dir", title: "文件夹" },
      { id: "recent-file", title: "文件" },
      { separator: true },
      { id: "recent-more", command: "workbench.action.openRecent", title: "更多…" }
    ]
  };
}

function colorMenu() {
  return {
    id: "color",
    title: "颜色",
    ghost: true,
    items: [
      { id: "color-fg", title: "字体颜色", swatches: swatches("fg", FONT_COLORS) },
      { id: "color-bg", title: "背景颜色", swatches: swatches("bg", BG_COLORS) }
    ]
  };
}

function menuToken(x) {
  if (!x || x.separator) return x?.separator ? "—" : "";
  if (x.id === "preferences" || x.id === "@preferences" || x.command === "@preferences") return "@preferences";
  if (x.id === "openRecent" || x.id === "@openRecent" || x.command === "@openRecent") return "@openRecent";
  return x.command || "";
}

/** HyMd 菜单没有标题。标题用预设里同 id 的那条。`@子菜单` 展开成子项；色板另成一个默认隐身的菜单。 */
export function hymdMenusFrom(doc, fallback) {
  const byId = new Map((fallback || []).map((m) => [m.id, m]));
  const menus = (doc?.menus || []).map((m) => ({
    id: m.id,
    title: byId.get(m.id)?.title || m.id,
    items: (m.items || [])
      .map((x) => {
        if (x === "—" || x === "sep" || x === "-") return { separator: true };
        if (x === "@preferences") return preferencesItem();
        if (x === "@openRecent") return openRecentItem();
        return { command: x };
      })
      .filter((x) => x.separator || x.command || x.items || x.title)
  }));
  if (!menus.some((m) => m.id === "color")) menus.push(colorMenu());
  return menus;
}

/** 资源管理器标题上那排会躲开的按钮。 */
export function stampExplorerGhost(ui) {
  if (!ui) return ui;
  const actions = [
    { id: "ex-back", icon: "back", display: "icon", tooltip: "后退到父目录" },
    { id: "ex-forward", icon: "forward", display: "icon", tooltip: "进入当前选中的文件夹" },
    { id: "ex-close", command: "workbench.action.closeFolder", icon: "close", display: "icon", tooltip: "关闭文件夹" },
    { id: "ex-empty", icon: "list", display: "icon", tooltip: "显示不含可显示文件的文件夹" },
    { id: "ex-filter", icon: "filter", display: "icon", tooltip: "按类型筛选文件" },
    { id: "ex-file", icon: "new", display: "icon", tooltip: "新建文件" },
    { id: "ex-folder", icon: "open", display: "icon", tooltip: "新建文件夹" },
    { id: "ex-refresh", icon: "refresh", display: "icon", tooltip: "从磁盘刷新" },
    { id: "ex-collapse", icon: "expand", display: "icon", tooltip: "全部折叠" },
    { id: "ex-snap", icon: "history", display: "icon", tooltip: "工作区快照" }
  ];
  const mark = (box) => {
    const views = (box.sections || []).map((s) => s.view);
    if (box.id !== "explorer" && !views.includes("explorer")) return box;
    return { ...box, ghost: true, headerActions: actions };
  };
  return { ...ui, activity: (ui.activity || []).map(mark) };
}

function idsOf(items) {
  return (items || []).map((i) => i.command).filter(Boolean);
}

function container(c) {
  return {
    id: c.id,
    title: { zh: c.title, en: EN[c.id] ?? c.title },
    header: c.header === "icon" ? "icon" : "text",
    views: (c.sections || []).map((s) => s.view)
  };
}

/** 方案 → HyMd 皮肤规格。 */
export function specFromHymd(scheme) {
  const meta = SCHEMES.find((s) => s.scheme === scheme.id);
  const ui = scheme.ui;
  const L = ui.layout;
  const sideOn = !!(L.toolbars.side.visible && L.toolbars.side.rows.length);
  const topOn = !!(L.toolbars.top.visible && L.toolbars.top.rows.length);
  const where = sideOn ? "side" : topOn ? "top" : "hidden";
  const row = (sideOn ? L.toolbars.side : topOn ? L.toolbars.top : null)?.rows?.[0];
  return {
    $comment: STAMP,
    skin: meta?.skin,
    scheme: scheme.id,
    name: scheme.name,
    source: scheme.source,
    colorTheme: meta?.colorTheme,
    layout: {
      sideBar: L.primarySideBar.visible,
      auxiliaryBar: L.auxiliaryBar.visible,
      panel: L.panel.visible,
      statusBar: L.statusBar.visible,
      activity: L.activityBar.visible ? L.activityBar.position : "hidden",
      ribbon: where,
      editorTabs: L.editor.tabs,
      commandCenter: L.titleBar.commandCenter
    },
    side: (ui.activity || []).map(container),
    auxiliary: (ui.auxiliary || []).map(container),
    panel: (ui.panel || []).map((p) => p.view),
    ribbon: row ? { start: idsOf(row.start), end: idsOf(row.end) } : null
  };
}

export function hymdMenuSpec(menus) {
  return {
    $comment: STAMP,
    menus: (menus || [])
      .filter((m) => m.id !== "color")
      .map((m) => ({
        id: m.id,
        items: (m.items || []).map(menuToken).filter((x) => x)
      }))
      .filter((m) => m.items.length)
  };
}


export { hymdSidePages } from "./hymd-pages.mjs";
