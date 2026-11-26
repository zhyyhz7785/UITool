/* Only the dedicated UITool preview: visibility preferences, never change CAD state. */
(function () {
  "use strict";
  var root = document.documentElement;
  var q = new URLSearchParams(location.search);
  if (location.hostname !== "127.0.0.1" || location.port !== "1450" ||
      q.get("uitool") !== "1" || q.get("style") !== "layer" || root.dataset.uitoolStatusDesign !== "1") return;
  var bar = document.getElementById("statusbar");
  var toggles = document.getElementById("sb-toggles");
  if (!bar || !toggles || !window.Registry) return;
  var KEY = "uitool.hy3d.status.visible.v1";
  var prefs = {};
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "{}"); if (saved && typeof saved === "object" && !Array.isArray(saved)) prefs = saved; } catch (_) {}
  var staticItems = [
    ["status-coords","坐标",true],
    ["sb-scale","注释比例",true],
    ["sb-layout","皮肤与配色",false],
    ["sb-settings","设置",true],
    ["sb-bell","通知中心",true]
  ];
  var extras = [
    ["cad.select.cycle","选择循环",true],
    ["cad.qselect","快速选择",true],
    ["cad.units","单位",false],
    ["cad.isolate","隔离对象",false],
    ["cad.unisolate","结束对象隔离",false],
    ["cad.regen","重生成",false],
    ["ui.fullscreen","全屏显示",true]
  ];
  var extra = document.createElement("div");
  extra.id = "uitool-status-extra"; extra.setAttribute("role","toolbar"); extra.setAttribute("aria-label","常用工具");
  var more = document.createElement("button");
  more.id = "uitool-status-more"; more.type = "button";
  more.title = "自定义状态栏（仅控制显示）";
  more.setAttribute("aria-label",more.title);
  more.setAttribute("aria-haspopup","menu");
  more.setAttribute("aria-expanded","false");
  more.setAttribute("aria-controls","uitool-status-menu");
  more.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v2H4zM4 11h16v2H4zM4 17h16v2H4z"/></svg>';
  bar.append(extra,more);
  var menu = document.createElement("div");
  menu.id = "uitool-status-menu"; menu.hidden = true; menu.setAttribute("role","menu"); menu.setAttribute("aria-label","自定义状态栏");
  document.body.appendChild(menu);
  function visible(id, defaultOn) { return typeof prefs[id] === "boolean" ? prefs[id] : defaultOn; }
  function apply(node,id,defaultOn) { node.dataset.uitoolStatusHidden = visible(id,defaultOn) ? "0" : "1"; }
  function persist() { try { localStorage.setItem(KEY,JSON.stringify(prefs)); } catch (_) {} }
  function commandButton(cmd,id,label) {
    var b = document.createElement("button"); b.type = "button"; b.title = label; b.setAttribute("aria-label",label); b.dataset.uitoolCmd = id;
    if (cmd.icon && document.getElementById("i-"+cmd.icon)) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
      svg.setAttribute("class","ic"); svg.setAttribute("aria-hidden","true");
      var use = document.createElementNS(svg.namespaceURI,"use"); use.setAttribute("href","#i-"+cmd.icon); svg.appendChild(use); b.appendChild(svg);
    } else b.textContent = label;
    b.addEventListener("click",function(e){e.preventDefault(); Registry.run(id);});
    return b;
  }
  function items() {
    var list = [];
    staticItems.forEach(function(a){var n=document.getElementById(a[0]);if(n)list.push({node:n,id:a[0],label:a[1],on:a[2],group:0});});
    toggles.querySelectorAll("[data-sb-toggle]").forEach(function(n) {
      var id=n.dataset.sbToggle, cmd=Registry.get(id);
      // Do not offer placeholder / unimplemented commands as real features.
      if (!cmd || cmd.status!=="done") return;
      list.push({node:n,id:id,label:cmd.label||n.title||id,on:true,group:1});
    });
    extras.forEach(function(a){
      var id=a[0],cmd=Registry.get(id);
      if(!cmd||cmd.status!=="done")return;
      var n=Array.from(extra.children).find(function(b){return b.dataset.uitoolCmd===id;});
      if(!n){n=commandButton(cmd,id,a[1]);extra.appendChild(n);}
      list.push({node:n,id:id,label:a[1],on:a[2],group:2});
    });
    return list;
  }
  function sync() {
    var list=items();
    list.forEach(function(i){apply(i.node,i.id,i.on);});
    return list;
  }
  function close(restore) {
    menu.hidden=true;more.setAttribute("aria-expanded","false");if(restore)more.focus({preventScroll:true});
  }
  function position() {
    var r=more.getBoundingClientRect();
    menu.style.left=Math.max(6,Math.min(r.right-menu.offsetWidth,innerWidth-menu.offsetWidth-6))+"px";
    menu.style.top=Math.max(6,r.top-menu.offsetHeight-4)+"px";
  }
  function rebuild(focusId) {
    var list=sync();menu.replaceChildren();
    [["显示项目",0],["绘图辅助",1],["常用工具",2]].forEach(function(g,index){
      var group=list.filter(function(i){return i.group===g[1];});if(!group.length)return;
      if(index)menu.appendChild(document.createElement("hr"));
      var h=document.createElement("div");h.className="uitool-status-head";h.textContent=g[0];menu.appendChild(h);
      group.forEach(function(i){
        var b=document.createElement("button");b.type="button";b.dataset.pref=i.id;b.setAttribute("role","menuitemcheckbox");b.setAttribute("aria-checked",String(visible(i.id,i.on)));
        var mark=document.createElement("span");mark.className="uitool-status-check";mark.setAttribute("aria-hidden","true");mark.textContent=visible(i.id,i.on)?"✓":"";
        b.append(mark,document.createTextNode(i.label));
        b.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();prefs[i.id]=!visible(i.id,i.on);persist();sync();rebuild(i.id);position();});
        menu.appendChild(b);
      });
    });
    menu.appendChild(document.createElement("hr"));
    var reset=document.createElement("button");reset.type="button";reset.textContent="恢复默认显示";reset.dataset.pref="reset";reset.setAttribute("role","menuitem");
    reset.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();prefs={};persist();sync();rebuild("reset");position();});
    menu.appendChild(reset);
    if(focusId){var b=Array.from(menu.querySelectorAll("button")).find(function(n){return n.dataset.pref===focusId;});if(b)b.focus({preventScroll:true});}
  }
  function open() {
    if(!menu.hidden){close(true);return;}
    rebuild();menu.hidden=false;more.setAttribute("aria-expanded","true");position();
    var first=menu.querySelector("button");if(first)first.focus({preventScroll:true});
  }
  more.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();open();});
  more.addEventListener("keydown",function(e){if(e.key==="ArrowUp"){e.preventDefault();e.stopPropagation();open();}});
  document.addEventListener("pointerdown",function(e){if(!menu.hidden&&!menu.contains(e.target)&&!more.contains(e.target))close(false);},true);
  document.addEventListener("keydown",function(e){
    if(menu.hidden)return;
    if(e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();close(true);return;}
    if(!menu.contains(e.target))return;
    if(e.key==="Tab"){close(false);return;}
    var nodes=Array.from(menu.querySelectorAll("button")),i=nodes.indexOf(document.activeElement);
    var n=e.key==="ArrowDown"?(i+1)%nodes.length:e.key==="ArrowUp"?(i+nodes.length-1)%nodes.length:e.key==="Home"?0:e.key==="End"?nodes.length-1:-1;
    if(n>=0){e.preventDefault();e.stopImmediatePropagation();nodes[n].focus({preventScroll:true});}
    else if(e.key==="Enter"||e.key===" "){e.stopImmediatePropagation();}
  },true);
  // Registry.load() builds controls asynchronously; skin rebuilds replace native buttons.
  new MutationObserver(function(){sync();if(!menu.hidden){rebuild();position();}}).observe(toggles,{childList:true});
  document.addEventListener("hy-skin-applied",function(){sync();close(false);});
  window.addEventListener("resize",function(){close(false);});
  sync();
})();
