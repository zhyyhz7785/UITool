/**
 * 本机开发态连接。HY3D 与 HyMdTauri 用同一份协议。
 * 只在 localhost 上注册。不执行任意脚本，不读任意文件，不调用未列出的产品命令。
 * 产品页在开发服务器里加入：<script src="uitool-live.js"></script>
 * 日常改界面不编译 Rust。
 */
(function (global) {
  "use strict";
  var host = "";
  try {
    host = String(global.location && global.location.hostname || "");
  } catch (_e) {
    host = "";
  }
  if (host !== "127.0.0.1" && host !== "localhost") return;

  var product = global.__HY3D_DEV_SERVER ? "hy3d" : "hymd";
  // 设计器在 1440。不探测 hy3d 的 1430 和 HyMd 的 1420，避免连到产品自己的开发服务。
  var ports = [1440];
  var broker = "";
  var inst = null;
  var selected = null;
  var snapshot = null;
  var DOC = ".cm-content, .cm-editor, .cm-scroller, textarea, [data-hymd-doc], .markdown-body, article, .ProseMirror, [contenteditable='true'], .pdf-page, .pdf-canvas, .typeset, .editor-content";

  function root() {
    return global.document && global.document.documentElement;
  }

  function tokenNames() {
    return ["--titlebar-h", "--ribbon-h", "--hy-icon", "--hy-cmd-fs", "--hy-cmd-gap", "--hy-cmd-lh", "--left-dock-w", "--right-dock-w", "--fs-ui", "--gap", "--h-title", "--h-ctl", "--chrome-pad", "--dock-pad", "--r-ctl", "--border", "--bg-window", "--bg-panel", "--text", "--accent", "--bg-hover", "--ribbon-small-icon", "--ribbon-large-icon", "--obs-tab-h", "--obs-row-h", "--obs-gap", "--obs-pad", "--bg", "--text-muted", "--list-hover", "--list-active"];
  }

  function readTokens() {
    var style = global.getComputedStyle(root());
    var out = {};
    tokenNames().forEach(function (name) {
      var value = style.getPropertyValue(name);
      if (value && value.trim()) out[name] = value.trim();
    });
    return out;
  }

  function readRibbon() {
    try {
      var raw = global.localStorage && global.localStorage.getItem("hy3d.ui.hyRibbon");
      return raw ? JSON.parse(raw) : null;
    } catch (_e) {
      return null;
    }
  }

  function takeSnapshot() {
    snapshot = { tokens: readTokens(), ribbon: readRibbon(), className: root().className };
  }

  function isDocument(node) {
    if (!node || !node.closest) return false;
    if (node.closest(DOC)) return true;
    if (product === "hy3d" && node.closest("canvas, .hy3d-canvas, #viewport")) return true;
    return false;
  }

  function describe(node) {
    if (!node || node === root() || isDocument(node)) {
      return { tag: "window", id: "", className: "", width: 0, height: 0, tokens: readTokens(), label: "窗口" };
    }
    var rect = node.getBoundingClientRect();
    var chrome = node.closest(".titlebar, .menubar, .toolbar, .activitybar, .sidebar, .statusbar, .panel, .auxiliary-bar, .editor-pane-head, .dialog, .modal, [data-part]");
    var label = node.id || node.getAttribute("data-part") || "";
    if (!label && chrome && chrome.classList) {
      if (chrome.classList.contains("titlebar")) label = "标题栏";
      else if (chrome.classList.contains("menubar")) label = "菜单";
      else if (chrome.classList.contains("toolbar")) label = "工具栏";
      else if (chrome.classList.contains("sidebar")) label = "资源管理器";
      else if (chrome.classList.contains("editor-pane-head")) label = "编辑器外围";
      else if (chrome.classList.contains("dialog") || chrome.classList.contains("modal")) label = "对话框";
      else if (chrome.classList.contains("statusbar")) label = "状态栏";
      else if (chrome.classList.contains("panel")) label = "面板";
    }
    return {
      tag: node.tagName || "",
      id: node.id || "",
      className: String(node.className || "").slice(0, 160),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      tokens: readTokens(),
      label: label || node.tagName || "元素"
    };
  }

  function applyTokens(tokens) {
    if (!tokens) return;
    Object.keys(tokens).forEach(function (key) {
      if (!/^--[a-z0-9-]+$/i.test(key)) return;
      var value = String(tokens[key] || "");
      if (!value || /[;{}]|url\s*\(/i.test(value)) return;
      root().style.setProperty(key, value);
    });
  }

  function applyRibbon(state) {
    if (!state || product !== "hy3d") return;
    try {
      global.localStorage.setItem("hy3d.ui.hyRibbon", JSON.stringify(state));
    } catch (_e) {
      /* 开发窗口拒绝存储时保持内存里的草稿 */
    }
    if (global.HyRibbon && typeof global.HyRibbon.apply === "function") global.HyRibbon.apply(state);
  }

  function syncDock() {
    try {
      global.dispatchEvent(new Event("resize"));
    } catch (_e) {
      /* 没有窗口事件时只改了变量 */
    }
    if (global.DockWorkspace && typeof global.DockWorkspace.layout === "function") global.DockWorkspace.layout();
  }

  function applyPatch(payload) {
    payload = payload || {};
    applyTokens(payload.tokens);
    applyRibbon(payload.hyRibbon);
    if (product === "hymd") syncDock();
    if (payload.sidebar && product === "hy3d") {
      if (payload.sidebar.leftWidth) root().style.setProperty("--left-dock-w", String(payload.sidebar.leftWidth) + "px");
      if (payload.sidebar.rightWidth) root().style.setProperty("--right-dock-w", String(payload.sidebar.rightWidth) + "px");
      syncDock();
    }
    return { ok: true, tokens: readTokens(), hyRibbon: readRibbon() };
  }

  function revert() {
    if (!snapshot) return { ok: true };
    Object.keys(snapshot.tokens).forEach(function (key) {
      root().style.setProperty(key, snapshot.tokens[key]);
    });
    if (snapshot.ribbon) applyRibbon(snapshot.ribbon);
    else {
      try {
        global.localStorage.removeItem("hy3d.ui.hyRibbon");
      } catch (_e) {
        /* 保持现状 */
      }
    }
    syncDock();
    return { ok: true, tokens: readTokens() };
  }

  async function talk(body) {
    var res = await fetch(broker, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || "连接失败");
    return data;
  }

  async function findBroker() {
    var i;
    for (i = 0; i < ports.length; i++) {
      var url = "http://127.0.0.1:" + ports[i] + "/__uitool/live";
      try {
        var res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ op: "register", product: product, label: global.document.title, skin: root().getAttribute("data-skin") || "" })
        });
        if (!res.ok) continue;
        var data = await res.json();
        broker = url;
        inst = data;
        return;
      } catch (_e) {
        /* 换一个端口 */
      }
    }
  }

  function handle(command) {
    if (command.name === "inspect") return describe(selected);
    if (command.name === "patch") return applyPatch(command.payload);
    if (command.name === "revert") return revert();
    if (command.name === "publish") return { tokens: readTokens(), hyRibbon: readRibbon() };
    return { error: "拒绝" };
  }

  function forget() {
    inst = null;
    broker = "";
    snapshot = null;
    selected = null;
  }

  async function poll() {
    if (!inst) return;
    var data;
    try {
      data = await talk({ op: "poll", id: inst.id });
    } catch (err) {
      var msg = err && err.message ? String(err.message) : "";
      if (msg.indexOf("实例不在了") >= 0) forget();
      return;
    }
    if (data.status === "dropped") {
      revert();
      forget();
      return;
    }
    if (data.status === "allowed" && data.token && !snapshot) takeSnapshot();
    var list = data.commands || [];
    var i;
    for (i = 0; i < list.length; i++) {
      var result = handle(list[i]);
      await talk({ op: "result", id: inst.id, token: data.token, commandId: list[i].commandId, result: result });
    }
  }

  global.document.addEventListener(
    "click",
    function (event) {
      if (!inst) return;
      var node = event.target;
      if (isDocument(node)) return;
      selected = node;
    },
    true
  );

  function tick() {
    var job = inst ? poll() : findBroker();
    Promise.resolve(job).catch(function () {
      /* 设计器没开时下一轮再登记 */
    }).then(function () {
      global.setTimeout(tick, 400);
    });
  }

  tick();
})(typeof window !== "undefined" ? window : globalThis);
