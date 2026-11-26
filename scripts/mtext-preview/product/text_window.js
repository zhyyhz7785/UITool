/* 多行文字编辑窗口。会话和写回在主窗口的 doc_host.js。这里按需装载 ui-doc。 */
(function (global) {
  "use strict";
  var seq = null;
  var dirty = false;
  var ready = false;
  var finishing = false;
  var queuedAct = null;
  var openedAt = 0;
  var loading = null;
  var markdownSession = null;
  var rulerQueued = false;
  var rulerBound = false;
  var rulerObserver = null;
  var rulerMutationObserver = null;

  function root() { return document.getElementById("mtext-editor"); }
  function askBox() { return document.getElementById("mtext-ask"); }
  function placeholder() { return root().querySelector(".mte-placeholder"); }
  function mountEl() { return root().querySelector(".mte-mount"); }
  function noteEl() { return document.getElementById("tw-note"); }
  function titleEl() { return document.getElementById("tw-title"); }

  function quickbarEl() { return document.getElementById("mtext-quickbar"); }
  function rulerEl() { return document.getElementById("mtext-ruler"); }

  function hideRuler() {
    var el = rulerEl();
    if (el) el.hidden = true;
  }

  function setQuickbarVisible(visible) {
    var el = quickbarEl();
    if (el) el.hidden = !visible;
    if (!visible) hideRuler();
  }

  function scheduleRuler() {
    if (rulerQueued) return;
    rulerQueued = true;
    var raf = global.requestAnimationFrame || function (fn) { return global.setTimeout(fn, 16); };
    raf(function () {
      rulerQueued = false;
      updateRuler();
    });
  }

  function runEditorAction(name) {
    if (!ready || !global.Hy3dDoc || typeof global.Hy3dDoc.act !== "function") return;
    global.Hy3dDoc.act(name);
    dirty = true;
    scheduleRuler();
  }

  function bindQuickbar() {
    var bar = quickbarEl();
    if (!bar || bar.getAttribute("data-bound") === "1") return;
    bar.setAttribute("data-bound", "1");
    bar.addEventListener("mousedown", function (ev) {
      if (ev.target && ev.target.closest && ev.target.closest("button")) ev.preventDefault();
    });
    bar.addEventListener("click", function (ev) {
      var button = ev.target && ev.target.closest ? ev.target.closest("[data-mtext-act]") : null;
      if (!button) return;
      ev.preventDefault();
      runEditorAction(button.getAttribute("data-mtext-act"));
    });
  }

  function setControlledInput(input, value) {
    if (!input) return false;
    var proto = global.HTMLInputElement && global.HTMLInputElement.prototype;
    var descriptor = proto && Object.getOwnPropertyDescriptor(proto, "value");
    if (descriptor && descriptor.set) descriptor.set.call(input, String(value));
    else input.value = String(value);
    input.dispatchEvent(new global.Event("input", { bubbles: true }));
    return true;
  }

  function rulerStep(width) {
    var target = Math.max(width / 8, 0.1);
    var power = Math.pow(10, Math.floor(Math.log(target) / Math.LN10));
    var ratio = target / power;
    var factor = ratio < 1.5 ? 1 : ratio < 3.5 ? 2 : ratio < 7.5 ? 5 : 10;
    return factor * power;
  }

  function addRulerHandle(el, kind, left, rulerWidth) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "mte-ruler-handle mte-ruler-handle--" + kind;
    button.style.left = Math.max(0, Math.min(Math.max(0, rulerWidth - 8), left - 4)) + "px";
    button.setAttribute("aria-label", kind === "width" ? "拖动调整文字框宽度" : "拖动调整栏间距");
    button.title = kind === "width" ? "拖动调整文字框宽度" : "拖动调整栏间距";
    button.addEventListener("pointerdown", function (ev) { beginRulerDrag(ev, kind); });
    el.appendChild(button);
  }

  function beginRulerDrag(ev, kind) {
    if (ev.button !== 0 || !ready || !global.Hy3dDoc || !global.Hy3dDoc.result) return;
    var result = global.Hy3dDoc.result();
    var frame = document.querySelector(".mtext-v3-frame");
    if (!result || !frame) return;
    var width = Number(result.width);
    if (!(width > 0)) width = 40;
    var rect = frame.getBoundingClientRect();
    var scale = rect.width / width;
    if (!(scale > 0)) return;
    var input = kind === "width"
      ? document.querySelector('.mtext-v3-side input[aria-label="文字框宽"]')
      : document.querySelector('.mtext-v3-side input[aria-label="栏间距"]');
    if (!input) return;

    ev.preventDefault();
    ev.stopPropagation();
    var base = kind === "width" ? width : Math.max(0, Number(result.column_gutter) || 0);
    var startX = ev.clientX;
    var pointerId = ev.pointerId;
    var target = ev.currentTarget;
    if (target && target.setPointerCapture && pointerId != null) {
      try { target.setPointerCapture(pointerId); } catch (_e) {}
    }

    function move(e) {
      if (pointerId != null && e.pointerId !== pointerId) return;
      var next = base + (e.clientX - startX) / scale;
      next = kind === "width" ? Math.max(0.1, next) : Math.max(0, next);
      setControlledInput(input, String(Math.round(next * 100) / 100));
      scheduleRuler();
    }

    function end(e) {
      if (pointerId != null && e.pointerId !== pointerId) return;
      global.removeEventListener("pointermove", move, true);
      global.removeEventListener("pointerup", end, true);
      global.removeEventListener("pointercancel", end, true);
      scheduleRuler();
    }

    global.addEventListener("pointermove", move, true);
    global.addEventListener("pointerup", end, true);
    global.addEventListener("pointercancel", end, true);
  }

  function updateRuler() {
    var el = rulerEl();
    if (!el) return;
    if (markdownSession || !ready || seq == null || !global.Hy3dDoc || !global.Hy3dDoc.result) {
      hideRuler();
      return;
    }
    var editorRoot = document.querySelector(".mtext-v3");
    if (editorRoot && editorRoot.classList.contains("is-preview")) {
      hideRuler();
      return;
    }
    var frame = document.querySelector(".mtext-v3-frame");
    var stage = document.querySelector(".mtext-v3-stage");
    var result = global.Hy3dDoc.result();
    if (!frame || !stage || !result) {
      hideRuler();
      return;
    }

    var rect = frame.getBoundingClientRect();
    var stageRect = stage.getBoundingClientRect();
    var rulerTop = rect.top - 23;
    var visibleLeft = Math.max(rect.left, stageRect.left);
    var visibleRight = Math.min(rect.right, stageRect.right);
    var visibleWidth = visibleRight - visibleLeft;
    if (rect.width < 24 || visibleWidth < 24 || rect.bottom <= stageRect.top ||
        rect.top >= stageRect.bottom || rulerTop < stageRect.top + 1) {
      hideRuler();
      return;
    }

    var width = Number(result.width);
    if (!(width > 0)) width = 40;
    var scale = rect.width / width;
    var offset = visibleLeft - rect.left;
    var step = rulerStep(width);
    el.hidden = false;
    el.style.left = visibleLeft + "px";
    el.style.top = rulerTop + "px";
    el.style.width = visibleWidth + "px";
    el.style.setProperty("--mte-major-step", Math.max(8, step * scale) + "px");
    el.style.setProperty("--mte-minor-step", Math.max(3, step * scale / 5) + "px");

    var ticks = document.createElement("div");
    ticks.className = "mte-ruler-ticks";
    var labels = document.createElement("div");
    labels.className = "mte-ruler-labels";
    for (var value = 0; value <= width + step * 0.001; value += step) {
      var x = value * scale - offset;
      if (x < -2 || x > visibleWidth + 2) continue;
      var label = document.createElement("span");
      label.style.left = x + "px";
      label.textContent = String(Math.round(value * 100) / 100);
      labels.appendChild(label);
    }
    el.replaceChildren(ticks, labels);

    var widthHandleX = rect.width - 4 - offset;
    if (widthHandleX >= -2 && widthHandleX <= visibleWidth + 2) {
      addRulerHandle(el, "width", widthHandleX, visibleWidth);
    }

    var count = Math.max(0, Number(result.column_count) || 0);
    var colWidth = Number(result.column_width) || 0;
    var gutter = Math.max(0, Number(result.column_gutter) || 0);
    if (count > 1 && colWidth > 0) {
      for (var i = 1; i < count; i += 1) {
        var markerX = (i * colWidth + (i - 0.5) * gutter) * scale - offset;
        if (markerX >= 0 && markerX <= visibleWidth) {
          addRulerHandle(el, "column", markerX, visibleWidth);
        }
      }
    }
  }

  function installRulerTracking() {
    if (rulerBound) return;
    rulerBound = true;
    var stage = document.querySelector(".mtext-v3-stage");
    var mount = mountEl();
    if (stage) stage.addEventListener("scroll", scheduleRuler, { passive: true });
    if (mount) {
      mount.addEventListener("input", scheduleRuler, true);
      mount.addEventListener("change", scheduleRuler, true);
    }
    global.addEventListener("resize", scheduleRuler);
    if (global.ResizeObserver) {
      rulerObserver = new global.ResizeObserver(scheduleRuler);
      var frame = document.querySelector(".mtext-v3-frame");
      if (frame) rulerObserver.observe(frame);
      if (stage) rulerObserver.observe(stage);
    }
    if (global.MutationObserver) {
      rulerMutationObserver = new global.MutationObserver(scheduleRuler);
      var editorRoot = document.querySelector(".mtext-v3");
      if (editorRoot) rulerMutationObserver.observe(editorRoot, { attributes: true, attributeFilter: ["class"] });
    }
  }

  function setMarkdownActions(visible, busy) {
    var bar = document.getElementById("mtext-md-actions");
    bar.hidden = !visible;
    ["md-copy", "md-save", "md-layout", "md-source"].forEach(function (id) {
      document.getElementById(id).disabled = !!busy;
    });
    document.getElementById("md-cancel").disabled = !!finishing;
  }

  function disposeMarkdown() {
    var current = markdownSession;
    markdownSession = null;
    setMarkdownActions(false, false);
    if (!current) return;
    if (current.workspace) current.workspace.destroy();
    current.root.remove();
    // An in-flight SDK mount owns its detached node until it settles.
    current.opening.then(function () { return current.host.discard(); }, function () { return current.host.discard(); });
  }

  function openMarkdown(spec, id) {
    var node = document.createElement("div");
    node.className = "mte-md-root";
    mountEl().appendChild(node);
    var adapter = global.Hy3dTextSdkHost.create({
      loadSdk: function () { return import("./sdk-text/index.js"); },
      loadSource: function () { return import("./doc-dist/text-sdk-source.js"); }
    });
    var workspace = global.Hy3dMarkdownWorkspace.create(node, spec, showNote, function(active){
      var button=document.getElementById("md-source");
      button.textContent=active?"富文本":"源码";button.setAttribute("aria-pressed",String(active));
    },function(open){
      document.getElementById("md-layout").setAttribute("aria-pressed",String(open));
    });
    var current = { host: adapter, root: node, workspace: workspace, opening: null, switching: false };
    markdownSession = current;
    setMarkdownActions(true, true);
    current.opening = Promise.resolve().then(function () {
      return adapter.open({
        kind: "mtext",
        content: spec.original != null ? spec.original : (spec.geom && spec.geom.content) || "",
        documentId: spec.documentId,
        revision: spec.revision,
        root: workspace.editorRoot
      });
    });
    current.opening.then(function (opened) {
      if (seq !== id || markdownSession !== current) return;
      if (!opened || !opened.ok) {
        deliver(id, "save", { refused: true, message: "该文字不能无损转换为 Markdown，请普通双击使用 CAD 编辑器。" });
        return;
      }
      workspace.attach(adapter);
      document.getElementById("md-source").textContent = "源码";
      document.getElementById("md-source").setAttribute("aria-pressed","false");
      document.getElementById("md-layout").setAttribute("aria-pressed","false");
      setMarkdownActions(true, false);
      showNote("仅可无损往返的内容能写回 CAD；其他排版可复制 Markdown，原图不会被改写。");
      markReady();
    }).catch(function (err) {
      if (seq !== id || markdownSession !== current) return;
      deliver(id, "save", { refused: true, message: "Markdown 编辑器打开失败：" + (err && err.message ? err.message : err) });
    });
  }

  function copyMarkdown() {
    if (!ready || finishing || !markdownSession) return;
    var body = markdownSession.workspace.body();
    if (body === undefined) body = markdownSession.host.getMarkdown();
    var id = seq;
    function fallback() {
      if(seq!==id)return;
      var active=document.activeElement, input=document.createElement("textarea");
      input.value=body;input.style.position="fixed";input.style.left="-9999px";
      document.body.appendChild(input);input.select();
      var ok=false;try{ok=document.execCommand("copy");}catch(_e){}
      input.remove();if(active&&active.focus)active.focus();
      showNote(ok?"已复制完整 Markdown 源文。":"剪贴板不可用，请切到源码后 Ctrl+A、Ctrl+C。");
    }
    if (!global.navigator || !navigator.clipboard || !navigator.clipboard.writeText) { fallback(); return; }
    navigator.clipboard.writeText(body).then(function () {
      if (seq === id) showNote("已复制完整 Markdown 源文。");
    }, fallback);
  }

  function loadDoc() {
    if (global.Hy3dDoc) return Promise.resolve(global.Hy3dDoc);
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "doc-dist/hy3d-doc.css";
      document.head.appendChild(css);
      var script = document.createElement("script");
      script.src = "doc-dist/hy3d-doc.js";
      script.onload = function () {
        if (global.Hy3dDoc) resolve(global.Hy3dDoc);
        else reject(new Error("文字编辑器没有挂上"));
      };
      script.onerror = function () { reject(new Error("文字编辑器没有装上")); };
      document.head.appendChild(script);
    });
    return loading;
  }

  function applyTheme() {
    if (global.hy3dOwnedTheme && hy3dOwnedTheme.apply) hy3dOwnedTheme.apply();
  }

  function showNote(text) {
    var note = noteEl();
    if (!note) return;
    note.hidden = !text;
    note.textContent = text || "";
  }

  function deliver(done, action, result) {
    var hold = placeholder();
    if (hold) hold.hidden = true;
    setQuickbarVisible(false);
    askBox().hidden = true;
    showNote("");
    dirty = false;
    ready = false;
    finishing = false;
    seq = null;
    if (markdownSession) disposeMarkdown();
    else if (global.Hy3dDoc && Hy3dDoc.unmount) Hy3dDoc.unmount();
    mountEl().inert = false;
    if (global.Host && Host.textWindowDone) Host.textWindowDone(done, action, result);
  }

  function finish(action) {
    if (seq == null || finishing) return;
    if (action === "save" && !ready) {
      queuedAct = { name: "确定" };
      return;
    }
    finishing = true;
    var done = seq;
    if (action !== "save") {
      deliver(done, "discard", null);
      return;
    }
    if (markdownSession) {
      var current = markdownSession;
      if (current.switching) { finishing=false; showNote("正在切换编辑模式，请稍后完成。"); return; }
      var patch;
      try { patch=current.workspace.patch(); } catch(err) { finishing=false;showNote(err.message);return; }
      askBox().hidden = true;
      mountEl().inert = true;
      setMarkdownActions(true, true);
      function retry(message) {
        if (seq !== done || markdownSession !== current) return;
        finishing = false;
        mountEl().inert = false;
        setMarkdownActions(true, false);
        showNote(message);
      }
      current.host.commit(current.workspace.body()).then(function (result) {
        if (seq !== done || markdownSession !== current) return;
        if (!result || !result.ok) {
          retry("无法无损写回 MTEXT。请调整格式，或复制 Markdown 后取消；原图保持不变。");
          return;
        }
        deliver(done, "save", Object.assign({ content: result.content, dirty: !!result.changed || !!patch }, patch || {}));
      }).catch(function (err) {
        retry("Markdown 提交失败：" + (err && err.message ? err.message : err));
      });
      return;
    }
    var result = global.Hy3dDoc && Hy3dDoc.result ? Hy3dDoc.result() : null;
    if (!result) {
      finishing = false;
      showNote("不支持该类无损提交");
      return;
    }
    if (result.blocked) {
      finishing = false;
      showNote(result.blocked);
      return;
    }
    deliver(done, "save", result);
  }

  function ask() {
    if (seq == null || finishing) return;
    if (markdownSession) {
      if (!ready) { finish("discard"); return; }
      var current = markdownSession;
      var id = seq;
      if (current.switching) { showNote("正在切换编辑模式。"); return; }
      current.host.isDirty(current.workspace.body()).then(function (changed) {
        if (seq !== id || markdownSession !== current || finishing) return;
        if (changed || current.workspace.changed()) askBox().hidden = false;
        else finish("discard");
      }, function () {
        if (seq === id && markdownSession === current && !finishing) askBox().hidden = false;
      });
      return;
    }
    if (!dirty) { finish("discard"); return; }
    askBox().hidden = false;
  }

  function markReady() {
    var hold = placeholder();
    if (hold) hold.hidden = true;
    ready = true;
    if (!markdownSession) {
      setQuickbarVisible(true);
      installRulerTracking();
      scheduleRuler();
    }
    var ms = performance.now() - openedAt;
    if (global.Host && Host.emit) Host.emit("text-window-ready", { seq: seq, ms: ms });
    if (queuedAct) { var next = queuedAct; queuedAct = null; onAct(next); }
  }

  function openSpec(msg) {
    if (!msg || msg.seq == null || finishing) return;
    seq = msg.seq;
    dirty = false;
    ready = false;
    queuedAct = null;
    openedAt = performance.now();
    var spec = msg.spec || {};
    askBox().hidden = true;
    showNote("");
    if (titleEl()) titleEl().textContent = spec.editorMode === "markdown" ? "多行文字 · Markdown" : "多行文字";
    setQuickbarVisible(false);
    disposeMarkdown();
    var hold = placeholder();
    if (hold) {
      hold.hidden = false;
      var paper = hold.querySelector(".mte-sheet");
      if (paper) paper.textContent = spec.plain || "";
    }
    mountEl().textContent = "";
    if (spec.editorMode === "markdown") {
      openMarkdown(spec, msg.seq);
      return;
    }
    loadDoc().then(function (doc) {
      if (seq !== msg.seq) return;
      return doc.mount(mountEl(), {
        geom: spec.geom || {},
        view: spec.view === "flow" ? "flow" : "paged",
        px: spec.px || 4,
        onReady: function () { if (seq === msg.seq) markReady(); },
        onDirty: function () { if (seq === msg.seq) dirty = true; },
        onNotice: function (text) { if (seq === msg.seq) showNote(text); },
        onSlow: function () {},
        onCommit: function () { if (seq === msg.seq) finish("save"); },
        onCancel: function () { if (seq === msg.seq) ask(); }
      });
    }).catch(function (err) {
      if (seq !== msg.seq) return;
      var failed = seq;
      seq = null;
      ready = false;
      var message = err && err.message ? err.message : "不支持该类无损提交";
      if (global.Host && Host.textWindowDone) {
        Host.textWindowDone(failed, "save", { refused: true, message: message });
      }
    });
  }

  function onAct(msg) {
    var name = msg && msg.name;
    if (seq == null && name !== "询问") return;
    if (!ready && name !== "询问") { queuedAct = msg; return; }
    if (name === "确定" || name === "关闭" || name === "close") { finish("save"); return; }
    if (name === "询问") { ask(); return; }
    if (markdownSession) {
      if (finishing) return;
      var current = markdownSession;
      if (current.switching || current.workspace.sourceActive()) { showNote("请先返回富文本编辑。"); return; }
      var id = seq;
      current.host.act(name).then(function (ran) {
        if (!ran && seq === id && markdownSession === current) showNote("请使用 Markdown 编辑器自身的工具栏。");
      }, function () {
        if (seq === id && markdownSession === current) showNote("Markdown 编辑命令执行失败。");
      });
      return;
    }
    runEditorAction(name);
  }

  applyTheme();
  bindQuickbar();
  document.getElementById("md-layout").addEventListener("click", function(){
    if (markdownSession && ready && !finishing && !markdownSession.switching) markdownSession.workspace.togglePanel();
  });
  document.getElementById("md-source").addEventListener("click", function(){
    var current=markdownSession;
    if(!current||!ready||finishing||current.switching)return;
    current.switching=true;setMarkdownActions(true,true);mountEl().inert=true;
    current.workspace.toggleSource().catch(function(err){showNote(err.message||"源码切换失败");}).finally(function(){
      if(markdownSession!==current)return;
      current.switching=false;mountEl().inert=false;setMarkdownActions(true,false);
      document.getElementById("md-source").textContent=current.workspace.sourceActive()?"富文本":"源码";
      if(current.workspace.sourceActive()){var source=current.root.querySelector(".md-source");if(source)source.focus();}
    });
  });
  document.getElementById("md-copy").addEventListener("click", copyMarkdown);
  document.getElementById("md-save").addEventListener("click", function () { finish("save"); });
  document.getElementById("md-cancel").addEventListener("click", ask);
  document.getElementById("tw-close").addEventListener("click", function () { ask(); });
  askBox().addEventListener("click", function (ev) {
    var act = ev.target.getAttribute && ev.target.getAttribute("data-act");
    if (act === "save") finish("save");
    else if (act === "discard") finish("discard");
    else if (act === "cancel") askBox().hidden = true;
  });
  document.addEventListener("keydown", function (ev) {
    if (seq == null || ev.isComposing) return;
    if (ev.key === "Escape") {
      if (!askBox().hidden) { askBox().hidden = true; return; }
      if (markdownSession && ev.defaultPrevented) return;
      if (ev.target && ev.target.closest && ev.target.closest(".hydoc-editor, .mtext-v3-pop, .mtext-v3-barfloat")) return;
      ask();
    }
    if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) {
      ev.preventDefault();
      finish("save");
    }
  });
  if (global.Host && Host.on) {
    Host.on("text-window-open", openSpec);
    Host.on("text-window-act", onAct);
  }
})(window);
