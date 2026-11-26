// Candidate-only adapter. Keep native command state, prompt input, history,
// open/close, resize binding and host events. Fail closed on source drift.
export function commandRowsSource(source) {
  function replace(a,b) {
    if(source.split(a).length!==2) throw Error("命令栏行高适配点不匹配："+a);
    source=source.replace(a,()=>b);
  }
  replace('var LS_KEY = "hy3d.ui.cmdbarH";','var LS_KEY = "uitool.hy3d.cmdbarRows.v1";');
  replace('var MIN_LINES = 1;','var MIN_LINES = 1;\n  var MAX_LINES = 6;');
  replace('var max = isFinite(w) && w > 0 ? Math.max(min, Math.floor(w / 2)) : Infinity;',
    'var count = isFinite(w) && w > 0 ? Math.max(1, Math.min(MAX_LINES, Math.floor(w / (2 * lh)))) : MAX_LINES;\n    var max = Math.round(lh * count);');
  replace('return Math.round(Math.max(lim.min, Math.min(lim.max, h)));',
    'return Math.round(Math.max(lim.min, Math.min(lim.max, Math.round(h / lineH(cmdLineH)) * lineH(cmdLineH))));');
  replace('var stored = load(storage);','var stored = load(storage);\n    if (stored !== null && (stored < MIN_LINES || stored > MAX_LINES)) stored = null;');
  replace('apply(displayHeight(stored, getLineH(), winH()));','apply(displayHeight(stored === null ? null : stored * getLineH(), getLineH(), winH()));');
  replace('var saved = save(storage, h);','var count = Math.max(MIN_LINES, Math.min(MAX_LINES, Math.round(h / getLineH())));\n      var saved = save(storage, count);');
  replace('stored = saved === null ? stored : saved;', 'stored = saved === null ? count : saved;');
  replace('grip.setAttribute("aria-valuenow", String(h));',
    'grip.setAttribute("aria-valuenow", String(Math.round(h / getLineH())));\n        grip.setAttribute("aria-valuetext", Math.round(h / getLineH()) + " 行");');
  replace('grip.setAttribute("aria-valuemin", String(lim.min));','grip.setAttribute("aria-valuemin", "1");');
  replace('grip.setAttribute("aria-valuemax", String(isFinite(lim.max) ? lim.max : h));','grip.setAttribute("aria-valuemax", String(Math.round(lim.max / getLineH())));');
  replace('if (moved) commit(shown);','if (moved && shown !== startH) commit(shown);');
  replace('shown: function () { return shown; },','shown: function () { return shown; },\n      rows: function () { return Math.round(shown / getLineH()); },\n      maxRows: function () { return Math.round(limits(getLineH(), winH()).max / getLineH()); },\n      setRows: function (count) {\n        if (!Number.isInteger(count) || count < MIN_LINES || count > MAX_LINES) return shown;\n        var next = clamp(count * getLineH(), getLineH(), winH());\n        apply(next); commit(next); return shown;\n      },');
  replace('refreshDisplay: refreshDisplay,','refreshDisplay: refreshDisplay,\n    rows: function () { return active ? active.rows() : DEFAULT_LINES; },\n    maxRows: function () { return active ? active.maxRows() : MAX_LINES; },\n    setRows: function (count) { return active ? active.setRows(count) : null; },');
  return source + "\n" + "(" + installCommandMenu.toString() + ")();\n";
}
function installCommandMenu() {
  "use strict";
  function init() {
    if(document.documentElement.dataset.uitoolThemeDesign!=="1") return;
    const bar=document.getElementById("cmdbar"), row=bar?.querySelector(".cmd-prompt-row");
    if(!row || !window.CmdbarResize || document.getElementById("uitool-cmd-more")) return;
    // Keep the native dock button and handler, move its face into the input row
    // so it cannot cover output when the height is one line.
    const undock=document.getElementById("cmdbar-undock");
    if(undock) row.append(undock);
    const more=document.createElement("button");
    more.id="uitool-cmd-more"; more.type="button";
    more.title="命令栏常用设置";
    more.setAttribute("aria-label",more.title);
    more.setAttribute("aria-expanded","false");
    more.setAttribute("aria-controls","uitool-cmd-menu");
    more.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 14 5-5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    row.append(more);
    const menu=document.createElement("div");
    menu.id="uitool-cmd-menu"; menu.hidden=true;
    menu.setAttribute("role","group"); menu.setAttribute("aria-label","命令栏常用设置");
    document.body.append(menu);
    function close(focus) {
      menu.hidden=true; more.setAttribute("aria-expanded","false");
      if(focus && more.isConnected) more.focus({preventScroll:true});
    }
    function position() {
      const r=more.getBoundingClientRect();
      menu.style.left=Math.max(6,Math.min(r.right-menu.offsetWidth,innerWidth-menu.offsetWidth-6))+"px";
      menu.style.top=Math.max(6,Math.min(r.top-menu.offsetHeight-4,innerHeight-menu.offsetHeight-6))+"px";
    }
    function button(parent,label,action,pressed) {
      const b=document.createElement("button"); b.type="button"; b.textContent=label;
      if(typeof pressed==="boolean") b.setAttribute("aria-pressed",String(pressed));
      b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();action();});
      parent.append(b); return b;
    }
    function build() {
      menu.replaceChildren();
      const caption=document.createElement("div");caption.className="uitool-cmd-caption";caption.textContent="命令行高度（行）";menu.append(caption);
      const rows=document.createElement("div");rows.className="uitool-cmd-rows";menu.append(rows);
      for(let n=1;n<=6;n++) {
        const b=button(rows,String(n),()=>{close(false);CmdbarResize.setRows(n);more.focus({preventScroll:true});},CmdbarResize.rows()===n);
        b.setAttribute("aria-label",n+" 行"); b.disabled=n>CmdbarResize.maxRows();
      }
      if(window.hy3dUi?.openCmdHist) button(menu,"命令历史 (F2)",()=>{close(false);hy3dUi.openCmdHist();});
      const ime=document.getElementById("cmdbar-ime-lock");
      if(ime) button(menu,"英文输入提示",()=>{ime.click();build();position();menu.querySelector('button[data-setting="ime"]')?.focus();},ime.getAttribute("aria-pressed")==="true").dataset.setting="ime";
      const memo=window.hy3dMemoHint;
      if(memo?.isEnabled && memo?.setEnabled) button(menu,"记忆淡提示",()=>{memo.setEnabled(!memo.isEnabled());build();position();menu.querySelector('button[data-setting="memo"]')?.focus();},!!memo.isEnabled()).dataset.setting="memo";
      const dock=document.getElementById("cmdbar-dock");
      if(dock && undock) button(menu,bar.classList.contains("floating")?"停靠命令栏":"浮动命令栏",()=>{const target=bar.classList.contains("floating")?dock:undock;close(false);target.click();});
      const settings=document.getElementById("sb-settings");
      if(settings) button(menu,"更多设置…",()=>{close(false);settings.click();});
    }
    function open() {
      if(!menu.hidden){close(true);return;}
      build();menu.hidden=false;more.setAttribute("aria-expanded","true");position();
      menu.querySelector('button[aria-pressed="true"]:not(:disabled)')?.focus({preventScroll:true});
    }
    more.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();open();});
    more.addEventListener("keydown",e=>{if(e.key==="ArrowUp"){e.preventDefault();e.stopPropagation();open();}});
    document.addEventListener("pointerdown",e=>{if(!menu.hidden&&!menu.contains(e.target)&&!more.contains(e.target))close(false);},true);
    // Intercept menu activation keys before the global CAD keyboard router.
    document.addEventListener("keydown",e=>{
      if(menu.hidden || (!menu.contains(e.target)&&e.target!==more))return;
      if(e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();close(true);return;}
      if(e.key==="Enter"||e.key===" "){e.stopImmediatePropagation();return;}
      const nodes=Array.from(menu.querySelectorAll("button:not(:disabled)"));
      let i=nodes.indexOf(document.activeElement);
      if(["ArrowUp","ArrowLeft","ArrowDown","ArrowRight","Home","End"].includes(e.key)){
        e.preventDefault();e.stopImmediatePropagation();
        let next=e.key==="Home"?0:e.key==="End"?nodes.length-1:(i+(e.key==="ArrowUp"||e.key==="ArrowLeft"?nodes.length-1:1))%nodes.length;
        nodes[next]?.focus({preventScroll:true});
      }
    },true);
    menu.addEventListener("focusout",e=>{if(e.relatedTarget&&!menu.contains(e.relatedTarget)&&e.relatedTarget!==more)close(false);});
    window.addEventListener("resize",()=>close(false));
    document.addEventListener("hy-skin-applied",()=>close(false));
    new MutationObserver(()=>{if(!bar.classList.contains("open"))close(false);}).observe(bar,{attributes:true,attributeFilter:["class"]});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
}
