/* UITool design only. Preserve original DOM nodes, event delegation and native commands. */
(function () {
  "use strict";
  var root = document.documentElement;
  var q = new URLSearchParams(location.search);
  if (location.hostname !== "127.0.0.1" || location.port !== "1450" ||
      q.get("uitool") !== "1" || q.get("style") !== "layer") return;
  var left = document.getElementById("explorer-tabs");
  var right = document.getElementById("dock-workspace-bar");
  var rightTabs = right && right.querySelector(".dock-workspace-tabs");
  var rightActions = right && right.querySelector(".dock-workspace-actions");
  var leftMain = ["files", "project", "history", "search"];
  var rightMain = ["properties", "layers", "history", "blocks"];
  function lookup(node, attr, id) { return node && node.querySelector("[" + attr + '="' + id + '"]'); }
  if (!left || !rightTabs || !rightActions ||
      !leftMain.every(function (id) { return lookup(left, "data-tab", id); }) ||
      !rightMain.every(function (id) { return lookup(rightTabs, "data-dock-tab", id); }) ||
      !document.getElementById("hy-dock-left") || !document.getElementById("hy-dock-right")) {
    console.error("UITool 侧栏设计：原生入口不匹配，未启用候选。");
    var notice = document.createElement("div");
    notice.textContent = "UITool 侧栏设计未启用：原生面板入口不匹配，请同步 HY3D 前端。";
    notice.style.cssText = "position:fixed;bottom:36px;left:8px;z-index:20000;padding:6px 10px;background:var(--bg-raised);color:var(--text);border:1px solid var(--border)";
    document.body.appendChild(notice);
    return;
  }
  var active = null;
  var menu = document.createElement("div");
  menu.id = "uitool-dock-menu";
  menu.className = "uitool-dock-menu";
  menu.setAttribute("role", "menu");
  menu.hidden = true;
  document.body.appendChild(menu);
  function close(restore) {
    var previous = active;
    active = null;
    menu.hidden = true;
    if (previous) {
      previous.setAttribute("aria-expanded", "false");
      if (restore) previous.focus();
    }
  }
  function entry(label, fn, pressed) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", pressed == null ? "menuitem" : "menuitemcheckbox");
    if (pressed != null) b.setAttribute("aria-checked", String(pressed));
    b.textContent = label;
    b.addEventListener("click", function () { close(true); fn(); });
    menu.appendChild(b);
  }
  function separator() {
    var hr = document.createElement("hr");
    hr.setAttribute("role", "separator");
    menu.appendChild(hr);
  }
  function nativeEntry(node, label, checkable) {
    if (!node) return;
    entry(label, function () { if (node.isConnected) node.click(); },
      checkable ? node.getAttribute("aria-pressed") === "true" : null);
  }
  function command(label, id) {
    if (!window.Registry || !Registry.get(id)) return;
    entry(label, function () { Registry.run(id); });
  }
  function show(trigger, side) {
    if (active === trigger) { close(true); return; }
    close(false);
    menu.replaceChildren();
    if (side === "left") {
      // Layer/properties are available in the right dock, not duplicated here.
      [["outline", "大纲"], ["en", "英文"], ["refs", "文献"], ["git", "Git"]].forEach(function (item) {
        nativeEntry(lookup(left, "data-tab", item[0]), item[1]);
      });
    } else {
      // Keep the original workbench close handler (not merely hide the dock).
      // Resolve on every menu open because the workbench is mounted dynamically.
      var blockClose = document.querySelector("#right-dock-body #bw-root > .bw-title .bw-x");
      if (blockClose) {
        nativeEntry(blockClose, "关闭图块");
        separator();
      }
      nativeEntry(lookup(rightActions, "data-dock-act", "pin"), "钉住", true);
      nativeEntry(lookup(rightActions, "data-dock-act", "autohide"), "自动隐藏");
      nativeEntry(lookup(rightActions, "data-dock-act", "float"), "浮动");
      if (menu.children.length) separator();
      command("选项…", "app.options");
      command("单位…", "cad.units");
      command("图层管理器…", "cad.layer");
      // The former 'close' button is redundant: the top-level toggle remains.
    }
    if (!menu.querySelector("button")) return;
    active = trigger;
    trigger.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    var anchor = trigger.getBoundingClientRect();
    menu.style.left = Math.max(6, Math.min(anchor.right - menu.offsetWidth, innerWidth - menu.offsetWidth - 6)) + "px";
    menu.style.top = Math.max(6, anchor.bottom + menu.offsetHeight + 4 <= innerHeight ? anchor.bottom + 3 : anchor.top - menu.offsetHeight - 3) + "px";
    menu.querySelector("button").focus();
  }
  function mount(node, side, title) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "uitool-dock-more";
    b.title = title;
    b.setAttribute("aria-label", title);
    b.setAttribute("aria-haspopup", "menu");
    b.setAttribute("aria-expanded", "false");
    b.setAttribute("aria-controls", menu.id);
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>';
    b.addEventListener("click", function () { show(b, side); });
    b.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown" && active !== b) { event.preventDefault(); show(b, side); }
    });
    node.appendChild(b);
  }
  mount(left, "left", "更多资源");
  mount(right, "right", "更多属性工具");
  document.addEventListener("pointerdown", function (event) {
    if (active && !menu.contains(event.target) && !active.contains(event.target)) close(false);
  });
  document.addEventListener("keydown", function (event) {
    if (!active) return;
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (!menu.contains(event.target)) return;
    if (event.key === "Tab") { close(false); return; }
    var items = Array.from(menu.querySelectorAll("button"));
    var index = items.indexOf(document.activeElement);
    var next = event.key === "ArrowDown" ? (index + 1) % items.length :
      event.key === "ArrowUp" ? (index + items.length - 1) % items.length :
      event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : -1;
    if (next >= 0) { event.preventDefault(); items[next].focus(); }
  }, true);
  window.addEventListener("resize", function () { close(false); });
  document.addEventListener("hy-skin-applied", function () { close(false); });
  root.dataset.uitoolDockDesign = "1";
  // Use measured viewport bounds instead of duplicating native width variables:
  // dragging, icon docks and responsive breakpoints can temporarily override them.
  var app = document.getElementById("app");
  var workspace = document.getElementById("workspace");
  var viewport = document.getElementById("viewport-frame");
  var cmdbar = document.getElementById("cmdbar");
  if (app && workspace && viewport && cmdbar &&
      workspace.parentElement === app && cmdbar.parentElement === app &&
      window.CSS && CSS.supports("grid-template-rows", "subgrid") &&
      window.ResizeObserver) {
    root.dataset.uitoolDockSpan = "1";
    function syncCommandBounds() {
      var a = app.getBoundingClientRect();
      var v = viewport.getBoundingClientRect();
      if (v.width <= 0) return;
      var inset = Math.max(0, v.left - a.left) + "px";
      var width = v.width + "px";
      if (app.style.getPropertyValue("--uitool-cmd-inset") !== inset)
        app.style.setProperty("--uitool-cmd-inset", inset);
      if (app.style.getPropertyValue("--uitool-cmd-width") !== width)
        app.style.setProperty("--uitool-cmd-width", width);
    }
    syncCommandBounds();
    var pending = false;
    function scheduleBounds() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; syncCommandBounds(); });
    }
    var resize = new ResizeObserver(scheduleBounds);
    [app, workspace, viewport, document.getElementById("left-dock"),
      document.getElementById("right-dock"), document.getElementById("palette-tabs"),
      document.getElementById("split-left"), document.getElementById("split-right")]
      .filter(Boolean).forEach(function (node) { resize.observe(node); });
    // Mode switches may move tracks without changing total width.
    new MutationObserver(scheduleBounds).observe(app, {attributes:true, attributeFilter:["class"]});
    document.addEventListener("hy-skin-applied", scheduleBounds);
    window.addEventListener("resize", scheduleBounds);
  } else {
    console.error("UITool 侧栏拉通：布局接口或 row subgrid 不支持，保留原布局。");
  }
})();
