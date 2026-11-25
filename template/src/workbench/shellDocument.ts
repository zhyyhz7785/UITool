import type { Menu, MenuItem, PartId, ToolItem, ToolSlot, UiConfig } from "./types";

export interface ShellOptions {
  onlyPart?: PartId | null;
  onlyMenu?: string | null;
}

const HY3D_DOCKS: [string, string][] = [
  ["files", "文件"],
  ["project", "工程"],
  ["search", "搜索"],
  ["history", "历史"],
  ["layers", "图层"],
  ["outline", "大纲"],
  ["props", "属性"],
  ["en", "英文"]
];

function esc(value: string) {
  return value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}

function attr(name: string, value: string | undefined) {
  if (!value) return "";
  return ` ${name}="${esc(value)}"`;
}

function activeScheme(cfg: UiConfig) {
  return cfg.schemes?.find((s) => s.id === cfg.scheme) ?? cfg.schemes?.[0];
}

function commandOf(cfg: UiConfig, id: string) {
  return cfg.commands.find((c) => c.id === id);
}

function iconId(raw: string) {
  const name = raw.startsWith("h3-") ? raw.slice(3) : raw;
  return /^[A-Za-z0-9._-]+$/.test(name) ? name : "";
}

function hy3dIcon(raw: string) {
  const id = iconId(raw);
  if (!id) return "";
  return `<svg class="ico" aria-hidden="true"><use href="/__uitool/product/hy3d/ui/icons.svg#i-${esc(id)}"/></svg>`;
}

function faceOf(cfg: UiConfig, slot: ToolSlot) {
  const command = commandOf(cfg, slot.command);
  return {
    text: slot.text || command?.title || slot.command,
    icon: slot.icon || command?.icon || ""
  };
}

function packSlots(slots: ToolSlot[]) {
  const columns: { big: boolean; slots: ToolSlot[] }[] = [];
  let stack: ToolSlot[] | null = null;
  for (const slot of slots) {
    if (slot.size === "big" || !stack || stack.length >= 3) {
      stack = [];
      columns.push({ big: slot.size === "big", slots: stack });
      if (slot.size === "big") {
        stack.push(slot);
        stack = null;
        continue;
      }
    }
    stack.push(slot);
  }
  return columns;
}

function menuItems(cfg: UiConfig, menu: Menu, items: MenuItem[]): string {
  return items
    .map((item) => {
      if (item.separator) return `<div class="menu-separator"></div>`;
      const id = item.command || "";
      const title = item.title || commandOf(cfg, id)?.title || id || "菜单";
      const zone = `menu:${menu.id}`;
      return `<button type="button" class="menu-item" data-part="titlebar" data-zone="${esc(zone)}"${attr("data-item", id)}>${esc(title)}</button>`;
    })
    .join("");
}

function menuRow(cfg: UiConfig, menus: Menu[], buttonClass: string) {
  return menus
    .filter((m) => !m.ghost)
    .map((menu) => {
      const zone = `menu:${menu.id}`;
      return `<div class="menu-wrap">
        <button type="button" class="${buttonClass}" data-part="titlebar" data-zone="${esc(zone)}">${esc(menu.title)}</button>
        <div class="menu-dropdown">${menuItems(cfg, menu, menu.items)}</div>
      </div>`;
    })
    .join("");
}

function toolButton(part: string, zone: string, item: string, text: string, icon: string, big: boolean, caret: boolean) {
  return `<button type="button" class="cmd${big ? " big" : " small"}" data-part="${part}" data-zone="${esc(zone)}" data-item="${esc(item)}">${hy3dIcon(icon)}<span>${esc(text)}</span>${caret ? `<i class="caret"></i>` : ""}</button>`;
}

function tokenStyle(tokens: Record<string, string> | undefined) {
  if (!tokens) return "";
  const body = Object.entries(tokens)
    .filter(([key, value]) => key.startsWith("--") && /^--[\w-]+$/.test(key) && !/[{};<>]/.test(value))
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
  return body ? `<style>:root{${body}}</style>` : "";
}

function links(product: "hy3d" | "hymd", files: string[]) {
  return files.map((file) => `<link rel="stylesheet" href="/__uitool/product/${product}/${file}">`).join("");
}

function hy3dStyles(skin: string, palette: string) {
  const files = ["ui/tokens.css", "ui/styles.css", "ui/cad-workspace.css", `ui/palettes/${palette}/palette.css`];
  if (skin === "ribbon-compact") files.push("ui/skins/ribbon-compact/ribbon.css");
  if (skin === "hy-ribbon") files.push("ui/skins/hy-ribbon/ribbon.css");
  return links("hy3d", files);
}

function hymdStyles() {
  return links("hymd", ["src/styles.css"]);
}

const SHELL_SCRIPT = `<script>
(function () {
  function attrOf(node, name) {
    var el = node && node.closest ? node.closest("[" + name + "]") : null;
    return el ? el.getAttribute(name) || "" : "";
  }
  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var tab = target.closest("[data-tab]");
    if (tab) {
      var id = tab.getAttribute("data-tab");
      document.querySelectorAll("[data-tab]").forEach(function (el) {
        var on = el === tab;
        el.classList.toggle("on", on);
        el.classList.toggle("active", on);
      });
      document.querySelectorAll("[data-page]").forEach(function (el) { el.hidden = el.getAttribute("data-page") !== id; });
    }
    var dock = target.closest("[data-dock]");
    if (dock) {
      document.querySelectorAll("[data-dock]").forEach(function (el) {
        var on = el === dock;
        el.classList.toggle("on", on);
        el.classList.toggle("active", on);
      });
      var body = document.querySelector("#left-dock .dock-body");
      if (body) body.textContent = dock.getAttribute("data-label") || "";
    }
    var menuBtn = target.closest(".menu-wrap > button");
    if (menuBtn && menuBtn.parentElement) {
      var box = menuBtn.parentElement;
      var open = box.classList.contains("open");
      document.querySelectorAll(".menu-wrap.open").forEach(function (el) { el.classList.remove("open"); });
      if (!open) box.classList.add("open");
      event.stopPropagation();
    } else if (!target.closest(".menu-dropdown")) {
      document.querySelectorAll(".menu-wrap.open").forEach(function (el) { el.classList.remove("open"); });
    }
    var part = attrOf(target, "data-part");
    if (!part) return;
    parent.postMessage({ source: "uitool-shell", part: part, zone: attrOf(target, "data-zone"), item: attrOf(target, "data-item") }, "*");
  });
  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.source !== "uitool-shell-mark") return;
    document.querySelectorAll(".ut-hit").forEach(function (el) { el.classList.remove("ut-hit"); });
    if (!data.part) return;
    var sel = "[data-part='" + CSS.escape(data.part) + "']";
    if (data.item) sel += "[data-item='" + CSS.escape(data.item) + "']";
    else if (data.zone) sel += "[data-zone='" + CSS.escape(data.zone) + "']";
    var hit = document.querySelector(sel);
    if (hit) hit.classList.add("ut-hit");
  });
  var links = document.querySelectorAll('link[rel="stylesheet"]');
  function ready() {
    if (!links.length) return false;
    for (var i = 0; i < links.length; i++) {
      var sheet = links[i].sheet;
      if (!sheet) return false;
      try { if (!sheet.cssRules || !sheet.cssRules.length) return false; }
      catch (error) { /* 跨域样式表读不到规则，能挂上就算连上了 */ }
    }
    return true;
  }
  function refresh(finalCheck) {
    var note = document.getElementById("shell-note");
    if (!note) return;
    if (ready()) note.hidden = true;
    else if (finalCheck) note.hidden = false;
  }
  links.forEach(function (link) {
    link.addEventListener("load", function () { refresh(false); });
    link.addEventListener("error", function () { refresh(true); });
  });
  window.addEventListener("load", function () { refresh(true); });
  refresh(false);
  setTimeout(function () { refresh(true); }, 80);
})();
</script>`;

const FALLBACK = `@layer shell {
#shell-note { margin: 0; padding: 4px 8px; background: #3a3018; color: #f3e2a4; }
#shell-note[hidden] { display: none; }
html, body { margin: 0; height: 100%; background: #1b1b1b; color: #e8e8e8; font: 12px "Segoe UI", "Microsoft YaHei", sans-serif; }
body { display: flex; flex-direction: column; overflow: hidden; }
button { font: inherit; color: inherit; background: transparent; border: 0; }
#app, .shell { flex: 1; min-height: 0; height: auto; }
#app { display: grid; grid-template-rows: 30px 24px minmax(96px, 112px) 26px minmax(0, 1fr) 26px 24px; }
#titlebar-row, #menubar, #filetabs, #cmdbar, #statusbar, .titlebar, .statusbar { display: flex; align-items: center; gap: 4px; padding: 0 6px; }
#titlebar-row, .titlebar { background: #2b2b2b; }
#menubar, #filetabs { background: #252525; }
#ribbon { display: flex; flex-direction: column; min-height: 0; background: #2a2a2a; }
#ribbon-tabs, .activitybar { display: flex; gap: 2px; }
#ribbon-tabs button, #filetabs button, .activitybar button, .statusbar button, #qat button { padding: 2px 8px; }
#ribbon-tabs button.on, #filetabs button.on, [data-dock].on, .activitybar button.on { background: #3c3c3c; }
#ribbon-panels { display: block; overflow: auto; }
.ribbon-page { display: flex; gap: 8px; padding: 4px 8px; }
.ribbon-page[hidden] { display: none; }
.panel { display: flex; flex-direction: column; min-width: 48px; }
.panel-body { display: flex; gap: 2px; flex: 1; }
.stack { display: flex; flex-direction: column; }
.cmd { display: flex; align-items: center; gap: 4px; flex: 0 0 auto; white-space: nowrap; }
.cmd.big { flex-direction: column; width: auto; min-width: 44px; padding: 2px 6px; }
.cmd .ico { width: 16px; height: 16px; }
#workspace, .workbench { display: grid; grid-template-columns: 36px 220px minmax(0, 1fr); min-height: 0; }
#workspace.with-aux, .workbench.with-aux { grid-template-columns: 36px 220px minmax(0, 1fr) 220px; }
#palette-tabs { display: flex; flex-direction: column; background: #202020; }
#palette-tabs button { width: 36px; padding: 6px 0; line-height: 1.15; text-align: center; }
.activitybar { flex-direction: column; }
.activitybar button { width: 48px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#left-dock, .sidebar, .auxiliarybar { background: #252525; overflow: auto; padding: 8px; }
#viewport, .editor { background: #111; min-width: 0; }
#cmdbar, #statusbar, .statusbar { background: #007acc; color: #fff; }
.menu { position: relative; }
.menu-pop { display: none; position: absolute; z-index: 5; top: 100%; left: 0; min-width: 160px; background: #2d2d2d; border: 1px solid #444; padding: 4px; }
.menu.open > .menu-pop { display: flex; flex-direction: column; align-items: stretch; }
.menu-pop .sep { height: 1px; margin: 4px 0; background: #555; }
.ut-hit { outline: 2px solid #c9a227; outline-offset: -2px; }
html[data-only] #app > * { display: none; }
html[data-only="titlebar"] #titlebar-row, html[data-only="titlebar"] #menubar, html[data-only="toolbar"] #ribbon,
html[data-only="editor"] #filetabs, html[data-only="panel"] #cmdbar, html[data-only="statusbar"] #statusbar,
html[data-only="menu"] #menubar { display: flex; }
html[data-only="activitybar"] #workspace, html[data-only="sidebar"] #workspace, html[data-only="editor"] #workspace { display: grid; }
html[data-only] #app { display: block; height: auto; }
html[data-only="activitybar"] #left-dock, html[data-only="activitybar"] #viewport,
html[data-only="sidebar"] #palette-tabs, html[data-only="sidebar"] #viewport,
html[data-only="editor"] #palette-tabs, html[data-only="editor"] #left-dock { display: none; }
.shell { display: flex; flex-direction: column; }
.workbench { flex: 1; min-height: 0; }
.workbench.no-activity { grid-template-columns: 220px minmax(0, 1fr); }
.workbench.no-activity.with-aux { grid-template-columns: 220px minmax(0, 1fr) 220px; }
.panel-tabs { display: flex; gap: 4px; background: #252525; }
.titlebar-menus { display: flex; align-items: stretch; height: 100%; }
.editor-tabs { display: flex; align-items: stretch; min-width: 0; }
.titlebar-drag { flex: 1; display: flex; justify-content: center; }
.app-shell { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.app-body, .app-main-row { display: flex; flex: 1; min-height: 0; min-width: 0; }
.app-center, .editor-part { display: flex; flex-direction: column; flex: 1; min-width: 0; min-height: 0; }
.editor-content-hymd { flex: 1; min-height: 0; overflow: auto; padding: 28px 40px; }
html[data-only] .shell > *, html[data-only] .app-shell > * { display: none; }
html[data-only="titlebar"] .titlebar, html[data-only="menu"] .titlebar, html[data-only="statusbar"] .statusbar { display: flex; }
html[data-only="activitybar"] .workbench, html[data-only="sidebar"] .workbench, html[data-only="auxiliarybar"] .workbench, html[data-only="editor"] .workbench { display: grid; }
html[data-only="activitybar"] .app-body, html[data-only="sidebar"] .app-body, html[data-only="auxiliarybar"] .app-body, html[data-only="editor"] .app-body { display: flex; }
html[data-only="panel"] .panel-tabs { display: flex; }
}
`;

const PREVIEW_CHROME = `.menu-wrap{position:relative;height:100%;display:flex;align-items:stretch}.menu-wrap>.menu-dropdown{display:none}.menu-wrap.open>.menu-dropdown{display:flex;flex-direction:column;min-width:180px;z-index:20}`;

function doc(opts: { skin: string; palette: string; theme: string; only: string; styles: string; body: string; attrs?: string }) {
  return `<!doctype html><html data-skin="${esc(opts.skin)}" data-palette="${esc(opts.palette)}" data-theme="${esc(opts.theme)}"${attr("data-only", opts.only)}${opts.attrs ?? ""}><head><meta charset="utf-8">${opts.styles}<style id="shell-fallback">${FALLBACK}</style><style id="shell-preview">${PREVIEW_CHROME}</style></head><body><p id="shell-note" hidden>壳层样式还没连上产品目录。在连接里填写主仓后，预览会用产品自己的 CSS。</p>${opts.body}${SHELL_SCRIPT}</body></html>`;
}

function safeId(value: string) {
  return /^[A-Za-z0-9._-]+$/.test(value) ? value : "acad-b";
}

function onlyAttr(options: ShellOptions) {
  if (options.onlyMenu) return "menu";
  return options.onlyPart ?? "";
}

function itemText(cfg: UiConfig, item: ToolItem) {
  return item.text || (item.command ? commandOf(cfg, item.command)?.title : "") || item.id;
}

function hy3dRibbon(cfg: UiConfig) {
  const rows = cfg.layout.toolbars.top.rows.filter((row) => !row.hidden);
  const grouped = rows.some((row) => row.groups?.length);
  if (!grouped) {
    const buttons = rows
      .flatMap((row) => row.start.filter((item) => !item.separator).map((item) => toolButton("toolbar", `tbg:top:${row.id}`, item.command || item.id, itemText(cfg, item), commandOf(cfg, item.command || "")?.icon || "", false, false)))
      .join("");
    return `<div id="ribbon" data-part="toolbar"><div id="ribbon-panels">${buttons}</div></div>`;
  }
  const tabs = rows
    .map((row, index) => `<button type="button" data-tab="${esc(row.id)}" class="ribbon-tab${index === 0 ? " active" : ""}" data-part="toolbar" data-zone="tbg:top:${esc(row.id)}">${esc(row.title || row.id)}</button>`)
    .join("");
  const pages = rows
    .map((row, index) => {
      const zone = `tbg:top:${row.id}`;
      const groups = (row.groups ?? [])
        .map((group) => {
          const slots = group.slots?.length ? group.slots : group.commands.filter(Boolean).map((command, i) => ({ command, size: i === 0 ? "big" as const : "small" as const }));
          const columns = packSlots(slots)
            .map((column) =>
              column.slots
                .map((slot) => {
                  const face = faceOf(cfg, slot);
                  return toolButton("toolbar", zone, slot.command, face.text, face.icon, column.big, !!slot.menu?.length);
                })
                .join("")
            )
            .join("");
          const launcher = group.launcher
            ? `<button type="button" class="ribbon-panel-launcher" data-part="toolbar" data-zone="${esc(zone)}" data-item="${esc(group.launcher)}" title="启动"></button>`
            : "";
          return `<section class="ribbon-panel" data-part="toolbar" data-zone="${esc(zone)}"><div class="ribbon-panel-btns">${columns}</div><div class="ribbon-panel-name" data-part="toolbar" data-zone="${esc(zone)}"><span class="ribbon-panel-label">${esc(group.title)}</span>${launcher}</div></section>`;
        })
        .join("");
      return `<div class="ribbon-panels" data-page="${esc(row.id)}"${index === 0 ? "" : " hidden"}>${groups}</div>`;
    })
    .join("");
  return `<div id="ribbon" data-part="toolbar"><div id="ribbon-tabs" class="ribbon-tabs">${tabs}</div><div id="ribbon-panels">${pages}</div></div>`;
}

function hy3dStatus(cfg: UiConfig) {
  const bar = cfg.statusBar;
  const zone = (name: string, items: ToolItem[]) =>
    items
      .filter((item) => !item.separator)
      .map((item) => `<button type="button" class="sb-item" data-part="statusbar" data-zone="${name}" data-item="${esc(item.id)}">${esc(itemText(cfg, item))}</button>`)
      .join("");
  const hasPaper = [...bar.start, ...bar.center, ...bar.end].some((item) => item.text === "纸面" || item.id === "paper");
  const paper = hasPaper ? "" : `<button type="button" class="sb-item" data-part="statusbar" data-zone="status:center">纸面</button>`;
  return `<footer id="statusbar" data-part="statusbar"><button type="button" class="sb-settings" data-part="statusbar">设置</button>${zone("status:start", bar.start)}${zone("status:center", bar.center)}${paper}${zone("status:end", bar.end)}</footer>`;
}

function hy3dDocument(cfg: UiConfig, options: ShellOptions) {
  const scheme = activeScheme(cfg);
  const skin = scheme?.skin || "ribbon-top";
  const palette = safeId(scheme?.palette || "acad-b");
  const theme = "dark";
  const quick = cfg.layout.titleBar.left
    .filter((item) => !item.separator)
    .map((item) => `<button type="button" data-part="titlebar" data-zone="title-left" data-item="${esc(item.id)}" title="${esc(itemText(cfg, item))}">${hy3dIcon(commandOf(cfg, item.command || "")?.icon || "")}<span>${esc(itemText(cfg, item))}</span></button>`)
    .join("");
  const drawing = cfg.editors[0]?.title || cfg.app.title;
  const files = cfg.editors
    .map((editor, index) => `<button type="button" class="filetab${index === 0 ? " active" : ""}" data-part="editor" data-zone="tabs" data-item="${esc(editor.id)}">${esc(editor.title)}</button>`)
    .join("");
  const dockItems = cfg.activity.length ? cfg.activity.map((box) => [box.id, box.title] as [string, string]) : HY3D_DOCKS;
  const docks = dockItems.map(([id, label], index) => {
    const container = cfg.activity.find((box) => box.id === id);
    const zone = container ? ` data-zone="side:${esc(id)}:header" data-item="${esc(id)}"` : "";
    return `<button type="button" data-dock="${esc(id)}" data-label="${esc(label)}" class="pal-tab${index === 0 ? " active" : ""}" data-part="sidebar"${zone}>${esc(label)}</button>`;
  }).join("");
  const dockRows = dockItems.map(([id, label], index) => `<div class="view-row${index === 0 ? " selected" : ""}" data-part="sidebar" data-item="${esc(id)}">${esc(label)}</div>`).join("");
  const rightTitle = cfg.auxiliary[0]?.title || "属性";
  const body = `<div id="app" style="--left-dock-w:220px;--right-dock-w:200px;--pal-w:36px;--split-w:4px">
    <header id="titlebar-row" class="chrome-row" data-part="titlebar">
      <div class="titlebar-left">
        <button type="button" class="app-button" data-part="titlebar" data-zone="appicon" data-item="appicon" title="${esc(cfg.app.title)}">${hy3dIcon("app") || esc(cfg.app.title)}</button>
        <div id="qat" class="qat">${quick}</div>
      </div>
      <div class="titlebar-center"><div id="title-doc" class="title-doc">${esc(drawing)}</div></div>
      <div class="titlebar-right">
        <div class="titlebar-drag"></div>
        <div class="cmd-search-wrap"><input id="cmd-search" data-part="titlebar" data-zone="title-center" placeholder="搜索命令…" aria-label="搜索命令"></div>
        <div class="winctl">
          <button type="button" id="win-min" data-part="titlebar" data-zone="winctl" data-item="min" title="最小化">—</button>
          <button type="button" id="win-max" data-part="titlebar" data-zone="winctl" data-item="max" title="最大化">□</button>
          <button type="button" id="win-close" class="close" data-part="titlebar" data-zone="winctl" data-item="close" title="关闭">×</button>
        </div>
      </div>
    </header>
    <nav id="menubar" class="chrome-row">${menuRow(cfg, cfg.menus, "menu-top")}</nav>
    ${hy3dRibbon(cfg)}
    <div id="filetabs" class="chrome-row">${files}</div>
    <div id="workspace">
      <aside id="palette-tabs" data-part="activitybar">${docks}</aside>
      <aside id="left-dock" data-part="sidebar"><div class="dock-title">${esc(dockItems[0]?.[1] || "文件")}</div><div class="dock-body">${dockRows}</div></aside>
      <button type="button" id="split-left" class="splitter" aria-label="调整左停靠"></button>
      <div id="viewport-frame"><div id="viewport" data-part="editor">${esc(drawing)}</div></div>
      <button type="button" id="split-right" class="splitter" aria-label="调整右停靠"></button>
      <aside id="right-dock" data-part="auxiliarybar"><div class="dock-title">${esc(rightTitle)}</div><div class="dock-body">${esc(rightTitle)}</div></aside>
    </div>
    <div id="cmdbar" class="chrome-row" data-part="panel"><span>命令:</span></div>
    ${hy3dStatus(cfg)}
  </div>`;
  return doc({
    skin,
    palette,
    theme,
    only: onlyAttr(options),
    styles: tokenStyle(cfg.tokens) + hy3dStyles(skin, palette),
    body
  });
}

function hymdSide(cfg: UiConfig, part: "sidebar" | "auxiliarybar") {
  const boxes = part === "sidebar" ? cfg.activity : cfg.auxiliary;
  const active = boxes[0];
  if (!active) return "";
  const tabs = `<div class="sidebar-tabs" data-part="${part}" data-zone="${part}-tabs"><div class="sidebar-tabs-icons">${boxes
    .map((box, index) => `<button type="button" class="sidebar-tab${index === 0 ? " active" : ""}" title="${esc(box.title)}" data-part="${part === "sidebar" ? "activitybar" : "auxiliarybar"}" data-zone="activity-items" data-item="${esc(box.id)}">${esc(box.title)}</button>`)
    .join("")}</div></div>`;
  const rows = active.sections.length
    ? active.sections
        .map((section, index) => `<div class="panel-title" data-part="${part}" data-zone="sec:${esc(section.id)}" data-item="${esc(section.id)}">${esc(section.title)}</div><button type="button" class="view-row${index === 0 ? " selected" : ""}" data-part="${part}" data-zone="sec:${esc(section.id)}" data-item="${esc(section.id)}"><span class="dot"></span>${esc(section.title)}</button>`)
        .join("")
    : `<button type="button" class="view-row selected" data-part="${part}" data-zone="side:${esc(active.id)}:header" data-item="${esc(active.id)}"><span class="dot"></span>${esc(active.title)}</button>`;
  const width = part === "sidebar" ? cfg.layout.primarySideBar.width : cfg.layout.auxiliaryBar.width;
  return `<aside class="${part === "sidebar" ? "sidebar" : "auxiliarybar"}" data-part="${part}" style="width:${width}px">${tabs}<div class="view-body">${rows}</div></aside>`;
}

function hymdStatus(cfg: UiConfig) {
  const button = (name: string, items: ToolItem[]) =>
    items
      .filter((item) => !item.separator)
      .map((item) => `<button type="button" class="statusbar-item" data-part="statusbar" data-zone="${name}" data-item="${esc(item.id)}">${esc(itemText(cfg, item))}</button>`)
      .join("");
  const bar = cfg.statusBar;
  return `<footer class="statusbar" data-part="statusbar"><div class="statusbar-left">${button("status:start", bar.start)}</div><div class="statusbar-right">${button("status:center", bar.center)}${button("status:end", bar.end)}</div></footer>`;
}

function hymdDocument(cfg: UiConfig, options: ShellOptions) {
  const scheme = activeScheme(cfg);
  const skin = scheme?.skin || "vscode";
  const theme = skin === "notion" ? "light" : "dark";
  const L = cfg.layout;
  const center = L.titleBar.commandCenter && skin === "vscode"
    ? `<button type="button" class="titlebar-cmdcenter" data-part="titlebar" data-zone="title-center" data-item="command-center"><span class="titlebar-cmdcenter-label">${esc(cfg.app.title)}</span><span class="titlebar-cmdcenter-key">Ctrl+Shift+P</span></button>`
    : `<div class="titlebar-title" data-part="titlebar" data-zone="title-center" data-item="title-text">${esc(cfg.app.title)}</div>`;
  const sidebar = L.primarySideBar.visible ? hymdSide(cfg, "sidebar") : "";
  const auxiliary = L.auxiliaryBar.visible ? hymdSide(cfg, "auxiliarybar") : "";
  const tabs = L.editor.tabs
    ? `<div class="editor-tabs" data-part="editor" data-zone="tabs"><div class="editor-tabs-scroll">${cfg.editors
        .map((editor, index) => `<button type="button" class="editor-tab${index === 0 ? " active" : ""}" data-part="editor" data-zone="tabs" data-item="${esc(editor.id)}"><span class="tab-label">${esc(editor.title)}</span></button>`)
        .join("")}</div></div>`
    : "";
  const sample = cfg.editors[0]?.title || cfg.app.title;
  const panel = L.panel.visible
    ? `<div class="panel-tabs" data-part="panel" data-zone="panel-tabs">${cfg.panel
        .map((tab, index) => `<button type="button" class="panel-tab${index === 0 ? " active" : ""}" data-part="panel" data-zone="panel-tabs" data-item="${esc(tab.id)}">${esc(tab.title)}</button>`)
        .join("")}</div>`
    : "";
  const status = L.statusBar.visible ? hymdStatus(cfg) : "";
  const attrs = `${skin === "vscode" ? ` data-vscode-activity="${L.activityBar.position === "side" ? "side" : "top"}"` : ""}${L.editor.tabs ? "" : ` data-tabstrip="none"`}`;
  const body = `<div class="app-shell">
    <header class="titlebar" data-part="titlebar">
      <div class="titlebar-menus">${menuRow(cfg, cfg.menus, "titlebar-menu-btn")}</div>
      <div class="titlebar-drag">${center}</div>
      <div class="titlebar-actions">
        <button type="button" class="titlebar-icon-btn${L.primarySideBar.visible ? " active" : ""}" data-part="sidebar" title="侧栏">侧</button>
        <button type="button" class="titlebar-icon-btn${L.panel.visible ? " active" : ""}" data-part="panel" title="面板">面</button>
        <button type="button" class="titlebar-icon-btn${L.auxiliaryBar.visible ? " active" : ""}" data-part="auxiliarybar" title="辅栏">辅</button>
        <button type="button" class="titlebar-win-btn" data-part="titlebar" data-zone="winctl" data-item="min" title="最小化">—</button>
        <button type="button" class="titlebar-win-btn" data-part="titlebar" data-zone="winctl" data-item="max" title="最大化">□</button>
        <button type="button" class="titlebar-win-btn close" data-part="titlebar" data-zone="winctl" data-item="close" title="关闭">×</button>
      </div>
    </header>
    <div class="app-body">
      ${sidebar}
      <div class="app-center">
        <div class="app-main-row">
          <div class="editor-part" data-part="editor">${tabs}<div class="editor-content-hymd" data-part="editor" data-zone="editor-body"><div class="hymd-keep-slot" style="padding:28px 40px;overflow:auto"><p>${esc(sample)}</p><p>这是预览里的示例正文。</p></div></div></div>
          ${auxiliary}
        </div>
        ${panel}
      </div>
    </div>
    ${status}
  </div>`;
  return doc({
    skin,
    palette: "",
    theme,
    only: onlyAttr(options),
    attrs,
    styles: tokenStyle(cfg.tokens) + hymdStyles(),
    body
  });
}

/** 预览 iframe 的文档。样式表指向只读路由，命令来自已导入的规格。 */
export function shellDocument(cfg: UiConfig, options: ShellOptions = {}) {
  if (cfg.workType === "writing") return hymdDocument(cfg, options);
  return hy3dDocument(cfg, options);
}
