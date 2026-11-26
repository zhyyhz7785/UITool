// Read browser runtime as text. Vite's config bundler must not transform the
// functions which execute inside the product iframe.
import { readFileSync } from "node:fs";
const design = JSON.parse(readFileSync(new URL("./hy3d-ribbon-design.json", import.meta.url), "utf8"));
const runtime = readFileSync(new URL("./hy3d-ribbon-dense.runtime.js", import.meta.url), "utf8");

export function denseRibbonSource(source) {
  const anchor = "  function buildPanels(cur) {";
  if (source.split(anchor).length !== 2) throw new Error("Ribbon 设计缺少原生构建入口");
  const save = "  function saveGroup(key, order, cap) {";
  if (source.split(save).length !== 2) throw new Error("Ribbon 设计缺少排序保存入口");
  source = source.replace(save, () => save + "\n    if (model[key] && model[key].dense) key += '/dense';");
  const reset = "      delete prefs.groups[key];";
  if (source.split(reset).length !== 2) throw new Error("Ribbon 设计缺少恢复默认入口");
  source = source.replace(reset, () => "      delete prefs.groups[model[key] && model[key].dense ? key + '/dense' : key];");
  return source.replace(anchor, () =>
    "  var UITOOL_RIBBON = " + JSON.stringify(design) + ";\n" + runtime +
    "\n  function buildPanels(cur) {\n" +
    "    buildLayerPanels(cur);\n" +
    "    try { enhanceDense(cur); } catch (error) {\n" +
    "      if (api && api.ribbonPanels) api.ribbonPanels.dataset.uitoolDenseStatus = 'fallback';\n" +
    "      root.console && root.console.warn('[UITool Ribbon] using layer baseline', error);\n" +
    "      reportDense('fallback',0,0,0,String(error));\n" +
    "    }\n" +
    "  }\n  function buildLayerPanels(cur) {"
  );
}
