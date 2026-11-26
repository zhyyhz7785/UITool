// A5 is a preview-only adaptation of HY3D's native ribbon renderer.
 // Keep the native command callbacks, group menus, reorder handling and icon registry.
 // Fail closed on incompatible product code rather than silently showing the original layout.
function replaceOnce(source, old, next, name) {
  if (source.split(old).length !== 2) throw new Error("缺少 A5 适配点：" + name);
  return source.replace(old, () => next);
}

export function a5Html(html) {
  const script = /<script\b[^>]*\bsrc\s*=\s*["'](?:\.\/)?skins\/hy-ribbon\/layout\.js["'][^>]*>\s*<\/script\s*>/i;
  if (!script.test(html) || !/<\/head\s*>/i.test(html)) throw new Error("缺少 HY Ribbon 或 head 入口");
  return html
    .replace(script, '<script src="/__uitool-a5-layout.js"></script>')
    .replace(/<\/head\s*>/i, '<link rel="stylesheet" href="/__uitool-a5.css"><script>document.documentElement.dataset.uitoolA5="1";try{localStorage.setItem("hy3d.ui.skin","hy-ribbon")}catch(e){}</script></head>');
}

export function a5RibbonSource(source) {
  let s = source;
  const r = (old, next, name) => { s = replaceOnce(s, old, next, name); };
  // Preview preferences are separate from the native reference.
  r('var STORE = "hy3d.ui.hyRibbon";', 'var STORE = "uitool.a5.hyRibbon";', "独立常显设置");
  // A5 measures one primary button, the remaining columns of 2/3 rows, then the layer picker.
  const start = "    function widthOf(g, count) {";
  const end = "    function total(list) {";
  const i = s.indexOf(start), j = s.indexOf(end);
  if (i < 0 || j <= i || s.indexOf(start, i + 1) >= 0 || s.indexOf(end, j + 1) >= 0) throw new Error("缺少原生宽度分配器");
  s = s.slice(0, i) + [
    "    function widthOf(g, count) {",
    "      var rows = g.a5Rows || 3;",
    "      var columns = Math.ceil(Math.max(0, count - 1) / rows);",
    "      var row = (count ? 62 : 0) + columns * 82 + (g.extra || 0);",
    "      var slots = (count ? 1 : 0) + columns + (g.extra ? 1 : 0);",
    "      return Math.max(g.head || 0, row + Math.max(0, slots - 1) * 2) + (g.pad || 0);",
    "    }",
    ""
  ].join("\n") + s.slice(j);
  // Preserve all commands, but place alternate methods after face commands rather than
  // spending the first several slots on e.g. tangent-circle variants.
  r('    (panel.face || []).forEach(function (slot) {', '    var alternatives = [];\n    (panel.face || []).forEach(function (slot) {', "命令族");
  r('      (slot.menu || []).forEach(add);', '      (slot.menu || []).forEach(function (id) { alternatives.push(id); });', "延后命令族");
  r('    (panel.primary || []).forEach(add);\n    ids.forEach(add);','    (panel.primary || []).forEach(add);\n    alternatives.forEach(add);\n    ids.forEach(add);', "保留全部命令");
  r('    var mode = prefs.mode;\n    panels.forEach(function (panel) {','    var mode = prefs.mode;\n    var a5Rows = mode === "compact" ? 2 : 3;\n    root.document.documentElement.dataset.uitoolA5Rows = String(a5Rows);\n    var a5Caps = {"绘图":7,"修改":7,"注释":4,"图层":4,"块":3,"实用工具":4,"剪贴板":2};\n    panels.forEach(function (panel) {', "双行三行模式");
  r('      var cap = ids.length ? effectiveCap(pref.cap, ids.length, mode) : 0;', '      var initialCap = (cur.id === "常用" || cur.name === "常用") ? a5Caps[panel.name] : null;\n      var cap = ids.length ? effectiveCap(pref.cap == null && initialCap ? initialCap : pref.cap, ids.length, mode) : 0;', "A5 常显数量");
  r('        pad: 8,\n        innerGap: 2,','        pad: 11,\n        a5Rows: a5Rows,\n        innerGap: 2,', "面板尺寸");
  r('      var extra = panel.name === "图层" ? 120 : 0;', '      var extra = panel.name === "图层" ? 118 : 0;', "当前图层尺寸");
  return s;
}
