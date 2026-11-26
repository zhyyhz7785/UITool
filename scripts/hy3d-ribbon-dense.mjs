// Shared by the old A5 and the native CAD Ribbon preview, never by the product host.
import { readFileSync } from "node:fs";
const design = JSON.parse(readFileSync(new URL("./hy3d-ribbon-design.json", import.meta.url), "utf8"));

function denseRuntime() {
  function denseProfile(cur, panel, cmds) {
    if (["常用","默认","绘制"].indexOf(cur.id || cur.name) < 0) return null;
    var list = UITOOL_RIBBON.groups[panel.name === "绘制" ? "绘图" : panel.name];
    if (!list) return null;
    var result = [];
    list.forEach(function (item) {
      var cmd = cmds.find(function (c) { return c.id === item[0]; });
      if (!cmd && root.Registry && root.Registry.get) {
        cmd = root.Registry.get(item[0]);
        if (cmd && cmd.status === "done") cmds.push(cmd);
      }
      if (cmd && cmd.status === "done") result.push(item);
    });
    return result.length ? result : null;
  }
  function denseOrder(profile, original) {
    if (!profile) return original;
    var ids = profile.map(function (item) { return item[0]; });
    return ids.concat(original.filter(function (id) { return ids.indexOf(id) < 0; }));
  }
  function denseItem(spec, id) {
    var item = spec.dense.find(function (r) { return r[0] === id; });
    var label = item ? item[1] : (spec.byId[id].label || id);
    var kind = item ? item[2] : "text";
    return { label:label, kind:kind, width:kind === "big" ? 48 : kind === "icon" ? 26 : Math.min(108, Math.max(52, 28 + label.length * 12)) };
  }
  function denseRest(spec, id, visible) {
    var slot = spec.slots && spec.slots[id];
    return slot && slot.rest ? slot.rest.filter(function (c) { return c.macro || visible.indexOf(c.id) < 0; }) : [];
  }
  function denseWidth(spec, count) {
    var visible = spec.order.slice(0,count);
    var row = 0, col = 0, used = 0, columns = 0;
    function flush() { if (used) { row += col; columns++; col = 0; used = 0; } }
    visible.forEach(function (id) {
      var item = denseItem(spec,id);
      if (item.kind === "big") { flush(); row += item.width; columns++; }
      else {
        var w = item.width + (denseRest(spec,id,visible).length ? 12 : 0);
        col = Math.max(col,w); used++;
        if (used === spec.denseRows) flush();
      }
    });
    flush();
    return Math.max(spec.head || 0, row + Math.max(0,columns-1)*2) + (spec.pad || 0);
  }
  function renderDense(row,spec,count) {
    row.classList.add("hy-rib-dense");
    row.dataset.denseRows = String(spec.denseRows);
    var stack = null, used = 0;
    var visible = spec.order.slice(0,count);
    visible.forEach(function (id) {
      var cmd = spec.byId[id];
      if (!cmd) return;
      var item = denseItem(spec,id), big = item.kind === "big", icon = item.kind === "icon";
      var target = row;
      if (big) { stack = null; used = 0; }
      else {
        if (!stack || used === spec.denseRows) {
          stack = root.document.createElement("div");
          stack.className = "hy-rib-dense-stack";
          row.appendChild(stack); used = 0;
        }
        target = stack; used++;
      }
      var button;
      if (api.appendRibbonSlot) {
        api.appendRibbonSlot(target,{cmd:cmd,big:big,iconOnly:icon,rest:denseRest(spec,id,visible)});
        var last = target.lastElementChild;
        button = last && (last.matches("button") ? last : last.querySelector("button[data-cmd-id]"));
      } else {
        button = api.makeCmdButton(cmd,{ribbonTip:true,onlyGivenBig:true,big:big});
        target.appendChild(button);
      }
      if (!button) return;
      button.classList.add("hy-rib-dense-btn");
      button.dataset.denseKind = item.kind;
      button.style.setProperty("--dense-w",item.width+"px");
      button.setAttribute("aria-label",cmd.label || id);
      if (icon) button.title = (cmd.label || id) + (cmd.key ? " ("+cmd.key+")" : "");
      var label = button.querySelector(".btn-label");
      if (label) label.textContent = item.label;
      var glyph = button.querySelector(".btn-glyph");
      var body = UITOOL_RIBBON.art[id];
      if (glyph && body) {
        var svg = root.document.createElementNS("http://www.w3.org/2000/svg","svg");
        svg.setAttribute("class","ic");
        svg.setAttribute("viewBox","0 0 24 24");
        svg.setAttribute("aria-hidden","true");
        svg.innerHTML = body;
        glyph.textContent = ""; glyph.appendChild(svg);
      }
    });
  }
}
export function denseRibbonSource(source) {
  let s = source;
  const r = (a,b) => {
    if (s.split(a).length !== 2) throw new Error("Ribbon 设计适配点不匹配："+a.slice(0,80));
    s=s.replace(a,()=>b);
  };
  const runtime = denseRuntime.toString();
  r("  function buildPanels(cur) {", "  var UITOOL_RIBBON = "+JSON.stringify(design)+";\n"+runtime.slice(runtime.indexOf("{")+1,runtime.lastIndexOf("}"))+"\n  function buildPanels(cur) {");
  r("    function widthOf(g, count) {","    function widthOf(g, count) {\n      if (g.dense) return denseWidth(g,count);");
  r("      var ids = cmds.map(function (c) { return c.id; });","      var dense = denseProfile(cur,panel,cmds);\n      var ids = cmds.map(function (c) { return c.id; });");
  const legacy = s.includes("var pref = orderOf(key, order);");
  if (legacy) {
    r("      var pref = orderOf(key, order);","      if (dense) key += '/dense';\n      var pref = orderOf(key, denseOrder(dense,order));");
  } else {
    r("      var pref = orderOf(key, defaultOrder(panel, ids));","      if (dense) key += '/dense';\n      var pref = orderOf(key, denseOrder(dense,defaultOrder(panel, ids)));");
  }
  r("      specs.push({","      if (dense) cap = Math.min(ids.length, pref.cap == null ? dense.length : Math.max(1,pref.cap));\n      specs.push({\n        dense:dense,\n        denseRows:mode === 'compact' ? 2 : 3,");
  if (legacy) {
    r('      if (spec.name === "图层") {\n        row.classList.add("hy-rib-layer-face");','      if (spec.dense) { renderDense(row,spec,count); }\n      else if (spec.name === "图层") {\n        row.classList.add("hy-rib-layer-face");');
  } else {
    r("      var stack = null, stackCount = 0;","      if (spec.dense) { renderDense(row,spec,count); } else {\n      var stack = null, stackCount = 0;");
    r("      box.appendChild(row);\n      box.appendChild(head);","      }\n      box.appendChild(row);\n      box.appendChild(head);");
  }
  return s;
}
