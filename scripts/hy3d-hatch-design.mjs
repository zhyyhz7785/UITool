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
      Object.keys(designLabels).forEach(function (key) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = designLabels[key];
        b.dataset.category = key;
        b.setAttribute("aria-pressed", String(key === designCategory));
        b.addEventListener("click", function () {
          designCategory = key;
          Array.from(row.children).forEach(function (x) {
            x.setAttribute("aria-pressed", String(x.dataset.category === key));
          });
          renderThumbs();
        });
        row.appendChild(b);
      });
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
        empty.textContent = "没有匹配图案，请切换分类或清空搜索。";
        els.thumbs.appendChild(empty);
      }
      matches.forEach(function (name) {`);
 once(`      if (!els || !els.gradThumbs) return;`, `      if (!els || !els.gradThumbs || !state || !state.form) return;`);
 once(`        b.innerHTML = islandThumb(id);`, `        b.innerHTML = islandThumb(id) + '<span>' + lab + '</span>';`);
 once(`          '<label class="hwb-search">搜索 <input type="text" id="he-pat-search" /></label>' +`, `          '<div id="he-category" class="he-category" role="group" aria-label="图案分类"></div>' +
          '<label class="hwb-search"><span>搜索</span><input type="search" id="he-pat-search" placeholder="图案名称" /></label>' +
          '<p class="he-offline-note">设计预览 · 图案来自 HY3D 内置定义快照</p>' +`);
 once(`          '<div class="he-thumbs he-grad-thumbs" id="he-grad-thumbs"></div>' +`, `          '<p class="he-offline-note">设计预览 · 渐变样式示意，实际颜色由内核生成</p>' +
          '<div class="he-thumbs he-grad-thumbs" id="he-grad-thumbs"></div>' +`);
 once(`        '<aside class="he-side"><dl class="he-kv" id="he-summary"></dl></aside>' +`, `        '<details class="he-side"><summary>当前填充参数</summary><dl class="he-kv" id="he-summary"></dl></details>' +`);
 once(`      if (els.patSearch) els.patSearch.addEventListener("input", function () { renderThumbs(); });`, `      designCategory = "common";
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
