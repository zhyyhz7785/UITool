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
    var command = spec.byId[id];
    var label = String(item ? item[1] : (command && command.label || id));
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
      if (typeof api.appendRibbonSlot === "function") {
        api.appendRibbonSlot(target,{cmd:cmd,big:big,iconOnly:icon,rest:denseRest(spec,id,visible)});
        var last = target.lastElementChild;
        button = last && (last.matches("button") ? last : last.querySelector("button[data-cmd-id]"));
      } else {
        button = api.makeCmdButton(cmd,{ribbonTip:true,onlyGivenBig:true,big:big});
        target.appendChild(button);
      }
      if (!button) throw new Error("Missing button: " + id);
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
  // The baseline (#11 layer design) owns initialization, all groups and menus.
  // Enhancement never clears the live ribbon. Prepare each group off-DOM first.
  function enhanceDense(cur) {
    var host = api && api.ribbonPanels;
    if (!host || !cur || ["常用","默认","绘制"].indexOf(cur.id || cur.name) < 0) return;
    var boxes = Array.prototype.slice.call(host.querySelectorAll(".hy-rib-group"));
    var candidates = [], reserved = 0;
    function occupied(box) {
      // Do not count flex-distributed empty space as necessary width.
      var row = box.querySelector(".hy-rib-cmds");
      var children = row ? Array.prototype.slice.call(row.children) : [];
      var sum = children.reduce(function (w, el) { return w + (el.offsetWidth || 0); },0);
      var title = box.querySelector(".hy-rib-head");
      return Math.max(sum + Math.max(0,children.length-1)*2, title ? title.scrollWidth : 0, 40) + 12;
    }
    function warn(error, box) {
      root.console && root.console.warn("[UITool Ribbon] fallback to original group", error);
      if (box) box.dataset.uitoolDenseError = String(error);
    }
    boxes.forEach(function (box) {
      var key = box.dataset.hyKey, original = model[key];
      var panel = original && (cur.panels || []).find(function (p) { return p.name === original.name; });
      var row = box.querySelector(".hy-rib-cmds");
      if (!original || !panel || !row || original.name === "图层") {
        reserved += occupied(box); return;
      }
      try {
        var cmds = original.order.map(function (id) { return original.byId[id]; }).filter(Boolean);
        var profile = denseProfile(cur,panel,cmds);
        if (!profile) { reserved += occupied(box); return; }
        var byId = Object.assign(Object.create(null),original.byId);
        cmds.forEach(function (cmd) { byId[cmd.id] = cmd; });
        var ids = denseOrder(profile,original.order);
        // Keep the approved layer setting key. Accept old /dense preferences,
        // then save future changes through the original group's normal menu.
        var prefKey = prefs.groups[key] ? key : key + "/dense";
        var pref = orderOf(prefKey,ids);
        var order = pref.order.filter(function (id) { return !!byId[id]; });
        if (!order.length) { reserved += occupied(box); return; }
        var cap = Math.max(1,Math.min(order.length, pref.cap == null ? profile.length : pref.cap));
        var spec = Object.assign({},original,{
          byId:byId, order:order, dense:profile, denseRows:prefs.mode === "compact" ? 2 : 3,
          storedCap:pref.cap, cap:cap, pad:12
        });
        candidates.push({box:box,row:row,original:original,spec:spec,count:1});
      } catch (error) {
        warn(error,box); reserved += occupied(box);
      }
    });
    if (!candidates.length) return;
    var available = Math.max(0,host.clientWidth - 8 - reserved);
    function total() {
      return candidates.reduce(function (w,c) { return w+denseWidth(c.spec,c.count); },0);
    }
    // Always retain one real button per group even in a very narrow preview.
    // The host can scroll rather than clearing or hiding whole groups.
    for (var round=0; round<100; round++) {
      var changed=false;
      candidates.forEach(function(c) {
        if (c.count >= c.spec.cap) return;
        c.count++;
        if (total() <= available) changed=true;
        else c.count--;
      });
      if (!changed) break;
    }
    candidates.forEach(function(c) {
      try {
        var next = root.document.createElement("div");
        next.className = "hy-rib-cmds";
        // Candidate stays detached until all its buttons are successfully rendered.
        renderDense(next,c.spec,c.count);
        if (!next.querySelector("button[data-cmd-id]")) throw new Error("Empty candidate group");
        c.row.replaceWith(next);
        c.spec.shown=c.count;
        model[c.original.key]=c.spec;
        delete c.box.dataset.uitoolDenseError;
      } catch (error) { warn(error,c.box); }
    });
    if (openKey && model[openKey]) {
      var head = boxes.find(function(b){return b.dataset.hyKey===openKey;});
      var anchor = head && head.querySelector(".hy-rib-head");
      if (anchor) renderFly(openKey,anchor);
    }
    host.dataset.uitoolDenseStatus = boxes.some(function(b){return b.dataset.uitoolDenseError;}) ? "partial-fallback" : "ready";
  }
}
export function denseRibbonSource(source) {
  // Do not rewrite the native allocator or build loop. If the optional hook is
  // incompatible, deliver the working layer baseline rather than a blank page.
  const anchor = "  function buildPanels(cur) {";
  if (source.split(anchor).length !== 2) {
    return source + "\n;console.warn('[UITool Ribbon] optional design hook unavailable; using layer baseline');\n";
  }
  const runtime = denseRuntime.toString();
  const helper = runtime.slice(runtime.indexOf("{")+1,runtime.lastIndexOf("}"));
  return source.replace(anchor, () =>
    "  var UITOOL_RIBBON = " + JSON.stringify(design) + ";\n" + helper +
    "\n  function buildPanels(cur) {\n" +
    "    buildLayerPanels(cur);\n" +
    "    try { enhanceDense(cur); } catch (error) {\n" +
    "      if (api && api.ribbonPanels) api.ribbonPanels.dataset.uitoolDenseStatus = 'fallback';\n" +
    "      root.console && root.console.warn('[UITool Ribbon] using layer baseline', error);\n" +
    "    }\n  }\n  function buildLayerPanels(cur) {"
  );
}
