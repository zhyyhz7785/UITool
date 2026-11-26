// Source adaptation: UITool Ribbon design only. Fail closed on incompatible product mirror.
export function statusDesignSource(source) {
  function replace(s,a,b,label){if(s.split(a).length!==2)throw Error("底栏设计适配点不匹配："+label);return s.replace(a,()=>b);}
  function section(s,start,end,edit){var i=s.indexOf(start),j=s.indexOf(end,i+start.length);if(i<0||j<=i||s.indexOf(start,i+1)>=0)throw Error("底栏设计缺少："+start);return s.slice(0,i)+edit(s.slice(i,j))+s.slice(j);}
  var s=section(source,"  function openLayoutPicker(anchor) {","  function ensurePaperOverview()",function(x){
    x=replace(x,`      addLayoutFromBar();`,`      var add = document.getElementById("sb-layout-add");
      if (add) add.click(); else addLayoutFromBar();`,"新建布局");
    x=replace(x,`run: inDoc(function () { selectDrawingLayout(name); }),`,`run: inDoc(function () {
          selectDrawingLayout(name).then(function (opened) {
            if (opened && window.hy3dLayoutWorkbench) window.hy3dLayoutWorkbench.close();
          });
        }),`,"原生布局选择");
    return replace(x,`    if (window.Registry) items.push({ label: "管理布局…", run: inDoc(function () { Registry.run("cad.layout"); }) });`,`    if (current) items.push({ label: "当前布局设置…", run: inDoc(function () { openLayoutSettings(current, docAt, anchor); }) });
    if (document.getElementById("sb-layout-workbench")) items.push({ label: "布局工作台", run: inDoc(function () {
      var b = document.getElementById("sb-layout-workbench"); if (b) b.click();
    }) });
    if (document.getElementById("sb-paper-btn")) items.push({ label: "纸面浏览", run: inDoc(function () {
      var b = document.getElementById("sb-paper-btn"); if (b) b.click();
    }) });
    if (window.Registry) items.push({ label: "管理布局…", run: inDoc(function () { Registry.run("cad.layout"); }) });`,"次级布局入口");
  });
  s=section(s,"  function paintPaperTabs() {","  function setPaperSpace(name)",function(x){
    return replace(x,`    if (focusTabs) {
      var active = bar.querySelector(".active");`,`    // Keep the native action nodes for the layout picker, but expose a single layout face.
    var oldFace = bar.querySelector("#sb-layout-btn");
    if (oldFace) oldFace.removeAttribute("id");
    Array.prototype.forEach.call(bar.children, function (node) {
      if (node.id !== "sb-model-btn") node.hidden = true;
    });
    var face = document.createElement("button");
    face.type = "button";
    face.id = "sb-layout-btn";
    face.className = "sb-chip uitool-layout-face";
    face.textContent = "布局";
    var layoutOn = overviewActive || inPaper || paperActive !== "模型";
    face.classList.toggle("active", layoutOn);
    face.setAttribute("aria-pressed", String(layoutOn));
    face.setAttribute("aria-haspopup", "menu");
    face.setAttribute("aria-expanded", "false");
    face.setAttribute("aria-controls", "menu-popup");
    var currentLayout = defaultPaperLayout(paperNames);
    face.title = "布局" + (currentLayout ? "：" + currentLayout : "") + "；左键进入，右键更多功能";
    face.addEventListener("click", function (e) {
      e.preventDefault();
      closeMenus();
      selectDrawingLayout().then(function (opened) { if (opened && overview) overview.close(); });
    });
    face.addEventListener("contextmenu", function (e) {
      e.preventDefault(); e.stopPropagation(); openLayoutPicker(face);
    });
    face.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp" || e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
        e.preventDefault(); e.stopPropagation(); openLayoutPicker(face);
      }
    });
    bar.appendChild(face);
    if (focusTabs) {
      var active = bar.querySelector(".active:not([hidden])");`,"单布局按钮");
  });
  s=replace(s,`    if (restoreFocus) document.getElementById("sb-paper-btn").focus({ preventScroll: true });`,`    if (restoreFocus) document.getElementById("sb-layout-btn").focus({ preventScroll: true });`,"纸面关闭焦点");
  return s;
}
