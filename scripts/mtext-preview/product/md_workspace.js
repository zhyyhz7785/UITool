/* Advanced MTEXT workspace. The SDK owns the actual document; this module owns only layout and source UI. */
(function (global) {
  "use strict";
  var PAPER = { A0:[841,1189], A1:[594,841], A2:[420,594], A3:[297,420], A4:[210,297], A5:[148,210],
    B0:[1000,1414], B1:[707,1000], B2:[500,707], B3:[353,500], B4:[250,353], B5:[176,250] };
  function num(v, fallback) { var n = Number(v); return Number.isFinite(n) ? n : fallback; }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function round(v) { return Math.round(v * 100) / 100; }

  function create(root, spec, notice, onSource, onPanel) {
    var g = spec.geom || {};
    var px = clamp(num(spec.px, 4), .05, 8);
    var initialCount = Number(g.column_type) > 0 ? Math.max(2, num(g.column_count, 2)) : 1;
    var gap = Math.max(0, num(g.column_gutter, 0));
    var total = num(g.width, 0);
    if (!(total > 0) && initialCount > 1 && num(g.column_width, 0) > 0) {
      total = num(g.column_width, 0) * initialCount + (initialCount - 1) * gap;
    }
    var original = { width: Math.max(0, total), height: Math.max(0, num(g.defined_height, 0)),
      count: initialCount, gap: gap, mode: Number(g.column_type) === 2 ? "dynamic" : "static" };
    var cad = Object.assign({}, original);
    var paper = { mode:"flow", size:"A4", orientation:"portrait", width:210, height:297,
      top:15, right:15, bottom:15, left:20, zoom:100, columns:1, gap:6 };
    var cadChanged = false;
    root.innerHTML = '<div class="md-workspace"><div class="md-stage"><div class="md-sdk-slot"></div>' +
      '<textarea class="md-source" aria-label="Markdown 源文" spellcheck="false" hidden></textarea></div>' +
      '<aside class="md-side" aria-label="高级排版设置" hidden><div class="md-side-sash" role="separator" aria-label="调整排版面板宽度" aria-orientation="vertical"></div><div class="md-side-head"><strong>文字排版</strong><button type="button" data-do="close">收起</button></div>' +
      '<div class="md-side-body"><details open><summary>CAD 文字框（写回图纸）</summary>' +
      '<label>宽度<input data-cad="width" type="number" min="0" step="0.1"></label>' +
      '<label>高度<input data-cad="height" type="number" min="0" step="0.1"></label>' +
      '<label>栏数<input data-cad="count" type="number" min="1" max="6" step="1"></label>' +
      '<label>栏间距<input data-cad="gap" type="number" min="0" step="0.1"></label>' +
      '<label>栏类型<select data-cad="mode"><option value="static">静态</option><option value="dynamic">动态</option></select></label>' +
      '<div class="md-column-meter" aria-label="拖动栏间距与总宽"></div><small data-info="cad"></small>' +
      '<button type="button" data-do="reset">恢复原图尺寸</button></details>' +
      '<details><summary>纸张与边距（仅预览）</summary>' +
      '<label>视图<select data-paper="mode"><option value="flow">自由文档</option><option value="paper">纸张预览</option><option value="cad">CAD 尺寸预览</option></select></label>' +
      '<label>纸张<select data-paper="size"></select></label>' +
      '<label>方向<select data-paper="orientation"><option value="portrait">纵向</option><option value="landscape">横向</option></select></label>' +
      '<label>纸宽 mm<input data-paper="width" type="number" min="20" max="5000"></label>' +
      '<label>纸高 mm<input data-paper="height" type="number" min="20" max="5000"></label>' +
      '<label>上边距<input data-paper="top" type="number" min="0"></label>' +
      '<label>右边距<input data-paper="right" type="number" min="0"></label>' +
      '<label>下边距<input data-paper="bottom" type="number" min="0"></label>' +
      '<label>左边距<input data-paper="left" type="number" min="0"></label>' +
      '<label>预览栏数<input data-paper="columns" type="number" min="1" max="6" step="1"></label>' +
      '<label>预览栏距 mm<input data-paper="gap" type="number" min="0" max="100"></label>' +
      '<label>缩放 %<input data-paper="zoom" type="number" min="25" max="200" step="5"></label>' +
      '<small>纸张参数不写进 MTEXT；预览按内容延伸，不是精确分页或 CAD 渲染。</small></details>' +
      '<details><summary>工程模板（Markdown）</summary><button type="button" data-template="kv">键值表</button> ' +
      '<button type="button" data-template="table">工程表格</button> <button type="button" data-template="notes">设计说明</button>' +
      '<small>插入到源文光标；复杂结构保留在 Markdown，不能无损写回时可复制。</small></details></div></aside></div>';
    var stage = root.querySelector(".md-stage"), side = root.querySelector(".md-side");
    var slot = root.querySelector(".md-sdk-slot"), source = root.querySelector(".md-source");
    var meter = root.querySelector(".md-column-meter");
    var size = root.querySelector('[data-paper="size"]');
    Object.keys(PAPER).concat(["custom"]).forEach(function (name) {
      var opt = document.createElement("option"); opt.value=name; opt.textContent=name==="custom"?"自定义":name; size.appendChild(opt);
    });
    function assignPaper() {
      if (paper.size !== "custom") {
        var dims = PAPER[paper.size];
        paper.width = dims[paper.orientation === "portrait" ? 0 : 1];
        paper.height = dims[paper.orientation === "portrait" ? 1 : 0];
      }
      paper.top = clamp(paper.top,0,paper.height-5);
      paper.bottom = clamp(paper.bottom,0,paper.height-paper.top-5);
      paper.left = clamp(paper.left,0,paper.width-5);
      paper.right = clamp(paper.right,0,paper.width-paper.left-5);
      paper.gap = clamp(paper.gap,0,Math.max(0,(paper.width-paper.left-paper.right-paper.columns*1)/Math.max(1,paper.columns-1)));
    }
    function validCad(v) {
      return Number.isFinite(v.width) && v.width >= 0 && Number.isFinite(v.height) && v.height >= 0 &&
        Number.isInteger(v.count) && v.count>=1 && v.count<=6 && Number.isFinite(v.gap) && v.gap>=0 &&
        (v.count===1 || v.width-(v.count-1)*v.gap>=v.count*.1);
    }
    function dirtyCad() { return Object.keys(original).some(function(k){return cad[k]!==original[k];}); }
    function updateCad(key,value) {
      var next=Object.assign({},cad); next[key]=value;
      if (key==="count" && value===1) next.gap=0;
      if (next.count>1 && next.width<=0 && key==="count") { next.width=100; }
      if (!validCad(next)) { notice("文字框尺寸无效：分栏必须保留正栏宽，栏数为 1–6。"); sync(); return; }
      cad=next; cadChanged=dirtyCad(); paper.mode="cad"; sync();
    }
    function patch() {
      if (!cadChanged) return null;
      if (!validCad(cad)) throw new Error("CAD 文字框尺寸无效");
      var multi=cad.count>1, fixed=cad.height>0;
      return { width:cad.width, defined_height:cad.height, column_type:multi?(cad.mode==="dynamic"?2:1):0,
        column_count:multi?cad.count:0, column_width:multi?(cad.width-(cad.count-1)*cad.gap)/cad.count:0,
        column_gutter:multi?cad.gap:0, column_height:multi&&fixed?cad.height:0,
        column_auto:fixed?0:1, column_heights:multi&&fixed&&cad.mode==="static"?Array(cad.count).fill(cad.height):[] };
    }
    function paint() {
      var surf=slot.querySelector(".hymd-sdk-text-surface");
      if (!surf) return;
      var pm=surf.querySelector(".ProseMirror");
      if (!pm) return;
      var mode=paper.mode, isPaper=mode==="paper", isCad=mode==="cad";
      surf.classList.toggle("md-paged",isPaper||isCad);
      surf.style.width=isPaper?paper.width+"mm":isCad&&cad.width>0?Math.max(40,cad.width*px)+"px":"";
      surf.style.minHeight=isPaper?paper.height+"mm":isCad&&cad.height>0?cad.height*px+"px":"";
      surf.style.padding=isPaper?[paper.top,paper.right,paper.bottom,paper.left].map(function(v){return v+"mm";}).join(" "):isCad?"0":"";
      surf.style.zoom=(paper.zoom/100).toString();
      pm.style.columnCount=String(isPaper?paper.columns:isCad?Math.min(6,cad.count):1);
      pm.style.columnGap=isPaper?paper.gap+"mm":isCad?cad.gap*px+"px":"";
      // CSS balancing intentionally remains a visual aid. Never truncate overflowing CAD text.
      pm.style.columnFill="balance";
    }
    function drawMeter() {
      meter.replaceChildren();
      var count=Math.min(6,Math.max(1,cad.count)), width=Math.max(cad.width,1);
      for(var i=0;i<count;i++){
        var cell=document.createElement("span"); cell.className="md-meter-col"; meter.appendChild(cell);
        if(i<count-1){
          var handle=document.createElement("button"); handle.type="button"; handle.className="md-meter-gap";
          handle.title="拖动栏间距"; handle.setAttribute("aria-label","调整栏间距"); handle.style.width=clamp(cad.gap/width*100,3,20)+"%";
          meter.appendChild(handle); bindDrag(handle,"gap");
        }
      }
      var end=document.createElement("button"); end.type="button"; end.className="md-meter-end"; end.title="拖动总宽度"; end.setAttribute("aria-label","调整文字框宽度");
      meter.appendChild(end); bindDrag(end,"width");
    }
    function bindDrag(handle,key) {
      handle.addEventListener("pointerdown",function(ev){
        if(ev.button!==0)return; ev.preventDefault();
        var start=ev.clientX, base=cad[key], perPixel=(cad.width>0?cad.width:100)/Math.max(1,meter.clientWidth), pointer=ev.pointerId;
        // Keep drag listeners on window: the meter is redrawn while the pointer moves.
        function move(evt){if(evt.pointerId!==pointer)return;
          var v=Math.max(key==="width"?.1:0,round(base+(evt.clientX-start)*perPixel));
          if(cad.count>1&&key==="gap")v=Math.min(v,Math.max(0,(cad.width-cad.count*.1)/(cad.count-1)));
          if(cad.count>1&&key==="width")v=Math.max(v,(cad.count-1)*cad.gap+cad.count*.1);
          updateCad(key,v);
        }
        function end(evt){if(evt.pointerId!==pointer)return; cleanup();}
        function cleanup(){global.removeEventListener("pointermove",move,true);global.removeEventListener("pointerup",end,true);global.removeEventListener("pointercancel",end,true);global.removeEventListener("blur",cleanup);dragCleanup=null;}
        if(dragCleanup)dragCleanup(); dragCleanup=cleanup;
        global.addEventListener("pointermove",move,true);global.addEventListener("pointerup",end,true);global.addEventListener("pointercancel",end,true);global.addEventListener("blur",cleanup);
      });
      handle.addEventListener("keydown",function(ev){
        if(ev.key!=="ArrowLeft"&&ev.key!=="ArrowRight")return;
        ev.preventDefault(); updateCad(key,Math.max(0,round(cad[key]+(ev.key==="ArrowLeft"?-.1:.1))));
        var list=meter.querySelectorAll(key==="gap"?".md-meter-gap":".md-meter-end"); if(list[0])list[0].focus();
      });
    }
    var dragCleanup=null, sashCleanup=null;
    var sash=side.querySelector(".md-side-sash");
    sash.addEventListener("pointerdown",function(ev){
      if(ev.button!==0)return; ev.preventDefault();
      if(sashCleanup)sashCleanup();
      var start=ev.clientX, width=side.getBoundingClientRect().width, id=ev.pointerId;
      function move(evt){if(evt.pointerId===id)side.style.width=clamp(width+start-evt.clientX,180,Math.max(180,root.clientWidth-180))+"px";}
      function end(evt){if(evt.pointerId===id)cleanup();}
      function cleanup(){global.removeEventListener("pointermove",move,true);global.removeEventListener("pointerup",end,true);global.removeEventListener("pointercancel",end,true);global.removeEventListener("blur",cleanup);sashCleanup=null;}
      sashCleanup=cleanup;
      global.addEventListener("pointermove",move,true);global.addEventListener("pointerup",end,true);global.addEventListener("pointercancel",end,true);global.addEventListener("blur",cleanup);
    });
    function setPanel(open){side.hidden=!open;if(onPanel)onPanel(open);}
    function sync(){
      root.querySelectorAll("[data-cad]").forEach(function(el){el.value=String(cad[el.dataset.cad]);});
      root.querySelectorAll("[data-paper]").forEach(function(el){el.value=String(paper[el.dataset.paper]);});
      root.querySelector('[data-cad="gap"]').disabled=cad.count<=1;
      root.querySelector('[data-cad="mode"]').disabled=cad.count<=1;
      root.querySelector('[data-info="cad"]').textContent=(cad.count>1?"栏宽 "+round((cad.width-(cad.count-1)*cad.gap)/cad.count)+"；":"")+
        (cad.height===0?"自动高度；":"固定高度；")+(cadChanged?"完成时将更新 CAD 尺寸（重设等宽栏）。":"当前未修改 CAD 尺寸。")+" 单位：图面单位。";
      drawMeter(); paint();
    }
    side.addEventListener("change",function(ev){
      var el=ev.target, key=el.dataset.cad;
      if(key){if(key!=="mode"&&el.value===""){sync();return;} updateCad(key,key==="mode"?el.value:Number(el.value));return;}
      key=el.dataset.paper;if(!key)return;
      if(["mode","size","orientation"].includes(key)){
        if(key==="orientation"&&paper.size==="custom"&&paper.orientation!==el.value){
          var oldWidth=paper.width;paper.width=paper.height;paper.height=oldWidth;
        }
        paper[key]=el.value;
      }
      else {if(el.value===""){sync();return;} paper[key]=clamp(num(el.value,paper[key]),key==="zoom"?25: key==="width"||key==="height"?20:key==="columns"?1:0,key==="zoom"?200:key==="columns"?6:key==="gap"?100:5000);
        if(key==="columns")paper[key]=Math.round(paper[key]);
        if(key==="width"||key==="height")paper.size="custom";
      }
      if(key!=="mode"&&key!=="zoom")paper.mode="paper";
      assignPaper();sync();
    });
    var templates={kv:"\n\n| 项目 | 内容 |\n| --- | --- |\n| 工程名称 |  |\n| 设计阶段 |  |\n",table:"\n\n| 序号 | 名称 | 规格 | 备注 |\n| --- | --- | --- | --- |\n| 1 |  |  |  |\n",notes:"\n\n## 一、设计依据\n\n## 二、工程概况\n\n## 三、设计说明\n"};
    var host=null;
    function sourceOn(){
      if(!source.hidden)return;
      source.value=host.getMarkdown();source.hidden=false;slot.hidden=true;if(onSource)onSource(true);source.focus();
    }
    function setSource(active){
      if(active){sourceOn();return Promise.resolve(true);}
      if(source.hidden)return Promise.resolve(true);
      var text=source.value; source.disabled=true;
      return host.replaceMarkdown(text).then(function(result){
        if(!result.ok){notice("源码不能安全转换为富文本；已保留源码，可以继续编辑或复制。");return false;}
        source.hidden=true;slot.hidden=false;paint();if(onSource)onSource(false);return true;
      }).finally(function(){source.disabled=false;});
    }
    side.addEventListener("click",function(ev){
      var b=ev.target.closest("button");if(!b)return;
      if(b.dataset.do==="close"){setPanel(false);return;}
      if(b.dataset.do==="reset"){cad=Object.assign({},original);cadChanged=false;sync();return;}
      if(b.dataset.template&&host){sourceOn();var at=source.selectionStart, end=source.selectionEnd;source.setRangeText(templates[b.dataset.template],at,end,"end");source.focus();}
    });
    sync();
    return {editorRoot:slot, attach:function(adapter){host=adapter;paint();}, togglePanel:function(){setPanel(side.hidden);},
      toggleSource:function(){return setSource(source.hidden);}, sourceActive:function(){return !source.hidden;},
      body:function(){return source.hidden?undefined:source.value;}, changed:function(){return cadChanged;}, patch:patch,
      destroy:function(){if(dragCleanup)dragCleanup();if(sashCleanup)sashCleanup();}};
  }
  global.Hy3dMarkdownWorkspace={create:create};
})(window);
