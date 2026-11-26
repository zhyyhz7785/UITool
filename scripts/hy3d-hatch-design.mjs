/* UITool Ribbon candidate only. Adapt native workbench without changing CAD commands. */
export function hatchDesignSource(source, fixture) {
 function once(old,next){if(source.split(old).length!==2)throw Error("HATCH 适配点不匹配："+old.slice(0,100));source=source.replace(old,()=>next);}
 once("    var swatchBook = null;", `    var swatchBook = null;
    var designCategory = "common";
    var designGroups = {
      common: ["SOLID","ANSI31","ANSI32","ANSI37","AR-CONC","EARTH","BRICK","STEEL","NET","AR-SAND","GRAVEL","DOTS"],
      structure: ["SOLID","ANSI31","ANSI32","ANSI33","ANSI34","ANSI35","ANSI37","ANSI38","AR-CONC","STEEL","BRICK","AR-B88","AR-BRSTD","SACNCR"],
      architecture: ["SOLID","BRICK","AR-B88","AR-BRELM","AR-BRSTD","AR-CONC","AR-HBONE","AR-PARQ1","AR-RROOF","AR-RSHKE","AR-SAND","BRSTONE","INSUL","CORK","GRASS","PLAST","PLASTI"],
      drainage: ["SOLID","ANSI31","AR-CONC","AR-SAND","EARTH","GRAVEL","CLAY","MUDST","SWAMP","GRATE","BRICK"],
      electrical: ["SOLID","ANSI31","ANSI37","CROSS","NET","SQUARE","STEEL","BRASS","INSUL","DOTS","GRATE"],
      all: null
    };
    var designLabels = {common:"常用",structure:"结构",architecture:"建筑",drainage:"排水",electrical:"电气",all:"全部"};
    var designFixture = ${fixture};
    var designStorageKey = "uitool.hy3d.hatch.categories.v1";
    var designMenu = null, designMenuCleanup = null;
    function designRead() {
      try {
        var raw = localStorage.getItem(designStorageKey);
        if (!raw) return;
        var data = JSON.parse(raw);
        if (!Array.isArray(data) || data.length > 200) return;
        var groups = Object.create(null), labels = Object.create(null), names = new Set();
        for (var item of data) {
          if (!item || typeof item.id !== "string" || !/^[a-z][a-z0-9-]{0,79}$/.test(item.id) ||
              item.id === "all" || Object.prototype.hasOwnProperty.call(groups,item.id) ||
              typeof item.label !== "string" || !item.label.trim() || item.label !== item.label.trim() ||
              item.label.length > 32 || item.label === "全部" || names.has(item.label.toLowerCase()) ||
              !Array.isArray(item.patterns) || item.patterns.some(function(n){return typeof n !== "string";})) return;
          groups[item.id] = Array.from(new Set(item.patterns));
          labels[item.id] = item.label; names.add(item.label.toLowerCase());
        }
        groups.all = null; labels.all = "全部";
        designGroups = groups; designLabels = labels;
      } catch (_) {}
    }
    function designSave() {
      try {
        localStorage.setItem(designStorageKey, JSON.stringify(Object.keys(designLabels).filter(function(k){return k !== "all";}).map(function(k){
          return {id:k,label:designLabels[k],patterns:designGroups[k]};
        })));
      } catch (_) { setBanner("分类已更新，但本机配置保存失败；关闭后可能丢失。"); }
    }
    designRead();
    function designAllNames() {
      return (global.hy3dHatchCatalog && hy3dHatchCatalog.patterns && hy3dHatchCatalog.patterns.length)
        ? hy3dHatchCatalog.patterns : HATCH_PATTERNS;
    }
    function designCloseMenu(restore) {
      var focus = designMenu && designMenu._returnFocus;
      if (designMenuCleanup) designMenuCleanup();
      designMenuCleanup = null;
      if (designMenu) designMenu.remove();
      designMenu = null;
      if (restore && focus && focus.isConnected) focus.focus();
      else if (restore && dlg) { var manage=dlg.querySelector("#he-category-manage"); if(manage) manage.focus(); }
    }
    function designOpenMenu(anchor, event, build) {
      designCloseMenu(false);
      var menu = document.createElement("div");
      menu.className = "he-category-menu";
      menu.setAttribute("role","group");
      menu.setAttribute("aria-label","图案分类操作");
      menu._returnFocus = anchor;
      dlg.appendChild(menu);
      designMenu = menu;
      var rect = anchor.getBoundingClientRect();
      var x = event && event.type === "contextmenu" && (event.clientX || event.clientY) ? event.clientX : rect.left;
      var y = event && event.type === "contextmenu" && (event.clientX || event.clientY) ? event.clientY : rect.bottom;
      function place() {
        menu.style.left = Math.max(4,Math.min(x,window.innerWidth-menu.offsetWidth-4))+"px";
        menu.style.top = Math.max(4,Math.min(y,window.innerHeight-menu.offsetHeight-4))+"px";
      }
      function outside(e) { if (!menu.contains(e.target)) designCloseMenu(false); }
      function keyboard(e) {
        if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); designCloseMenu(true); }
      }
      function resize() { designCloseMenu(false); }
      document.addEventListener("pointerdown",outside,true);
      window.addEventListener("keydown",keyboard,true);
      window.addEventListener("resize",resize);
      designMenuCleanup = function(){
        document.removeEventListener("pointerdown",outside,true);
        window.removeEventListener("keydown",keyboard,true);
        window.removeEventListener("resize",resize);
      };
      build(menu);
      place();
      var first = menu.querySelector("input:not([type=checkbox]),button:not(:disabled)");
      if(first) first.focus();
      return menu;
    }
    function designEl(parent,tag,text,cls) {
      var el = document.createElement(tag);
      if (text != null) el.textContent = text;
      if (cls) el.className = cls;
      parent.appendChild(el); return el;
    }
    function designAction(menu,label,fn,disabled) {
      var b = designEl(menu,"button",label,"he-category-action");
      b.type="button"; b.disabled=!!disabled;
      b.addEventListener("click",fn); return b;
    }
    function designRefresh() {
      designSave();
      designCloseMenu(false);
      designCategories();
      renderThumbs();
      var active=dlg.querySelector('#he-category [aria-pressed="true"]');
      if(active) active.focus();
    }
    function designNameEditor(anchor,key,pattern) {
      designOpenMenu(anchor,null,function(menu){
        designEl(menu,"strong",key ? "重命名分类" : "新建分类");
        var input = designEl(menu,"input");
        input.type="text"; input.maxLength=32; input.placeholder="分类名称";
        input.setAttribute("aria-label","分类名称"); input.value=key ? designLabels[key] : "";
        var error = designEl(menu,"div","","he-category-error"); error.setAttribute("role","status");
        function submit(){
          var name=input.value.trim();
          if (!name || name === "全部" || Object.keys(designLabels).some(function(k){return k!==key && designLabels[k].toLowerCase()===name.toLowerCase();})){
            error.textContent="名称不能为空、重复或为“全部”。"; return;
          }
          if (!key && Object.keys(designLabels).length >= 201) {error.textContent="分类数量已达上限。";return;}
          if (key) designLabels[key]=name;
          else {
            var id="user-"+Date.now().toString(36), i=0;
            while(Object.prototype.hasOwnProperty.call(designLabels,id)) id="user-"+Date.now().toString(36)+"-"+(++i);
            delete designLabels.all; delete designGroups.all;
            designLabels[id]=name; designGroups[id]=pattern ? [pattern] : [];
            designLabels.all="全部"; designGroups.all=null; designCategory=id;
          }
          designRefresh();
        }
        input.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();e.stopPropagation();submit();}});
        designAction(menu,"确定",submit);
        designAction(menu,"取消",function(){designCloseMenu(true);});
      });
    }
    function designPicker(anchor,key) {
      designOpenMenu(anchor,null,function(menu){
        designEl(menu,"strong","添加图案 · "+designLabels[key]);
        var search=designEl(menu,"input"); search.type="search"; search.placeholder="搜索图案"; search.setAttribute("aria-label","搜索待添加图案");
        var selected=new Set(), list=designEl(menu,"div",null,"he-category-picker");
        var add=designAction(menu,"添加（0）",function(){
          selected.forEach(function(n){if(designGroups[key].indexOf(n)<0)designGroups[key].push(n);});
          designRefresh();
        },true);
        function refresh(){
          list.replaceChildren();
          var q=search.value.trim().toUpperCase();
          var names=Array.from(new Set(designAllNames())).filter(function(n){return designGroups[key].indexOf(n)<0 && n.toUpperCase().indexOf(q)>=0;});
          if(!names.length) designEl(list,"div","没有可添加的图案","he-category-empty");
          names.forEach(function(n){
            var label=designEl(list,"label"), box=designEl(label,"input");
            box.type="checkbox";box.checked=selected.has(n);
            designEl(label,"span",n);
            box.addEventListener("change",function(){
              if(box.checked)selected.add(n);else selected.delete(n);
              add.textContent="添加（"+selected.size+"）";add.disabled=!selected.size;
            });
          });
        }
        search.addEventListener("input",refresh);refresh();
        designAction(menu,"取消",function(){designCloseMenu(true);});
      });
    }
    function designCategoryMenu(anchor,event,key) {
      designOpenMenu(anchor,event,function(menu){
        designEl(menu,"strong",key ? designLabels[key] : "分类管理");
        designAction(menu,"新建分类…",function(){designNameEditor(anchor,null);});
        if(key && key!=="all"){
          designAction(menu,"添加图案…",function(){designPicker(anchor,key);});
          designAction(menu,"重命名…",function(){designNameEditor(anchor,key);});
          var keys=Object.keys(designLabels).filter(function(k){return k!=="all";});
          var index=keys.indexOf(key);
          function move(delta){
            var other=index+delta, labels=Object.create(null), groups=Object.create(null);
            keys[index]=keys[other]; keys[other]=key;
            keys.concat("all").forEach(function(k){labels[k]=designLabels[k];groups[k]=designGroups[k];});
            designLabels=labels;designGroups=groups;designRefresh();
          }
          designAction(menu,"左移分类",function(){move(-1);},index===0);
          designAction(menu,"右移分类",function(){move(1);},index===keys.length-1);
          designAction(menu,"删除分类…",function(){
            designOpenMenu(anchor,null,function(confirm){
              designEl(confirm,"strong","删除「"+designLabels[key]+"」？");
              designEl(confirm,"div","仅删除分类，不删除原始图案。","he-category-empty");
              designAction(confirm,"删除分类",function(){
                delete designGroups[key];delete designLabels[key];
                if(designCategory===key)designCategory="all";
                designRefresh();
              });
              designAction(confirm,"取消",function(){designCloseMenu(true);});
            });
          });
        } else if(!key) {
          Object.keys(designLabels).filter(function(k){return k!=="all";}).forEach(function(k){
            designAction(menu,designLabels[k]+" ›",function(){designCategoryMenu(anchor,null,k);});
          });
        }
      });
    }
    function designPatternMenu(anchor,event,name) {
      designOpenMenu(anchor,event,function(menu){
        designEl(menu,"strong",name);
        var removeCurrent=null;
        if(designCategory!=="all" && designGroups[designCategory].indexOf(name)>=0){
          removeCurrent=designAction(menu,"从「"+designLabels[designCategory]+"」移除",function(){
            designGroups[designCategory]=designGroups[designCategory].filter(function(n){return n!==name;});
            designRefresh();
          });
        }
        designEl(menu,"div","添加到 / 移出分类","he-category-empty");
        var groupList=designEl(menu,"div",null,"he-category-picker");
        Object.keys(designLabels).filter(function(k){return k!=="all";}).forEach(function(k){
          var row=designEl(groupList,"label"), box=designEl(row,"input");
          box.type="checkbox";box.checked=designGroups[k].indexOf(name)>=0;
          designEl(row,"span",designLabels[k]);
          box.addEventListener("change",function(){
            if(box.checked){if(designGroups[k].indexOf(name)<0)designGroups[k].push(name);}
            else designGroups[k]=designGroups[k].filter(function(n){return n!==name;});
            if(removeCurrent && k===designCategory) removeCurrent.hidden=!box.checked;
            designSave();
            // Keep the menu open for multi-category editing; refresh cards without changing the CAD form.
            renderThumbs();
          });
        });
        designAction(menu,"新建分类并添加…",function(){designNameEditor(anchor.isConnected?anchor:dlg.querySelector("#he-category-manage"),null,name);});
        designAction(menu,"完成",function(){designCloseMenu(true);});
      });
    }
    function designOffline() {
      if (global.Host && typeof Host.hasTauri === "function" && Host.hasTauri()) {
        setBanner("图案缩略图读取失败");
        return null;
      }
      swatchBook = JSON.parse(JSON.stringify(designFixture));
      if (dlg) dlg.dataset.uitoolHatchSamples = "offline";
      renderThumbs();
      renderGradThumbs();
      return swatchBook;
    }
    function designCategories() {
      var row = dlg.querySelector("#he-category");
      if (!row) return;
      row.replaceChildren();
      if (!Object.prototype.hasOwnProperty.call(designLabels,designCategory)) designCategory="all";
      var tabs=designEl(row,"div",null,"he-category-tabs");
      Object.keys(designLabels).forEach(function (key) {
        var b = designEl(tabs,"button",designLabels[key]);
        b.type = "button";
        b.dataset.category = key;
        b.setAttribute("aria-pressed", String(key === designCategory));
        b.title=designLabels[key]+(key==="all"?"":" · 右键管理");
        b.addEventListener("click", function () {
          designCategory = key;
          Array.from(tabs.children).forEach(function (x) {
            x.setAttribute("aria-pressed", String(x.dataset.category === key));
          });
          renderThumbs();
        });
        b.addEventListener("contextmenu",function(e){e.preventDefault();e.stopPropagation();designCategoryMenu(b,e,key);});
      });
      var manage=designEl(row,"button","⋯","he-category-manage");
      manage.id="he-category-manage";manage.type="button";
      manage.title="分类管理";manage.setAttribute("aria-label","分类管理");
      manage.addEventListener("click",function(){designCategoryMenu(manage,null,designCategory);});
      manage.addEventListener("contextmenu",function(e){e.preventDefault();e.stopPropagation();designCategoryMenu(manage,e,null);});
      // Keep the chosen tab visible when categories overflow horizontally.
      var active=tabs.querySelector('[aria-pressed="true"]');
      if(active && active.offsetLeft+active.offsetWidth>tabs.clientWidth) tabs.scrollLeft=active.offsetLeft;
    }`);
 once(`      if (!q) return list.slice();
      return list.filter(function (n) { return String(n).toUpperCase().indexOf(q) >= 0; });`, `      var group = designGroups[designCategory];
      return list.filter(function (n) {
        return (!group || group.indexOf(n) >= 0) && (!q || String(n).toUpperCase().indexOf(q) >= 0);
      });`);
 once(`      if (!els || !els.thumbs) return;
      els.thumbs.innerHTML = "";
      patternNames().forEach(function (name) {`, `      if (!els || !els.thumbs || !state || !state.form) return;
      els.thumbs.innerHTML = "";
      var matches = patternNames();
      if (!matches.length) {
        var empty = document.createElement("p");
        empty.className = "he-empty";
        empty.textContent = designCategory === "all" ? "没有匹配图案，请清空搜索。" : "没有匹配图案，可通过分类菜单添加。";
        els.thumbs.appendChild(empty);
      }
      matches.forEach(function (name) {`);
 once('        b.title = cap("pattern") ? name : pendingLabel("pattern");', `        b.title = (cap("pattern") ? name : pendingLabel("pattern")) + " · 右键管理分类";
        b.addEventListener("contextmenu",function(e){e.preventDefault();e.stopPropagation();designPatternMenu(b,e,name);});`);
 once('    function closeDlg(result) {', '    function closeDlg(result) {\n      designCloseMenu(false);');
 once(`      if (!els || !els.gradThumbs) return;`, `      if (!els || !els.gradThumbs || !state || !state.form) return;`);
 once(`        b.innerHTML = islandThumb(id);`, `        b.innerHTML = islandThumb(id) + '<span>' + lab + '</span>';`);
 once(`          '<label class="hwb-search">搜索 <input type="text" id="he-pat-search" /></label>' +`, `          '<div id="he-category" class="he-category" role="group" aria-label="图案分类"></div>' +
          '<label class="hwb-search"><span>搜索</span><input type="search" id="he-pat-search" placeholder="图案名称" /></label>' +
          '<p class="he-offline-note">设计预览 · 图案来自 HY3D 内置定义快照</p>' +`);
 once(`          '<div class="he-thumbs he-grad-thumbs" id="he-grad-thumbs"></div>' +`, `          '<p class="he-offline-note">设计预览 · 渐变样式示意，实际颜色由内核生成</p>' +
          '<div class="he-thumbs he-grad-thumbs" id="he-grad-thumbs"></div>' +`);
 once(`        '<aside class="he-side"><dl class="he-kv" id="he-summary"></dl></aside>' +`, `        '<details class="he-side"><summary>当前填充参数</summary><dl class="he-kv" id="he-summary"></dl></details>' +`);
 once(`      if (els.patSearch) els.patSearch.addEventListener("input", function () { renderThumbs(); });`, `      if (!Object.prototype.hasOwnProperty.call(designLabels,designCategory)) designCategory = "all";
      designCategories();
      if (els.patSearch) els.patSearch.addEventListener("input", function () { renderThumbs(); });`);
 once(`        if (!book || !book.patterns) {
          setBanner("图案缩略图读取失败");
          return null;
        }
        swatchBook = book;`, `        if (!book || !book.patterns || !book.samples) return designOffline();
        if (dlg) delete dlg.dataset.uitoolHatchSamples;
        swatchBook = book;`);
 once(`      }, function () {
        setBanner("图案缩略图读取失败");
        return null;
      });`, `      }, function () {
        return designOffline();
      });`);
 once(`      if (sample && sample.triangles && sample.triangles.length) return trianglesSvg(sample.triangles);
      return segmentsSvg([], false);`, `      if (sample && sample.triangles && sample.triangles.length) return trianglesSvg(sample.triangles);
      if (dlg && dlg.dataset.uitoolHatchSamples === "offline") {
        var inv = n.indexOf("INV") === 0, kind = n.replace(/^INV/, "");
        var a = inv ? "#dbc65a" : "#477ba9", b = inv ? "#477ba9" : "#dbc65a";
        var css = kind === "LINEAR" ? "linear-gradient(90deg,"+a+","+b+")" :
          kind === "CYLINDER" ? "linear-gradient(90deg,"+a+","+b+" 30%,"+a+")" :
          "radial-gradient("+ (kind === "CURVED" ? "ellipse at 20% 45%" : kind === "HEMISPHERICAL" ? "circle at 100% 50%" : "circle at 20% 50%") +","+b+","+a+")";
        return '<span aria-hidden="true" class="he-grad-art" style="background:'+css+'"></span>';
      }
      return segmentsSvg([], false);`);
 return source;
}
