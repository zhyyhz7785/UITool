// Read-only overlay. Only UITool's layer design preview loads this candidate.
import { readFileSync } from "node:fs";
import { legacyLayerSource } from "./hy3d-layer-legacy.mjs";
const patch = JSON.parse(readFileSync(new URL("./hy3d-layer-design.patch.json", import.meta.url), "utf8"));
export function layerDesignSource(source) {
  if (!/\bnativeCadProfile:\s*true\b/.test(source)) return legacyLayerSource(source);
  if (source.includes("function makeLayerPicker(select)") && source.includes("var LAYER_MARKS =")) {
    const store = 'var STORE = "hy3d.ui.hyRibbon";';
    const bind = 'layerDetach = root.CadPanels.attachLayerSelect(select, picker.update);';
    if (source.split(store).length !== 2 || source.split(bind).length !== 2) throw new Error("新版图层绑定已变化");
    return source.replace(store, 'var STORE = "uitool.layerDesign.hyRibbon";').replace(bind, 'layerDetach = root.UIToolLayerScene ? root.UIToolLayerScene.attach(select, picker.update) : root.CadPanels.attachLayerSelect(select, picker.update);');
  }
  let result = source;
  for (const [i, hunk] of patch.hunks.entries()) {
    if (result.split(hunk.before).length !== 2) throw new Error("图层设计适配点不匹配 #" + (i + 1));
    result = result.replace(hunk.before, () => hunk.after);
  }
  return result;
}
export function layerDesignHtml(html, legacy = false) {
  const script = /<script\b[^>]*\bsrc\s*=\s*["'](?:\.\/)?skins\/hy-ribbon\/layout\.js["'][^>]*>\s*<\/script\s*>/i;
  if (!script.test(html) || !/<\/head\s*>/i.test(html)) throw new Error("缺少 HY Ribbon 或 head 入口");
  return html.replace(script, '<script src="/__uitool-layer-scene.js"></script>\n<script src="/__uitool-layer-layout.js"></script>')
    .replace(/<\/head\s*>/i, (legacy ? '<link rel="stylesheet" href="/__uitool-a5.css"><script>document.documentElement.dataset.uitoolA5="1"</script>' : '') + '<link rel="stylesheet" href="/__uitool-layer.css"><script>document.documentElement.dataset.uitoolLayerDesign="1";try{localStorage.setItem("hy3d.ui.skin","hy-ribbon")}catch(e){}</script></head>');
}
