import type { WorkbenchApi } from "@tpl/workbench/context";
import { validateDoc, zipProject } from "./export";
import { openTextFile, saveFile } from "./platform";
import { clone, design, parseDesign, templateDefault, toDesignFile } from "./store";

const errMsg = (e: unknown) => (e as Error)?.message ?? String(e);

export function newDesign(wb: WorkbenchApi) {
  design.replace({ config: clone(templateDefault), customThemes: [] });
  design.select(null);
  wb.notify("info", "已新建设计", "从模板默认的 VSCode 式工作台开始。可撤销。");
}

export async function openDesign(wb: WorkbenchApi) {
  const f = await openTextFile(".json,.uitool.json");
  if (!f) return;
  try {
    design.replace(parseDesign(f.text));
    design.select(null);
    wb.notify("success", `已打开 ${f.name}`);
  } catch (e) {
    wb.notify("error", "打开失败", errMsg(e));
  }
}

export async function saveDesign(wb: WorkbenchApi) {
  const doc = design.get().doc;
  try {
    const path = await saveFile(`${doc.config.app.name}.uitool.json`, JSON.stringify(toDesignFile(doc), null, 2), { name: "UITool 设计", extensions: ["json"] });
    if (path) wb.notify("success", "设计已保存", path);
  } catch (e) {
    wb.notify("error", "保存失败", errMsg(e));
  }
}

export async function exportProject(wb: WorkbenchApi): Promise<string | null> {
  const doc = design.get().doc;
  const errs = validateDoc(doc);
  if (errs.length) {
    wb.showActivity("export");
    wb.notify("warning", "导出前请先改正应用信息", errs.join("；"));
    return null;
  }
  try {
    const zip = zipProject(doc);
    const path = await saveFile(`${doc.config.app.name}.zip`, zip, { name: "工程压缩包", extensions: ["zip"] });
    if (path) wb.notify("success", `工程已导出（${(zip.length / 1024).toFixed(0)} KB）`, `${path}\n解压后：npm install → npm run tauri dev`);
    return path;
  } catch (e) {
    wb.notify("error", "导出失败", errMsg(e));
    return null;
  }
}
