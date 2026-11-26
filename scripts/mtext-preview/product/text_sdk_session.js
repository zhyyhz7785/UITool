/* 文字窗按需调用 @hymd/sdk-text。取消和关闭不 apply。同一次会话 apply 只打一次。 */
(function (global) {
  "use strict";

  var REFUSE = "不支持该类无损提交";
  var RIBBON = {
    "粗体": "bold",
    "bold": "bold",
    "斜体": "italic",
    "italic": "italic",
    "删除线": "strike",
    "strike": "strike",
    "下划线": "underline",
    "under": "underline",
    "underline": "underline",
    "左对齐": "alignLeft",
    "left": "alignLeft",
    "居中": "alignCenter",
    "center": "alignCenter",
    "右对齐": "alignRight",
    "right": "alignRight",
    "两端对齐": "alignJustify",
    "justify": "alignJustify"
  };

  function refuse(message) {
    return { ok: false, message: message || REFUSE };
  }

  function canonicalBody(body) {
    return String(body || "").replace(/\r\n/g, "\n").replace(/\n+$/, "");
  }

  function samePresentation(a, b) {
    return !!a && !!b && a.fontId === b.fontId && a.lineHeight === b.lineHeight;
  }

  // The CAD adapter does not represent arbitrary font flags or unknown MTEXT control codes.
  // Limit the advanced editor to the bridge's explicitly representable source subset.
  function safeOriginal(content) {
    var rest = String(content || "").replace(/\{\\f\|b[01]\|i[01];[^{}]*\}/g, function (run) {
      return run.slice(run.indexOf(";") + 1, -1);
    }).replace(/\\[PKk]/g, "");
    return !/[\\{}]/.test(rest);
  }

  function create(deps) {
    var loadSdk = deps.loadSdk;
    var loadSource = deps.loadSource;
    var state = null;
    var seq = 0;

    function revisionOf(text) {
      var h = 2166136261;
      var s = String(text || "");
      var i;
      for (i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return (h >>> 0).toString(16) + ":" + s.length;
    }

    async function open(spec) {
      spec = spec || {};
      if (state) await discard();
      var bridge;
      var sdkMod;
      var sdk;
      var opened;
      var loaded;
      var editor;
      var snap;
      try {
        bridge = await loadSource();
        if (spec.kind === "mtext" && !safeOriginal(spec.content)) return refuse(REFUSE);
        var source = bridge.sourceToHymdMarkdown({ kind: spec.kind, content: spec.content || "" });
        if (!source.ok) return refuse(source.message);
        sdkMod = await loadSdk();
        if (!sdkMod || typeof sdkMod.createTextSdk !== "function" || typeof sdkMod.loadTextEditor !== "function") {
          return refuse(REFUSE);
        }
        sdk = sdkMod.createTextSdk();
        var caps = await sdk.capabilities();
        if (!caps || caps.apiVersion !== 1) return refuse(REFUSE);
        seq += 1;
        opened = await sdk.openSession({
          apiVersion: 1,
          requestId: "tw-" + seq,
          documentId: spec.documentId || "new",
          revision: spec.revision || revisionOf(spec.content || ""),
          format: "hymd-markdown",
          body: source.body
        });
        if (!opened || !opened.ok) return refuse(opened && opened.message);
        loaded = await sdkMod.loadTextEditor();
        editor = await loaded.mountTextEditor({
          sessionId: opened.session.sessionId,
          root: spec.root
        });
        snap = await sdk.export(opened.session.sessionId);
        if (!snap || !snap.ok || !snap.presentation ||
            canonicalBody(editor.getMarkdown()) !== canonicalBody(source.body)) {
          throw new Error(REFUSE);
        }
      } catch (err) {
        if (editor && editor.destroy) {
          try { await editor.destroy(); } catch (_e) {}
        }
        if (sdk && opened && opened.ok) {
          try { await sdk.closeSession(opened.session.sessionId); } catch (_e) {}
        }
        return refuse(err && err.message ? err.message : REFUSE);
      }
      state = {
        sdk: sdk,
        editor: editor,
        root: spec.root,
        sdkMod: sdkMod,
        documentId: spec.documentId || "new",
        revision: spec.revision || revisionOf(spec.content || ""),
        sessionId: opened.session.sessionId,
        kind: spec.kind,
        original: spec.content || "",
        openedPresentation: snap.presentation,
        baseline: editor.getMarkdown(),
        applied: null,
        closed: false
      };
      return { ok: true, sessionId: state.sessionId, body: source.body };
    }

    async function replaceMarkdown(body) {
      if (!state || state.closed || state.committing || state.applied) return refuse(REFUSE);
      var current = state;
      if (String(body) === current.editor.getMarkdown()) return {ok:true};
      var next, editor, node;
      try {
        var snapshot = await current.sdk.export(current.sessionId);
        if (!snapshot || !snapshot.ok || !snapshot.presentation) return refuse(REFUSE);
        var p = snapshot.presentation;
        next = await current.sdk.openSession({apiVersion:1,requestId:"tw-source-"+(++seq),
          documentId:current.documentId,revision:current.revision,format:"hymd-markdown",
          body:String(body),fontId:p.fontId,lineHeight:p.lineHeight});
        if (!next || !next.ok) return refuse(REFUSE);
        // Keep the previous rich editor mounted until the new Markdown has parsed successfully.
        node = document.createElement("div");
        current.root.appendChild(node);
        var loaded = await current.sdkMod.loadTextEditor();
        editor = await loaded.mountTextEditor({sessionId:next.session.sessionId,root:node});
        if (state !== current || current.closed || canonicalBody(editor.getMarkdown()) !== canonicalBody(body)) throw new Error(REFUSE);
        var old = current.editor, oldId = current.sessionId;
        current.editor=editor; current.sessionId=next.session.sessionId;
        current.rebased=true;
        try { await old.destroy(); } catch (_e) {}
        try { await current.sdk.closeSession(oldId); } catch (_e) {}
        // The new SDK shell is inside node; retain it, and remove empty containers from earlier switches.
        Array.from(current.root.children).forEach(function(child){if(child!==node && !child.childElementCount)child.remove();});
        return {ok:true};
      } catch(err) {
        if(editor)try{await editor.destroy();}catch(_e){}
        if(node)node.remove();
        if(next&&next.ok)try{await current.sdk.closeSession(next.session.sessionId);}catch(_e){}
        return refuse(err && err.message);
      }
    }

    async function commit(override) {
      if (!state || state.closed || !state.editor) return refuse(REFUSE);
      if (state.applied) return state.applied;
      if (state.committing) return state.committing;
      state.committing = commitOnce(override);
      try { return await state.committing; }
      finally { if (state) state.committing = null; }
    }

    async function commitOnce(override) {
      if (!state || state.closed || !state.editor) return refuse(REFUSE);
      var markdown = typeof override === "string" ? override : state.editor.getMarkdown();
      var snap = await state.sdk.export(state.sessionId);
      if (!snap || !snap.ok || !snap.presentation) return refuse(REFUSE);
      var presentation = snap.presentation;
      if (markdown === state.baseline && samePresentation(state.openedPresentation, presentation)) {
        return { ok: true, changed: false, content: state.original, kind: state.kind };
      }
      var bridge = await loadSource();
      var checked = bridge.hymdMarkdownToContent({
        kind: state.kind,
        markdown: markdown,
        original: state.original,
        presentation: presentation,
        openedPresentation: state.openedPresentation
      });
      if (!checked.ok) return refuse(checked.message);
      // A successful encoder alone does not prove that Markdown structures survive.
      // Refuse rather than flatten headings, tables, links, etc. into ordinary CAD text.
      var roundtrip = bridge.sourceToHymdMarkdown({ kind: state.kind, content: checked.content });
      if (!roundtrip.ok || canonicalBody(roundtrip.body) !== canonicalBody(markdown)) return refuse(REFUSE);
      if (!checked.changed) {
        return {
          ok: true,
          changed: false,
          markdown: markdown,
          presentation: presentation,
          openedPresentation: state.openedPresentation,
          content: state.original,
          kind: state.kind
        };
      }
      var result = await state.sdk.apply(state.sessionId, { body: markdown });
      if (!result || !result.ok) return refuse(result && result.message);
      if (!result.changed || !result.commit) {
        // A source-to-rich remount adopts a fresh SDK baseline. CAD still compares against the original entity.
        if (state.rebased && !result.changed) return {ok:true,changed:checked.changed,content:checked.content,kind:state.kind};
        return refuse(REFUSE);
      }
      var again = bridge.hymdMarkdownToContent({
        kind: state.kind,
        markdown: result.commit.body,
        original: state.original,
        presentation: result.commit.presentation,
        openedPresentation: state.openedPresentation
      });
      if (!again.ok || again.content !== checked.content) {
        state.applied = refuse(again.message);
        return state.applied;
      }
      state.applied = {
        ok: true,
        changed: !!again.changed,
        markdown: result.commit.body,
        presentation: result.commit.presentation,
        openedPresentation: state.openedPresentation,
        content: again.content,
        kind: state.kind,
        commitId: result.commit.commitId
      };
      return state.applied;
    }

    async function discard() {
      var current = state;
      state = null;
      if (!current || current.closed) return { ok: true, wrote: false };
      current.closed = true;
      try { if (current.editor && current.editor.destroy) await current.editor.destroy(); } catch (_e) {}
      try { await current.sdk.closeSession(current.sessionId); } catch (_e2) {}
      return { ok: true, wrote: false };
    }

    async function act(name) {
      if (!state || !state.editor) return false;
      var command = RIBBON[name];
      if (!command || typeof state.editor.run !== "function") return false;
      await state.editor.run(command);
      return true;
    }

    async function isDirty(override) {
      if (!state || state.closed || !state.editor) return false;
      var current = state;
      var snap = await current.sdk.export(current.sessionId);
      return (typeof override === "string" ? override : current.editor.getMarkdown()) !== current.baseline ||
        !snap || !snap.ok || !samePresentation(current.openedPresentation, snap.presentation);
    }

    function getMarkdown() {
      return state && !state.closed && state.editor ? state.editor.getMarkdown() : "";
    }

    return { open: open, commit: commit, discard: discard, act: act, isDirty: isDirty, getMarkdown: getMarkdown, replaceMarkdown: replaceMarkdown };
  }

  global.Hy3dTextSdkHost = { create: create };
})(typeof globalThis !== "undefined" ? globalThis : this);
