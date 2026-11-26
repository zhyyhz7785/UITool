// In-memory only. Do not impersonate a native CAD host or mutate product data.
(function () {
  "use strict";
  var query = new URLSearchParams(location.search);
  if (location.hostname !== "127.0.0.1" || location.port !== "1450" ||
      query.get("uitool") !== "1" || query.get("style") !== "layer" ||
      (window.Host && window.Host.hasTauri && window.Host.hasTauri())) return;
  var rows = [
    { name:"0", color:7, off:false, frozen:false, locked:false },
    { name:"000-C-TEXT-图名", color:7, off:false, frozen:false, locked:false },
    { name:"结构-轴线", color:4, off:false, frozen:false, locked:true },
    { name:"结构-墙体", color:3, off:false, frozen:false, locked:false },
    { name:"参考-底图", color:8, off:true, frozen:false, locked:false },
    { name:"辅助-定位", color:2, off:false, frozen:true, locked:false }
  ];
  var current = "000-C-TEXT-图名";
  var listeners = new Set();
  function attach(select, update) {
    function render() {
      select.textContent = "";
      rows.forEach(function (row) {
        var option = document.createElement("option");
        option.value = row.name;
        option.textContent = row.name;
        option.selected = row.name === current;
        select.appendChild(option);
      });
      select.disabled = false;
      update(rows.find(function (row) { return row.name === current; }) || null);
      select.title = "UITool 模拟图层：仅用于设计预览";
    }
    function change() { current = select.value; listeners.forEach(function (render) { render(); }); }
    listeners.add(render);
    select.addEventListener("change", change);
    render();
    return function () { listeners.delete(render); select.removeEventListener("change", change); };
  }
  window.UIToolLayerScene = { attach: attach };
})();
