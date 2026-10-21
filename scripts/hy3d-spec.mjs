// hy3d ui/design 与 UITool 设计文件之间的字段对照。不读盘，设计器也能引用。
export const STAMP = "由 UITool/scripts/push-hy3d.mjs 从 Hy3d制图.uitool.json 写回";

/** 方案 id → hy3d 皮肤与规格文件名。菜单：功能区与分析工作台共用 menus.json。 */
export const SCHEMES = [
  { scheme: "cad2d-best", skin: "ribbon-top", file: "ribbon.json", menus: "main" },
  { scheme: "cad2d-good", skin: "blender", file: "blender.json", menus: "blender" },
  { scheme: "cad2d-basic", skin: "workbench", file: "workbench.json", menus: "main" }
];

const EN = {
  layers: "Layers",
  props: "Properties",
  tree: "Outline",
  right: "Properties",
  left: "Model"
};

const VIEW_ICON = { layers: "layer", properties: "props", outline: "list-tree", commandline: "terminal", output: "term", viewport2d: "persp" };
const VIEW_TITLE = { layers: "图层", properties: "特性", outline: "大纲", commandline: "命令栏", output: "输出", viewport2d: "模型" };

/** 面板名 → 面上的命令。menu 里的成员收进下拉，不单独占一颗按钮。第一颗成功放上去的是大按钮。 */
const RIBBON_FACE = {
  绘图: {
    face: ["cad.line", "cad.pline", "cad.circle", "cad.arc", "cad.rect"],
    families: {
      "cad.circle": ["cad.circle", "cad.circle.ttt"],
      "cad.arc": ["cad.arc", "cad.arc.sce", "cad.arc.sca", "cad.arc.scl", "cad.arc.sea", "cad.arc.sed", "cad.arc.ser", "cad.arc.cse", "cad.arc.csa", "cad.arc.csl", "cad.arc.con"],
      "cad.rect": ["cad.rect", "cad.polygon"]
    }
  },
  修改: { face: ["cad.move", "cad.copy", "cad.stretch", "cad.rotate", "cad.mirror", "cad.scale", "cad.trim", "cad.extend", "cad.fillet", "cad.array"] },
  缩放与显示: {
    face: ["cad.pan", "cad.zoomext", "cad.regen", "cad.hide", "cad.isolate", "cad.unisolate"],
    families: { "cad.zoomext": ["cad.zoomext", "cad.zoomin", "cad.zoomout", "cad.zoomwin", "cad.zoomsel"] }
  },
  界面: { face: ["ui.fullscreen", "view.left", "view.right", "hw.cmdbar", "view.bottom"] },
  求解: { face: ["hy.solve", "hy.check", "hy.bmd", "hy.sfd", "hy.nfd"] }
};

/** 面板名旁边的启动箭头。 */
const LAUNCHERS = { 绘图: "cad.hatch", 图层: "cad.layer", 标注: "cad.dimstyle", 荷载: "hy.combo" };

/** hy3d 状态栏实际画出的顺序和短名。 */
export const STATUS_TOGGLES = [
  { id: "cad.osnap", short: "捕捉" },
  { id: "cad.grid", short: "栅格" },
  { id: "cad.ortho", short: "正交" },
  { id: "cad.polar", short: "极轴" },
  { id: "cad.otrack", short: "追踪" },
  { id: "cad.dyn", short: "动态" },
  { id: "cad.lw", short: "线宽" }
];

function defaultFace(name, ids) {
  const known = RIBBON_FACE[name];
  const has = new Set(ids);
  if (!known) return ids.map((id, i) => ({ id, size: i === 0 ? "big" : "small" }));
  const used = new Set();
  const face = [];
  for (const id of known.face) {
    if (!has.has(id) || used.has(id)) continue;
    used.add(id);
    const menu = [];
    for (const member of (known.families && known.families[id]) || [id]) {
      if (member === id || !has.has(member) || used.has(member)) continue;
      used.add(member);
      menu.push(member);
    }
    const slot = { id, size: face.length === 0 ? "big" : "small" };
    if (menu.length) slot.menu = menu;
    if (id === "cad.zoomext") slot.text = "缩放";
    face.push(slot);
  }
  return face;
}

function cleanSlot(raw, has) {
  const id = raw && (raw.id || raw.command);
  if (!id || (has.size && !has.has(id))) return null;
  const menu = (raw.menu || []).filter((item) => item && item !== id && (!has.size || has.has(item)));
  const slot = { id, size: raw.size === "big" ? "big" : "small" };
  if (menu.length) slot.menu = menu;
  if (raw.text) slot.text = raw.text;
  return slot;
}

/** 面板上的面上按钮。规格里已有 face 就用它，否则按 RIBBON_FACE 生成。 */
export function resolveFace(panel) {
  const ids = (panel?.ids || panel?.commands || []).filter(Boolean);
  const has = new Set(ids);
  const given = Array.isArray(panel?.face) ? panel.face.map((raw) => cleanSlot(raw, has)).filter(Boolean) : [];
  if (given.length) return given;
  return defaultFace(panel?.title || panel?.id || "", ids);
}

/** 一块 hy3d 面板 → 设计器里的功能区分组。 */
export function groupFromPanel(panel) {
  const ids = [...(panel?.ids || [])].filter(Boolean);
  const face = resolveFace({ ...panel, ids });
  const group = {
    id: panel.id,
    title: panel.title || panel.id,
    commands: ids,
    slots: face.map((slot) => ({
      command: slot.id,
      size: slot.size,
      ...(slot.menu ? { menu: slot.menu } : {}),
      ...(slot.text ? { text: slot.text } : {})
    }))
  };
  const launcher = LAUNCHERS[group.title];
  if (launcher) group.launcher = launcher;
  return group;
}

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
        title: oldSec?.title || VIEW_TITLE[view] || view,
        view,
        icon: oldSec?.icon || VIEW_ICON[view] || "layout",
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
    return {
      id: old?.id || view,
      title: old?.title || VIEW_TITLE[view] || view,
      icon: old?.icon || VIEW_ICON[view] || "layout",
      view
    };
  });
}

function rowsFromTabs(tabs, withSlots) {
  return (tabs || []).map((t) => {
    const groups = (t.panels || []).map((p) => {
      const group = groupFromPanel(p);
      if (withSlots) return group;
      return { id: group.id, title: group.title, commands: group.commands };
    });
    const start = groups.flatMap((g) => g.commands.filter(Boolean).map((command) => ({ id: `${t.id}-${g.id}-${command}`, command })));
    return { id: t.id, title: t.title || t.id, start, center: [], end: [], groups };
  });
}

function rowsFromToolbar(rows) {
  return (rows || []).map((r) => ({
    id: r.id,
    title: r.title || r.id,
    start: (r.commands || []).filter(Boolean).map((command) => ({ id: `${r.id}-${command}`, command })),
    center: [],
    end: []
  }));
}

function commandItem(id, titles) {
  return { id: "q-" + id, command: id, text: titles.get(id) || id };
}

function toggleId(item) {
  if (typeof item === "string") return item;
  return item && item.id;
}

export function normalizeToggles(raw) {
  const list = Array.isArray(raw) && raw.length ? raw : STATUS_TOGGLES;
  return list
    .map((item) => {
      const id = toggleId(item);
      if (!id) return null;
      const known = STATUS_TOGGLES.find((t) => t.id === id);
      const short = (item && item.short) || known?.short || id;
      return { id, short };
    })
    .filter(Boolean);
}

/** 把一份 hy3d 规格盖到方案的界面上。页签写成带 groups 的工具栏排。 */
export function overlayScheme(ui, spec, commands) {
  const next = clone(ui);
  const L = spec.layout || {};
  const titles = new Map((commands || []).map((c) => [c.id, c.title]));
  next.layout.primarySideBar = { ...next.layout.primarySideBar, visible: L.sideBar !== false };
  next.layout.auxiliaryBar = { ...next.layout.auxiliaryBar, visible: !!L.auxiliaryBar };
  next.layout.panel = { ...next.layout.panel, visible: !!L.panel };
  next.layout.statusBar = { ...next.layout.statusBar, visible: L.statusBar !== false };
  if (L.activity === "hidden") next.layout.activityBar = { ...next.layout.activityBar, visible: false };
  else if (L.activity === "top" || L.activity === "side") next.layout.activityBar = { ...next.layout.activityBar, visible: true, position: L.activity };
  next.layout.editor = { ...next.layout.editor, tabs: L.editorTabs !== false };
  const ribbon = spec.skin === "ribbon-top";
  next.layout.titleBar = { ...next.layout.titleBar, commandCenter: !!L.commandCenter, search: ribbon };
  if (Array.isArray(spec.quick)) next.layout.titleBar.left = spec.quick.filter(Boolean).map((id) => commandItem(id, titles));
  if (ribbon) {
    next.layout.titleBar.menu = "ownrow";
    next.layout.titleBar.commandCenter = false;
    next.layout.titleBar.right = [];
    const toggles = normalizeToggles(spec.statusToggles);
    next.statusBar = {
      start: [{ id: "coord", text: "0.0000, 0.0000, 0.0000" }],
      center: [{ id: "model", text: "模型" }, { id: "layout", text: "布局" }],
      end: [...toggles.map((t) => ({ id: "st-" + t.id, command: t.id, text: t.short })), { id: "scale", text: "1:1" }]
    };
    next.editors = [
      { id: "start", title: "开始", icon: "file", view: "viewport2d" },
      { id: "sample", title: "示例", icon: "file", view: "viewport2d" }
    ];
  } else if (Array.isArray(spec.statusToggles)) {
    next.statusBar = {
      ...next.statusBar,
      end: spec.statusToggles.map(toggleId).filter(Boolean).map((id) => ({ id: "st-" + id, command: id, text: titles.get(id) || id }))
    };
  }
  const rows = spec.tabs?.length ? rowsFromTabs(spec.tabs, ribbon) : rowsFromToolbar(spec.toolbarRows);
  const style = L.toolbarStyle && L.toolbarStyle !== "hidden" ? L.toolbarStyle : "icon";
  if (L.toolbar === "top") {
    next.layout.toolbars.top = { ...next.layout.toolbars.top, visible: rows.length > 0, style, rows };
    next.layout.toolbars.side = { ...next.layout.toolbars.side, visible: false, rows: [] };
  } else if (L.toolbar === "side") {
    next.layout.toolbars.side = { ...next.layout.toolbars.side, visible: rows.length > 0, style, position: next.layout.toolbars.side.position || "left", rows };
    next.layout.toolbars.top = { ...next.layout.toolbars.top, visible: false, rows: [] };
  }
  next.activity = containersFrom(spec.side, next.activity);
  next.auxiliary = containersFrom(spec.auxiliary, next.auxiliary);
  next.panel = panelsFrom(spec.panel, next.panel);
  return next;
}

export function menusFrom(doc) {
  return (doc?.menus || []).map((m) => ({
    id: m.id,
    title: m.title,
    items: (m.items || [])
      .map((x) => (x === "—" || x === "sep" || x === "-" ? { separator: true } : { command: x }))
      .filter((x) => x.separator || x.command)
  }));
}

/** 打开设计时顶层呈现跟主方案一致。 */
export function stampActive(config) {
  const scheme = config.schemes.find((s) => s.id === config.scheme);
  if (!scheme) return config;
  const ui = scheme.ui;
  return {
    ...config,
    theme: ui.theme,
    density: ui.density,
    icons: ui.icons,
    layout: ui.layout,
    activity: ui.activity,
    auxiliary: ui.auxiliary,
    panel: ui.panel,
    editors: ui.editors,
    statusBar: ui.statusBar,
    menus: scheme.menus ?? config.menus
  };
}

function container(c) {
  return {
    id: c.id,
    title: { zh: c.title, en: EN[c.id] ?? c.title },
    header: c.header === "icon" ? "icon" : "text",
    views: (c.sections || []).map((s) => s.view)
  };
}

function keepId(id) {
  return !!id && !isForeign(id);
}

function commandsOfRow(row) {
  if (Array.isArray(row.groups)) return row.groups.flatMap((g) => (g.commands || []).filter(keepId));
  return [...(row.start || []), ...(row.center || []), ...(row.end || [])].map((i) => i.command).filter(keepId);
}

function faceFromGroup(group) {
  return (group.slots || [])
    .filter((slot) => keepId(slot.command))
    .map((slot) => {
      const menu = (slot.menu || []).filter(keepId);
      const face = { id: slot.command, size: slot.size === "small" ? "small" : "big" };
      if (menu.length) face.menu = menu;
      if (slot.text) face.text = slot.text;
      return face;
    });
}

function rowToTab(row) {
  const panels = Array.isArray(row.groups)
    ? row.groups.map((g) => {
        const panel = { id: g.id, title: g.title || g.id, ids: (g.commands || []).filter(keepId) };
        const face = faceFromGroup(g);
        if (face.length) panel.face = face;
        if (g.launcher) panel.launcher = g.launcher;
        return panel;
      })
    : [{ id: row.id, title: row.title || row.id, ids: commandsOfRow(row) }];
  return { id: row.id, title: row.title || row.id, panels };
}

/** 方案 → hy3d 规格。功能区与 Blender 写 tabs；分析工作台不写。 */
export function specFromScheme(scheme, skin) {
  const ui = scheme.ui;
  const L = ui.layout;
  const top = L.toolbars.top;
  const side = L.toolbars.side;
  const topOn = !!(top.visible && top.rows.length > 0);
  const sideOn = !!(side.visible && side.rows.length > 0);
  const toolbar = topOn ? "top" : sideOn ? "side" : "hidden";
  const bar = topOn ? top : sideOn ? side : null;
  const rows = bar ? bar.rows : [];
  const spec = {
    $comment: STAMP,
    skin,
    scheme: scheme.id,
    name: scheme.name,
    source: scheme.source,
    colorTheme: "acad-b",
    layout: {
      sideBar: L.primarySideBar.visible,
      auxiliaryBar: L.auxiliaryBar.visible,
      panel: L.panel.visible,
      statusBar: L.statusBar.visible,
      activity: L.activityBar.visible ? L.activityBar.position : "hidden",
      toolbar,
      toolbarStyle: bar ? bar.style || "icon" : "hidden",
      editorTabs: L.editor.tabs,
      commandCenter: L.titleBar.commandCenter
    },
    side: (ui.activity || []).map(container),
    auxiliary: (ui.auxiliary || []).map(container),
    panel: (ui.panel || []).map((p) => p.view),
    toolbarRows: rows.map((r) => ({ id: r.id, title: r.title || r.id, commands: commandsOfRow(r) }))
  };
  if (skin === "blender" || skin === "ribbon-top") {
    spec.tabs = rows.map(rowToTab);
    spec.quick = (L.titleBar.left || []).map((i) => i.command).filter(keepId);
    const toggles = (ui.statusBar?.end || []).map((i) => i.command).filter(keepId);
    spec.statusToggles = skin === "ribbon-top"
      ? toggles.map((id) => {
          const known = STATUS_TOGGLES.find((t) => t.id === id);
          const item = (ui.statusBar?.end || []).find((entry) => entry.command === id);
          return { id, short: item?.text || known?.short || id };
        })
      : toggles;
  }
  return spec;
}

export function menuSpec(menus) {
  return {
    $comment: STAMP,
    menus: (menus || [])
      .map((m) => ({
        id: m.id,
        title: m.title,
        items: (m.items || []).map((x) => (x.separator ? "—" : x.command)).filter((x) => x === "—" || keepId(x))
      }))
      .filter((m) => m.items.some((x) => x !== "—"))
  };
}

export function isForeign(id) {
  return typeof id === "string" && id.startsWith("workbench.action.");
}

/** 规格和菜单里出现、又不是设计器自带动作的命令，必须在 hy3d 登记表里。 */
export function referencedIds(specs, menuDocs) {
  const ids = new Set();
  const add = (id) => {
    if (id && id !== "—" && !isForeign(id)) ids.add(id);
  };
  for (const spec of specs) {
    for (const row of spec.toolbarRows || []) for (const id of row.commands || []) add(id);
    for (const tab of spec.tabs || []) {
      for (const panel of tab.panels || []) {
        for (const id of panel.ids || []) add(id);
        for (const slot of panel.face || []) {
          add(slot.id);
          for (const id of slot.menu || []) add(id);
        }
        add(panel.launcher);
      }
    }
    for (const id of spec.quick || []) add(id);
    for (const item of spec.statusToggles || []) add(toggleId(item));
  }
  for (const doc of menuDocs) for (const m of doc.menus || []) for (const id of m.items || []) add(id);
  return ids;
}

