// Preview-only settings source adaptation.
export function settingsDesignSource(source) {
  function replace(s,a,b,label){if(s.split(a).length!==2)throw Error("设置设计适配点不匹配："+label);return s.replace(a,()=>b);}
  var s=replace(source,'  var collapsed = {};',`  var collapsed = { "interface:尺寸": true };
  var detailOpen = new Set();
  var detailSequence = 0;`,"高级组");
  s=replace(s,`    copy.appendChild(name);
    copy.appendChild(desc);
    wrap.appendChild(copy);`,`    copy.appendChild(name);
    wrap.appendChild(copy);`,"名称和说明分离");
  s=replace(s,`      mark(row, wrap);
    }
    return wrap;
  }

  function panelEl`,`      mark(row, wrap);
    }
    // Static supplemental descriptions in the native Units/Dimension custom
    // editors duplicate help. Move only these exact texts, not live feedback.
    var supplementary = {
      dimstyle: "样式写在当前图纸里。改完可一次撤销。",
      units: "这些值写在当前图纸的文件头里。插入单位改成毫米、厘米或米时，会按同一比例重建当前标注样式。"
    };
    if (slot && supplementary[row.id]) {
      Array.prototype.forEach.call(slot.children, function (node) {
        if (node.classList.contains("settings-desc") && node.textContent === supplementary[row.id]) {
          desc.textContent += (desc.textContent ? "\\n" : "") + node.textContent;
          node.remove();
        }
      });
      wrap.classList.add("settings-row-inline-custom");
    }
    // All schema descriptions become secondary help. Never hide custom
    // inputs, validation errors or document availability notices.
    if (desc.textContent.trim()) {
      var detailKey = String(row.id || row.label || "") + "|" + String(row.cat || "");
      var help = document.createElement("button");
      help.type = "button";
      help.className = "settings-detail-toggle";
      help.setAttribute("aria-label", (row.label || "设置项") + "：详细说明");
      help.title = "详细说明";
      desc.id = "uitool-settings-detail-" + (++detailSequence);
      desc.classList.add("settings-detail-content");
      var expanded = detailOpen.has(detailKey);
      help.setAttribute("aria-controls", desc.id);
      help.setAttribute("aria-expanded", String(expanded));
      help.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 4.5v.5"/></svg>';
      desc.hidden = !expanded;
      help.addEventListener("click", function (event) {
        event.preventDefault();
        var next = desc.hidden;
        desc.hidden = !next;
        help.setAttribute("aria-expanded", String(next));
        if (next) detailOpen.add(detailKey); else detailOpen.delete(detailKey);
      });
      wrap.appendChild(help);
      wrap.appendChild(desc);
    }
    return wrap;
  }

  function panelEl`,"二级说明");
  s=replace(s,'    var open = !collapsed[key];','    var open = !!q || !collapsed[key];',"搜索展开");
  s=replace(s,`      collapsed[key] = !collapsed[key];
      var on = !collapsed[key];`,`      var on = body.hidden;
      if (!q) collapsed[key] = !on;`,"搜索不覆盖折叠偏好");
  return s;
}
