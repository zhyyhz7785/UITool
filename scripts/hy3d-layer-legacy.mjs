// Support older product mirrors in UITool only; reuse the A5 renderer and native callbacks.
import { a5RibbonSource } from "./hy3d-a5-preview.mjs";
const helper = "  // Original skin artwork: filled slanted layer sheets + small semantic state marks.\n  // This is presentation only; native buttons keep their handlers and tooltips.\n  var LAYER_MARKS = {\n    off: '<path d=\"M17 11a4 4 0 0 0-2 7v2h4v-2a4 4 0 0 0-2-7z\" fill=\"#69c8eb\"/><path d=\"m13 12 8 8\" stroke=\"currentColor\" stroke-width=\"1.5\"/>',\n    on: '<path d=\"M17 11a4 4 0 0 0-2 7v2h4v-2a4 4 0 0 0-2-7z\" fill=\"#ffd17a\"/><path d=\"M15 22h4\" stroke=\"#ffd17a\" stroke-width=\"1.5\"/>',\n    iso: '<path d=\"m13 11 8 4-8 4-8-4z\" fill=\"#62c9ee\" stroke=\"currentColor\" stroke-width=\".6\"/><path d=\"m13 16 7-5\" stroke=\"#62c9ee\" stroke-width=\"1.2\"/>',\n    uniso: '<path d=\"m13 11 8 4-8 4-8-4z\" fill=\"currentColor\"/><path d=\"M17 10a5 5 0 0 1 4 6m-4-1 4 1 1-4\" fill=\"none\" stroke=\"#62c9ee\" stroke-width=\"1.4\"/>',\n    freeze: '<path d=\"M17 11v12m-5-9 10 6m0-6-10 6m5-9-2 2m2-2 2 2\" fill=\"none\" stroke=\"#69c8eb\" stroke-width=\"1.5\"/>',\n    thaw: '<circle cx=\"17\" cy=\"17\" r=\"3\" fill=\"#ffd17a\"/><path d=\"M17 10v3m0 8v3m-7-7h3m8 0h3m-12-5 2 2m6 6 2 2m0-10-2 2m-6 6-2 2\" stroke=\"#ffd17a\" stroke-width=\"1.2\"/>',\n    lock: '<rect x=\"13\" y=\"16\" width=\"9\" height=\"7\" rx=\"1\" fill=\"#69c8eb\"/><path d=\"M15 16v-3a2.5 2.5 0 0 1 5 0v3\" fill=\"none\" stroke=\"#69c8eb\" stroke-width=\"1.8\"/>',\n    unlock: '<rect x=\"13\" y=\"16\" width=\"9\" height=\"7\" rx=\"1\" fill=\"#ffd17a\"/><path d=\"M15 16v-3a2.5 2.5 0 0 1 5 0\" fill=\"none\" stroke=\"#ffd17a\" stroke-width=\"1.8\"/>',\n    current: '<circle cx=\"17\" cy=\"14\" r=\"3.5\" fill=\"#69c8eb\"/><path d=\"m13 19 3 3 7-8\" fill=\"none\" stroke=\"#69c8eb\" stroke-width=\"1.8\"/>',\n    match: '<path d=\"m13 18 5-7 4 3-5 7z\" fill=\"#ffd17a\"/><path d=\"m12 18 4 3-4 2z\" fill=\"currentColor\"/>',\n    manager: '<rect x=\"14\" y=\"11\" width=\"9\" height=\"12\" rx=\".7\" fill=\"var(--bg-panel)\" stroke=\"currentColor\" stroke-width=\"1\"/><path d=\"M16 13h5v4h-5z\" fill=\"#69c8eb\"/><path d=\"M16 19h5m-5 2h3\" stroke=\"currentColor\" stroke-width=\"1\"/>'\n  };\n  var LAYER_ICONS = {\n    \"cad.layer\":\"manager\", \"cad.layoff\":\"off\", \"cad.layon\":\"on\", \"cad.layiso\":\"iso\",\n    \"cad.layuniso\":\"uniso\", \"cad.layfrz\":\"freeze\", \"cad.laythw\":\"thaw\",\n    \"cad.laylck\":\"lock\", \"cad.laylulk\":\"unlock\", \"cad.laymcur\":\"current\", \"cad.laymch\":\"match\"\n  };\n  function layerGlyph(mark, sheets) {\n    var svg = root.document.createElementNS(\"http://www.w3.org/2000/svg\", \"svg\");\n    svg.setAttribute(\"class\", \"ic hy-layer-art\");\n    svg.setAttribute(\"viewBox\", sheets ? \"0 0 24 24\" : \"10 10 14 14\");\n    svg.setAttribute(\"aria-hidden\", \"true\");\n    svg.innerHTML = (sheets ? '<path d=\"M8 2h14l-7 6H1z\" fill=\"currentColor\"/><path d=\"M8 8h13l-7 6H1z\" fill=\"currentColor\" opacity=\".8\"/><path d=\"M8 14h12l-7 6H1z\" fill=\"currentColor\" opacity=\".65\"/>' : \"\") + (LAYER_MARKS[mark] || \"\");\n    return svg;\n  }\n  function applyLayerArt(parent, id) {\n    var mark = LAYER_ICONS[id];\n    if (!mark) return;\n    var btn = parent.querySelector('button[data-cmd-id=\"' + id + '\"]');\n    var glyph = btn && btn.querySelector(\".btn-glyph\");\n    if (glyph) {\n      glyph.textContent = \"\";\n      glyph.appendChild(layerGlyph(mark, true));\n    }\n  }\n  function makeLayerPicker(select) {\n    var wrap = root.document.createElement(\"div\");\n    wrap.className = \"hy-rib-layer-picker\";\n    var state = root.document.createElement(\"span\");\n    state.className = \"hy-rib-layer-state\";\n    state.setAttribute(\"aria-hidden\", \"true\");\n    var swatch = root.document.createElement(\"span\");\n    swatch.className = \"hy-rib-layer-swatch\";\n    state.appendChild(swatch);\n    wrap.appendChild(state);\n    wrap.appendChild(select);\n    function update(layer) {\n      state.textContent = \"\";\n      if (layer) {\n        state.appendChild(layerGlyph(layer.off ? \"off\" : \"on\", false));\n        state.appendChild(layerGlyph(layer.frozen ? \"freeze\" : \"thaw\", false));\n        state.appendChild(layerGlyph(layer.locked ? \"lock\" : \"unlock\", false));\n        var app = root.hy3dApp;\n        var rgb = app && app.aciRgb ? app.aciRgb(Number(layer.color)) : null;\n        swatch.style.backgroundColor = rgb ? \"rgb(\" + rgb.join(\",\") + \")\" : \"transparent\";\n        state.appendChild(swatch);\n        wrap.title = layer.name + \" · \" + (layer.off ? \"关闭\" : \"打开\") + \" · \" + (layer.frozen ? \"冻结\" : \"解冻\") + \" · \" + (layer.locked ? \"锁定\" : \"解锁\") + \" · ACI \" + layer.color;\n      } else {\n        wrap.title = \"尚无当前图层数据\";\n      }\n      wrap.classList.toggle(\"has-layer\", !!layer);\n    }\n    update(null);\n    return { element: wrap, update: update };\n  }\n\n";
export function legacyLayerSource(source) {
  let s = a5RibbonSource(source);
  const r = (a,b) => {
    if (s.split(a).length !== 2) throw new Error("旧版图层适配点不匹配：" + a.slice(0,80));
    s = s.replace(a, () => b);
  };
  r('var STORE = "uitool.a5.hyRibbon";','var STORE = "uitool.layerDesign.hyRibbon";');
  r('  function buildPanels(cur) {', helper + '  function buildPanels(cur) {');
  r('      var cmds = uniqueCmds(panel);', [
    '      var cmds = uniqueCmds(panel);',
    '      var layerOrder = ["cad.layer","cad.layoff","cad.layon","cad.layiso","cad.layuniso","cad.layfrz","cad.laythw","cad.laylck","cad.laylulk","cad.laymcur","cad.laymch"];',
    '      if (panel.name === "图层") {',
    '        layerOrder.forEach(function (id) {',
    '          if (cmds.some(function (c) { return c.id === id; })) return;',
    '          var cmd = root.Registry && root.Registry.get && root.Registry.get(id);',
    '          if (cmd && cmd.status === "done") cmds.push(cmd);',
    '        });',
    '      }'
  ].join("\n"));
  r('      var pref = orderOf(key, defaultOrder(panel, ids));', [
    '      var order = defaultOrder(panel, ids);',
    '      if (panel.name === "图层") order = layerOrder.filter(function (id) { return ids.indexOf(id) >= 0; }).concat(order.filter(function (id) { return layerOrder.indexOf(id) < 0; }));',
    '      var pref = orderOf(key, order);'
  ].join("\n"));
  r('      var extra = panel.name === "图层" ? 118 : 0;', '      var extra = panel.name === "图层" ? 220 : 0;');
  r('      specs.push({','      if (panel.name === "图层") cap = Math.min(ids.length, pref.cap == null ? layerOrder.length : pref.cap);\n      specs.push({');
  r('      counts.push(len && cap > 0 ? 1 : 0);','      counts.push(g.name === "图层" ? cap : len && cap > 0 ? 1 : 0);');
  r('      var rows = g.a5Rows || 3;', '      if (g.name === "图层") return Math.max(g.head || 0, (count ? 48 + 2 + Math.max(220, Math.ceil(Math.max(0,count-1)/2)*28) : 220)) + (g.pad || 0);\n      var rows = g.a5Rows || 3;');
  const start = '      spec.order.slice(0, count).forEach(function (id) {';
  const end = '      box.appendChild(head);';
  const i = s.indexOf(start), j = s.indexOf(end,i);
  if (i < 0 || j < 0) throw new Error("缺少旧版图层渲染入口");
  const original = s.slice(i,j);
  s = s.slice(0,i) + [
    '      if (spec.name === "图层") {',
    '        row.classList.add("hy-rib-layer-face");',
    '        var column = root.document.createElement("div"); column.className = "hy-rib-layer-column";',
    '        var commands = root.document.createElement("div"); commands.className = "hy-rib-layer-commands";',
    '        var select = root.document.createElement("select"); select.className = "hy-rib-layer"; select.setAttribute("aria-label","当前图层");',
    '        var picker = makeLayerPicker(select); column.appendChild(picker.element); column.appendChild(commands);',
    '        var stack;',
    '        spec.order.slice(0,count).forEach(function (id,index) {',
    '          var cmd = spec.byId[id]; if (!cmd) return;',
    '          var big = index === 0;',
    '          var labels = {"cad.layer":"图层特性","cad.laymcur":"置为当前","cad.laymch":"匹配图层"};',
    '          var btn = api.makeCmdButton(Object.assign({},cmd,{label:labels[id] || cmd.label}),{ribbonTip:true,onlyGivenBig:true,big:big});',
    '          if (big) { row.appendChild(btn); applyLayerArt(row,id); return; }',
    '          if (!labels[id]) btn.classList.add("ribbon-icon-only");',
    '          if ((index-1)%2 === 0 || !stack) { stack = root.document.createElement("div"); stack.className = "hy-rib-stack"; commands.appendChild(stack); }',
    '          stack.appendChild(btn); applyLayerArt(stack,id);',
    '        });',
    '        row.appendChild(column);',
    '        if (root.UIToolLayerScene) layerDetach = root.UIToolLayerScene.attach(select,picker.update);',
    '      } else {',
    original,
    '      }',
    ''
  ].join("\n") + s.slice(j);
  return s;
}
