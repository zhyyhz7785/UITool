/* Candidate only. Preserve native QAT faces and command dispatch. */
(function () {
  "use strict";
  if (document.documentElement.dataset.uitoolThemeDesign !== "1") return;
  const qat = document.getElementById("qat");
  if (!qat) return;
  const defs = {
    "ui.undo": { label:"撤销", verb:"docUndo", field:"undo", empty:"没有可撤销的操作" },
    "ui.redo": { label:"重做", verb:"docRedo", field:"redo", empty:"没有可重做的操作" }
  };
  const menu=document.createElement("div");
  menu.id="uitool-qat-history"; menu.hidden=true;
  menu.setAttribute("role","menu");
  document.body.append(menu);
  let anchor=null, generation=0, busy=false;
  const app=()=>window.hy3dApp;
  const doc=()=>app()?.docKey?.() ?? null;
  const native=()=>!!window.Host?.hasTauri?.();
  const count=(info,def)=>Number.isSafeInteger(info?.[def.field]) && info[def.field]>=0 ? info[def.field] : null;
  function close(focus=false) {
    generation++;
    const old=anchor;
    menu.hidden=true;anchor=null;
    old?.setAttribute("aria-expanded","false");
    if(focus && old?.isConnected) old.focus({preventScroll:true});
  }
  function position() {
    if(!anchor?.isConnected){close();return;}
    const r=anchor.getBoundingClientRect();
    menu.style.left=Math.max(4,Math.min(r.left,innerWidth-menu.offsetWidth-4))+"px";
    menu.style.top=Math.max(4,Math.min(r.bottom+3,innerHeight-menu.offsetHeight-4))+"px";
  }
  function note(text) {
    const n=document.createElement("div");
    n.className="uitool-qat-note";n.textContent=text;menu.append(n);
  }
  function entry(label,action,disabled=false) {
    const b=document.createElement("button");
    b.type="button";b.setAttribute("role","menuitem");b.textContent=label;b.disabled=disabled;
    b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();action();});
    menu.append(b);return b;
  }
  function status(text){app()?.setStatus?.(text);}
  async function runSteps(id,steps,expectedDoc) {
    const def=defs[id];
    if(busy || app()?.Prompt?.isActive?.()) return;
    close();
    if(steps===1) {
      if(!native() || doc()===expectedDoc) (window.hy3dCommands||window.Registry)?.run(id);
      return;
    }
    if(!native() || !expectedDoc || doc()!==expectedDoc || !app()?.runDocEdit) return;
    busy=true; let done=0;
    try {
      for(let i=0;i<steps;i++){
        if(doc()!==expectedDoc || app()?.Prompt?.isActive?.()) break;
        const before=count(await Host.docInfo(false),def);
        if(before===null || before<=0 || doc()!==expectedDoc) break;
        if(!await app().runDocEdit(def.verb,def.label,def.empty)) break;
        if(doc()!==expectedDoc) break;
        const after=count(await Host.docInfo(false),def);
        if(after===null || after>=before) break;
        done++;
      }
      status(def.label+" "+done+" / "+steps+" 步");
    }catch(e){status(def.label+"中止（已确认 "+done+" 步）："+String(e?.message||e));}
    finally {busy=false;}
  }
  function build(id,available,key,loading=false) {
    const def=defs[id];
    menu.replaceChildren();
    note(def.label+"历史"+(available===null?"":" · "+available+" 步"));
    const blocked=busy || !!app()?.Prompt?.isActive?.();
    entry(def.label+" 1 步",()=>runSteps(id,1,key),blocked||available===0);
    // In a static browser preview the real undo stack is absent. Keep the
    // design visible but never pretend that sample history is executable.
    const max=available===null?6:Math.min(available,12);
    for(let n=2;n<=max;n++)entry(def.label+" "+n+" 步",()=>runSteps(id,n,key),blocked||available===null);
    if(available>12) entry(def.label+" "+Math.min(available,50)+" 步",()=>runSteps(id,Math.min(available,50),key),blocked);
    if(loading)note("正在读取当前图纸…");
    else if(available===null)note(native()?"当前接口未返回历史步数":"设计预览：没有真实图纸历史");
    else if(available===0)note(def.empty);
    else note("选择步数，连续"+def.label+"最近操作");
    position();
  }
  async function open(id,arrow) {
    if(anchor===arrow&&!menu.hidden){close(true);return;}
    close();anchor=arrow;arrow.setAttribute("aria-expanded","true");
    menu.setAttribute("aria-label",defs[id].label+"历史");
    menu.hidden=false;
    const seq=++generation,key=doc();
    build(id,null,key,native());
    let available=null;
    if(native()&&key) {
      try {available=count(await Host.docInfo(false),defs[id]);}catch(_){}
    }
    if(seq!==generation || !anchor?.isConnected) return;
    if(doc()!==key){close();return;}
    build(id,available,key);
    menu.querySelector("button:not(:disabled)")?.focus({preventScroll:true});
  }
  function decorate() {
    if(anchor&&!anchor.isConnected)close();
    for(const id of Object.keys(defs)){
      const face=qat.querySelector('button[data-cmd-id="'+id+'"]');
      if(!face)continue;
      const next=face.nextElementSibling;
      if(next?.dataset.uitoolQatHistory===id)continue;
      const arrow=document.createElement("button");arrow.type="button";
      arrow.className="uitool-qat-arrow";arrow.dataset.uitoolQatHistory=id;
      arrow.title=defs[id].label+"历史（也可右键主按钮）";
      arrow.setAttribute("aria-label",defs[id].label+"历史");
      arrow.setAttribute("aria-haspopup","menu");arrow.setAttribute("aria-expanded","false");
      arrow.setAttribute("aria-controls",menu.id);
      arrow.innerHTML='<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5h6L5 7z" fill="currentColor"/></svg>';
      face.after(arrow);face.classList.add("uitool-qat-face");
      arrow.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();open(id,arrow);});
    }
  }
  function target(e){
    const b=e.target.closest?.("button");
    const id=b?.dataset.uitoolQatHistory||b?.dataset.cmdId;
    if(!defs[id]||!qat.contains(b))return null;
    const arrow=qat.querySelector('button[data-uitool-qat-history="'+id+'"]');
    return arrow?{id,arrow}:null;
  }
  qat.addEventListener("contextmenu",e=>{
    const t=target(e);if(!t)return;
    e.preventDefault();e.stopImmediatePropagation();open(t.id,t.arrow);
  },true);
  qat.addEventListener("keydown",e=>{
    if(e.key!=="ContextMenu"&&!(e.shiftKey&&e.key==="F10")&&e.key!=="ArrowDown")return;
    const t=target(e);if(!t)return;
    e.preventDefault();e.stopImmediatePropagation();open(t.id,t.arrow);
  },true);
  document.addEventListener("pointerdown",e=>{
    if(!menu.hidden&&!menu.contains(e.target)&&!anchor?.contains(e.target))close();
  },true);
  document.addEventListener("keydown",e=>{
    if(menu.hidden)return;
    if(e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();close(true);return;}
    if(!menu.contains(e.target))return;
    if(e.key==="Tab"){close();return;}
    if(e.key==="Enter"||e.key===" "){e.stopImmediatePropagation();return;}
    const nodes=Array.from(menu.querySelectorAll("button:not(:disabled)"));
    if(!nodes.length)return;
    if(["ArrowUp","ArrowDown","Home","End"].includes(e.key)){
      e.preventDefault();e.stopImmediatePropagation();
      const i=nodes.indexOf(document.activeElement);
      const n=e.key==="Home"?0:e.key==="End"?nodes.length-1:(i+(e.key==="ArrowUp"?nodes.length-1:1))%nodes.length;
      nodes[n].focus({preventScroll:true});
    }
  },true);
  window.addEventListener("resize",()=>close());
  document.addEventListener("hy-skin-applied",()=>{close();decorate();});
  new MutationObserver(decorate).observe(qat,{childList:true});
  decorate();
})();
