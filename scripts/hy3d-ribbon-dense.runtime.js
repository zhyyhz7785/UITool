// Browser-side source fragment: read as text by the preview server.
// Lives inside the real HY Ribbon closure; never bundled or serialized via Function.toString().
  function reportDense(status, groups, buttons, icons, error) {
    if (root.parent && root.parent !== root) {
      root.parent.postMessage({source:"uitool-product", product:"hy3d", op:"ribbon-design",
        design:{status:status,groups:groups,buttons:buttons,icons:icons,error:error||""}}, "*");
    }
  }

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

  // Slot identity never changes when its displayed command changes.
  // One-shot execution and explicit pinning are deliberately separate.
  var FAMILY_STORE = "uitool.ribbon.family.faces.v1";
  var familyChoices = null, familyPopup = null, familyAnchor = null;
  function readFamilyChoices() {
    if (familyChoices) return familyChoices;
    familyChoices = Object.create(null);
    try {
      var saved = JSON.parse(root.localStorage.getItem(FAMILY_STORE) || "{}");
      if (saved && typeof saved === "object") Object.keys(saved).forEach(function(k) {
        if (typeof saved[k] === "string") familyChoices[k] = saved[k];
      });
    } catch (e) {}
    return familyChoices;
  }
  function familyKey(cmd) { return cmd.id + "\u0000" + (cmd.macro || ""); }
  function familyMembers(spec,id) {
    var cmd = spec.byId[id];
    if (!cmd || cmd.status !== "done") return [];
    var configured = UITOOL_RIBBON.families[id];
    var native = spec.slots && spec.slots[id] && spec.slots[id].rest || [];
    if (!configured && !native.length) return [];
    var result = [], seen = new Set();
    function add(c) {
      if (!c || c.status !== "done" || seen.has(familyKey(c))) return;
      seen.add(familyKey(c)); result.push(c);
    }
    add(cmd);
    (configured || []).forEach(function(k) {
      add(spec.byId[k] || (root.Registry && root.Registry.get(k)));
    });
    native.forEach(add);
    // Legacy A5 has no slots/rest. Keep the registered measurement macros
    // from the original ribbon catalog as distinct executable choices.
    if (id === "cad.measuregeom") {
      [["快速","_quick"],["距离","_distance"],["半径","_radius"],["角度","_angle"],["面积","_area"],["体积","_volume"]].forEach(function(pair) {
        add(Object.assign({},cmd,{label:pair[0],macro:pair[1]}));
      });
    }
    return result.length > 1 ? result : [];
  }
  function familyFace(spec,id,members) {
    var choice = readFamilyChoices()[spec.key + "/" + id];
    return members.find(function(c){return familyKey(c)===choice;}) || spec.byId[id];
  }
  function paintFamilyArt(button,cmd) {
    var glyph = button.querySelector(".btn-glyph");
    var art = !cmd.macro && UITOOL_RIBBON.art[cmd.id];
    if (!glyph || !art) return;
    var svg = root.document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("class","ic"); svg.setAttribute("viewBox","0 0 24 24");
    svg.setAttribute("aria-hidden","true"); svg.innerHTML = art;
    glyph.textContent = ""; glyph.appendChild(svg);
  }
  function closeFamily(restore) {
    if (!familyPopup) return;
    var popup = familyPopup, anchor = familyAnchor;
    familyPopup = null; familyAnchor = null;
    root.document.removeEventListener("pointerdown",outsideFamily,true);
    root.document.removeEventListener("keydown",familyEscape,true);
    root.removeEventListener("resize",familyResize);
    if (anchor) anchor.setAttribute("aria-expanded","false");
    popup.remove();
    if (restore && anchor && anchor.isConnected) anchor.focus();
  }
  function outsideFamily(e) {
    if (familyPopup && !familyPopup.contains(e.target) && !(familyAnchor && familyAnchor.parentNode.contains(e.target))) closeFamily(false);
  }
  function familyEscape(e) {
    if (e.key === "Escape" && familyPopup) { e.preventDefault(); e.stopPropagation(); closeFamily(true); }
  }
  function familyResize() { closeFamily(false); }
  function setFamilyFace(spec,id,cmd) {
    var key = spec.key + "/" + id, choices = readFamilyChoices();
    if (cmd && familyKey(cmd)!==familyKey(spec.byId[id])) choices[key] = familyKey(cmd);
    else delete choices[key];
    try { root.localStorage.setItem(FAMILY_STORE,JSON.stringify(choices)); } catch(e) {}
    closeFamily(false);
    buildPanels(lastTab);
    var buttons = api.ribbonPanels.querySelectorAll("button[data-family-slot]");
    for (var i=0;i<buttons.length;i++) if (buttons[i].dataset.familySlot===key) { buttons[i].focus(); break; }
  }
  function showFamily(spec,id,members,anchor) {
    if (familyPopup && familyAnchor===anchor) { closeFamily(true); return; }
    closeFamily(false);
    if (api.closeMenus) api.closeMenus();
    var doc=root.document, popup=doc.createElement("div");
    popup.className="uitool-command-family";
    popup.setAttribute("role","dialog");
    popup.setAttribute("aria-label",(spec.byId[id].label || id)+"：命令菜单");
    var title=doc.createElement("div"); title.className="uitool-family-title";
    title.textContent=(spec.byId[id].label || id)+" · 命令菜单";
    popup.appendChild(title);
    var hint=doc.createElement("div"); hint.className="uitool-family-hint";
    hint.textContent="点击命令立即执行 · 点击右侧固定按钮切换常显";
    popup.appendChild(hint);
    var face=familyFace(spec,id,members);
    var list=doc.createElement("div"); list.className="uitool-family-list";
    members.forEach(function(cmd) {
      var row=doc.createElement("div"); row.className="uitool-family-row";
      // Native button owns execution, aliases, and the optional command macro.
      var run=api.makeCmdButton(cmd,{ribbonTip:true,onlyGivenBig:true});
      run.classList.add("uitool-family-run");
      run.setAttribute("aria-label","执行 "+(cmd.label || cmd.id));
      paintFamilyArt(run,cmd);
      run.addEventListener("click",function(){closeFamily(false);});
      row.appendChild(run);
      var pin=doc.createElement("button"); pin.type="button"; pin.className="uitool-family-pin";
      var selected=familyKey(face)===familyKey(cmd);
      pin.textContent=selected?"✓":"固定"; pin.setAttribute("aria-pressed",String(selected));
      pin.title=selected?"当前常显命令":"设为常显命令（不执行）";
      pin.setAttribute("aria-label",(cmd.label || cmd.id)+"："+pin.title);
      pin.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();setFamilyFace(spec,id,cmd);});
      row.appendChild(pin); list.appendChild(row);
    });
    popup.appendChild(list);
    var reset=doc.createElement("button"); reset.type="button"; reset.className="uitool-family-reset";
    reset.textContent="恢复默认命令";
    reset.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();setFamilyFace(spec,id,null);});
    popup.appendChild(reset);
    doc.body.appendChild(popup);
    familyPopup=popup; familyAnchor=anchor;
    anchor.setAttribute("aria-expanded","true");
    var rect=anchor.getBoundingClientRect(), gap=4;
    var width=popup.offsetWidth, height=popup.offsetHeight;
    popup.style.left=Math.max(gap,Math.min(rect.left,root.innerWidth-width-gap))+"px";
    popup.style.top=Math.max(gap,rect.bottom+height+gap<=root.innerHeight?rect.bottom+gap:Math.min(rect.top-height-gap,root.innerHeight-height-gap))+"px";
    doc.addEventListener("pointerdown",outsideFamily,true);
    doc.addEventListener("keydown",familyEscape,true);
    root.addEventListener("resize",familyResize);
    var first=list.querySelector("button");
    if (first) first.focus();
  }
  function appendFamily(target,spec,id,members,item) {
    var doc=root.document, big=item.kind==="big";
    var cmd=familyFace(spec,id,members);
    var wrap=doc.createElement("div");
    wrap.className="ribbon-split uitool-family-split"+(big?" is-big":"");
    var button=api.makeCmdButton(cmd,{ribbonTip:true,onlyGivenBig:true,big:big});
    button.dataset.familySlot=spec.key+"/"+id;
    wrap.appendChild(button);
    var arrow=doc.createElement("button"); arrow.type="button";
    arrow.className="ribbon-split-arrow uitool-family-arrow";
    arrow.textContent="▾"; arrow.title="展开 "+(spec.byId[id].label || id)+" 命令菜单";
    arrow.setAttribute("aria-label",arrow.title);
    arrow.setAttribute("aria-haspopup","dialog"); arrow.setAttribute("aria-expanded","false");
    function open(e) { e.preventDefault(); e.stopPropagation(); showFamily(spec,id,members,arrow); }
    arrow.addEventListener("click",open);
    wrap.addEventListener("contextmenu",open);
    button.addEventListener("keydown",function(e){
      if (e.key==="ContextMenu" || (e.shiftKey && e.key==="F10") || (e.altKey && e.key==="ArrowDown")) open(e);
    });
    button.addEventListener("click",function(){closeFamily(false);});
    wrap.appendChild(arrow); target.appendChild(wrap);
    return button;
  }

  function denseWidth(spec, count) {
    var visible = spec.order.slice(0,count);
    var row = 0, col = 0, used = 0, columns = 0;
    function flush() { if (used) { row += col; columns++; col = 0; used = 0; } }
    visible.forEach(function (id) {
      var item = denseItem(spec,id);
      var members = familyMembers(spec,id);
      if (item.kind === "big") { flush(); row += item.width; columns++; }
      else {
        var w = item.width + (members.length || denseRest(spec,id,visible).length ? 12 : 0);
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
      var members=familyMembers(spec,id);
      if (members.length) {
        cmd=familyFace(spec,id,members);
        button=appendFamily(target,spec,id,members,item);
      } else if (typeof api.appendRibbonSlot === "function") {
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
      if (label) label.textContent = familyKey(cmd)===familyKey(spec.byId[id]) ? item.label : (cmd.label || cmd.id);
      paintFamilyArt(button,cmd);
    });
  }
  // The baseline (#11 layer design) owns initialization, all groups and menus.
  // Enhancement never clears the live ribbon. Prepare each group off-DOM first.
  function enhanceDense(cur) {
    var host = api && api.ribbonPanels;
    if (!host || !cur) return;
    if (["常用","默认","绘制"].indexOf(cur.id || cur.name) < 0) { reportDense("other-tab",0,0,0); return; }
    var boxes = Array.prototype.slice.call(host.querySelectorAll(".hy-rib-group"));
    var candidates = [], reserved = 0;
    function occupied(box) {
      // Do not count flex-distributed empty space as necessary width.
      var row = box.querySelector(".hy-rib-cmds");
      var children = row ? Array.prototype.slice.call(row.children) : [];
      var sum = children.reduce(function (w, el) { return w + (el.offsetWidth || 0); },0);
      var title = box.querySelector(".hy-rib-head");
      var titleWidth = title ? (String(title.textContent || "").length * 13 + 8) : 0;
      return Math.max(sum + Math.max(0,children.length-1)*2, titleWidth, 40) + 12;
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
        var prefKey = key + "/dense";
        // Baseline preferences must not suppress the new design. Keep the
        // approved layer key separate; migrate only explicit dense settings.
        var pref = orderOf(prefKey,ids);
        var order = pref.order.filter(function (id) { return !!byId[id]; });
        if (!order.length) { reserved += occupied(box); return; }
        var cap = Math.max(1,Math.min(order.length, pref.cap == null ? profile.length : pref.cap));
        var spec = Object.assign({},original,{
          byId:byId, order:order, dense:profile, denseRows:prefs.mode === "compact" ? 2 : 3,
          storedCap:pref.cap, cap:cap, pad:12
        });
        // One primary plus at least one full small-button column; very narrow
        // windows scroll instead of silently reverting to sparse legacy faces.
        candidates.push({box:box,row:row,original:original,spec:spec,count:Math.min(cap,1+spec.denseRows)});
      } catch (error) {
        warn(error,box); reserved += occupied(box);
      }
    });
    if (!candidates.length) { reportDense("fallback",0,0,0,"没有匹配到候选命令组"); return; }
    var available = Math.max(0,host.clientWidth - 8 - reserved);
    // At desktop design widths show the full candidate by default. The
    // calculated full row is about 1.5k CSS px including the approved layer
    // group; retain a small scroll tail rather than hiding every icon-only tool.
    if (host.clientWidth >= 1200 && prefs.mode !== "compact") {
      available = Math.max(available,candidates.reduce(function(w,c){return w+denseWidth(c.spec,c.spec.cap);},0));
    }
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
    var applied = host.querySelectorAll(".hy-rib-dense").length;
    var buttons = host.querySelectorAll(".hy-rib-dense-btn").length;
    var icons = host.querySelectorAll('.hy-rib-dense-btn[data-dense-kind="icon"]').length;
    var failed = boxes.filter(function(b){return b.dataset.uitoolDenseError;}).map(function(b){return b.dataset.hyKey + ": " + b.dataset.uitoolDenseError;});
    reportDense(applied === 6 ? "ready" : "partial-fallback", applied, buttons, icons, failed.join("\n"));
    host.dataset.uitoolDenseStatus = applied === 6 ? "ready" : "partial-fallback";
  }
