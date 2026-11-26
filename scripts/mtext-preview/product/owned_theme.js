/* 独立窗套色。读 hy3d.ui.palette，写成 data-palette / data-theme / data-skin / data-density。
 * 主页面换档时，本窗靠 storage 事件和 BroadcastChannel「hy3d-scheme」跟上。
 * 同一份 WebView 数据目录按理会收到 storage；本机跨窗是否真收到，待验证。 */
(function (global) {
  "use strict";

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || {}; }
    catch (_e) { return {}; }
  }

  function apply() {
    var raw = readJson("hy3d.ui.palette");
    var pal = raw.palette || "blender-dark";
    var theme = raw.theme === "light" ? "light" : "dark";
    if (pal !== "acad-b" && pal !== "blender-dark") pal = "blender-dark";
    if (pal === "blender-dark") theme = "dark";
    var root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-palette", pal);
    root.setAttribute("data-skin", "ribbon-top");
    var lay = readJson("hy3d.ui.layout");
    if (lay.density === "compact" || lay.density === "comfortable") {
      root.setAttribute("data-density", lay.density);
    }
    var link = document.getElementById("palette-css");
    var href = "palettes/" + pal + "/palette.css";
    if (link && link.getAttribute("href") !== href) link.setAttribute("href", href);
  }

  apply();
  global.addEventListener("storage", function (e) {
    if (!e || e.key == null || e.key === "hy3d.ui.palette" || e.key === "hy3d.ui.layout") apply();
  });
  try {
    var bus = new BroadcastChannel("hy3d-scheme");
    bus.onmessage = function () { apply(); };
  } catch (_e) {}

  global.hy3dOwnedTheme = { apply: apply };
})(typeof window !== "undefined" ? window : this);
