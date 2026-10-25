// hy3d ui/design 与 UITool 设计文件之间的字段对照。不读盘，设计器也能引用。
// 往返只认 ribbon.json、workbench.json、menus.json。Blender 规格不读不写。
export const STAMP = "由 UITool/scripts/push-hy3d.mjs 从 Hy3d制图.uitool.json 写回";

/** 方案 id → hy3d 皮肤与规格文件名。两套方案共用 menus.json。cad2d-good 留在设计文件里，不进这张表。 */
export const SCHEMES = [
  { scheme: "cad2d-best", skin: "ribbon-top", file: "ribbon.json", menus: "main" },
  { scheme: "cad2d-basic", skin: "workbench", file: "workbench.json", menus: "main" }
];

export const MENU_FILE = "menus.json";

const BANNED_DESIGN = new Set(["blender.json", "menus.blender.json"]);

/** hy3d 的 key 里混有单字母命令名。只有真正的快捷键才进设计器的 keybinding。 */
export function isShortcut(key) {
  return !!key && (/^(Ctrl|Alt|Shift|F\d|Del)/.test(key) || String(key).includes("+"));
}

function includePath(rel) {
  let n = String(rel ?? "").replace(/\\/g, "/").trim();
  while (n.startsWith("./")) n = n.slice(2);
  if (!n || n.startsWith("/") || /^[A-Za-z]:/.test(n) || n.split("/").includes("..")) {
    throw new Error("include 路径必须相对 ui/：" + rel);
  }
  return n;
}

/**
 * 展开 ui/commands.json。新格式是 { include: ["commands/file.json", ...] }，路径相对 ui/。
 * 也接受旧的 { commands: [...] }；两样都有时先走 include，再收下本文件的 commands。
 * read 收到相对 ui/ 的路径，返回已解析的 JSON。
 */
export async function collectCommands(doc, read) {
  const out = [];
  const seen = new Set();
  async function walk(node, from) {
    if (!node || typeof node !== "object" || Array.isArray(node)) throw new Error("命令文件不是对象" + (from ? "：" + from : ""));
    const hasInclude = Array.isArray(node.include);
    const hasCommands = Array.isArray(node.commands);
    if (!hasInclude && !hasCommands) throw new Error("命令文件没有 include 或 commands" + (from ? "：" + from : ""));
    if (hasInclude) {
      for (const rel of node.include) {
        const key = includePath(rel);
        if (seen.has(key)) throw new Error("命令 include 重复或循环：" + key);
        seen.add(key);
        await walk(await read(key), key);
      }
    }
    if (hasCommands) for (const command of node.commands) if (command && command.id) out.push(command);
  }
  await walk(doc, "");
  return out;
}

/** hy3d 命令 → 设计器命令。label→title，cat→category，key→keybinding，保留 id、icon，并带上预设要用的 core。 */
export function designerCommand(raw) {
  if (!raw || !raw.id) throw new Error("hy3d 命令缺少 id");
  const command = {
    id: raw.id,
    title: typeof raw.label === "string" && raw.label ? raw.label : typeof raw.title === "string" && raw.title ? raw.title : raw.id,
    category: typeof raw.cat === "string" ? raw.cat : typeof raw.category === "string" ? raw.category : "",
    icon: typeof raw.icon === "string" && raw.icon ? raw.icon : raw.id === "hw.cmdbar" ? "terminal" : "layout",
    core: raw.id
  };
  const key = raw.key ?? raw.keybinding;
  if (typeof key === "string" && isShortcut(key)) command.keybinding = key;
  return command;
}

export function designerCommands(list) {
  return (list || []).map(designerCommand);
}

export function handDocument(config, customThemes) {
  return { kind: "uitool-design", version: 1, config, customThemes: customThemes ?? [] };
}

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

/** 方案 → hy3d 规格。ribbon-top 写 tabs、quick、statusToggles；workbench 只写工具排和停靠，不写 tabs。 */
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
  // blender 皮肤已不往返。仍按功能区写页签，避免旧调用丢掉字段。
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

/** 把功能区和分析工作台盖到已有的 cad2d 设计上。不读 cad2d-good。当前方案定为 cad2d-best。 */
export function applyHy3dSpecs(config, parts) {
  const menuMain = menusFrom(parts.menus);
  const byFile = { "ribbon.json": parts.ribbon, "workbench.json": parts.workbench };
  for (const s of SCHEMES) {
    const scheme = config.schemes?.find((x) => x.id === s.scheme);
    if (!scheme) throw new Error("没有方案 " + s.scheme);
    const spec = byFile[s.file];
    if (!spec) throw new Error("没有规格 " + s.file);
    scheme.ui = overlayScheme(scheme.ui, spec, parts.commands || []);
    scheme.menus = menuMain;
  }
  config.commands = parts.commands || [];
  config.sidePages = [];
  config.scheme = "cad2d-best";
  return stampActive(config);
}

/** 只读 ribbon、workbench、menus 和 commands.json。Blender 文件缺失也不读、不抛。 */
export async function loadHy3dBundle(readUiText) {
  const json = async (rel) => JSON.parse(await readUiText(rel));
  const ribbon = await json("design/ribbon.json");
  const workbench = await json("design/workbench.json");
  const menus = await json(`design/${MENU_FILE}`);
  const commands = designerCommands(await collectCommands(await json("commands.json"), json));
  return { ribbon, workbench, menus, commands };
}

/** 从 cad2d 设计做出要写回的规格。不是二维制图、或少了方案，直接抛，不写盘。 */
export function hy3dWritePlan(config) {
  if (config?.workType !== "cad2d") throw new Error("当前不是 hy3d 的二维制图，没有写入。");
  let menus = null;
  const specs = [];
  for (const s of SCHEMES) {
    const scheme = config.schemes?.find((x) => x.id === s.scheme);
    if (!scheme?.ui) throw new Error("没有方案 " + s.scheme);
    specs.push({ file: s.file, spec: specFromScheme(scheme, s.skin) });
    if (s.scheme === "cad2d-best") menus = menuSpec(scheme.menus ?? (config.scheme === scheme.id ? config.menus : []));
  }
  if (!menus) throw new Error("没有方案 cad2d-best");
  return { specs, menus };
}

/** 命令缺一条就抛，此时 writeUiText 还没被调用。通过后只写三份规格。 */
export async function commitHy3dDesign(config, readUiText, writeUiText) {
  const plan = hy3dWritePlan(config);
  const json = async (rel) => JSON.parse(await readUiText(rel));
  const known = new Set((await collectCommands(await json("commands.json"), json)).map((c) => c.id).filter(Boolean));
  const missing = [...referencedIds(plan.specs.map((s) => s.spec), [plan.menus])].filter((id) => !known.has(id));
  if (missing.length) throw new Error("缺少 hy3d 命令：" + missing.join(", "));
  const allowed = new Set([...SCHEMES.map((s) => s.file), MENU_FILE]);
  const files = [...plan.specs.map((s) => ({ name: s.file, data: s.spec })), { name: MENU_FILE, data: plan.menus }];
  for (const file of files) {
    if (BANNED_DESIGN.has(file.name) || !allowed.has(file.name)) throw new Error("不会写入 " + file.name);
  }
  for (const file of files) await writeUiText(`design/${file.name}`, JSON.stringify(file.data, null, 2) + "\n");
}

