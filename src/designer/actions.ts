import type { WorkbenchApi } from "@tpl/workbench/context";
import { validateDoc, zipProject } from "./export";
import { openTextFile, saveFile } from "./platform";
import { clone, design, parseDesign, templateDefault, toDesignFile } from "./store";

const errMsg = (e: unknown) => (e as Error)?.message ?? String(e);

export function newDesign(wb: WorkbenchApi) {
  design.replace({ config: clone(templateDefault), customThemes: [] });
  design.markSaved();
  design.select(null);
  wb.notify("info", "已新建设计", "从模板默认的工作台开始。可撤销。");
}

export async function openDesign(wb: WorkbenchApi) {
  const f = await openTextFile(".json,.uitool.json");
  if (!f) return;
  try {
    if (design.dirty()) {
      wb.notify("error", "没有打开", "当前设计还有未保存的修改。先保存，或在预设里放弃这些修改后再打开。");
      return;
    }
    design.replace(parseDesign(f.text));
    design.markSaved();
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
    if (path) {
      design.markSaved();
      wb.notify("success", "设计已保存", path);
    }
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
    const extra: Record<string, string> = {};
    if (doc.config.workType === "general") {
      try {
        const res = await fetch("/__uitool/preview/shell?product=hymd");
        if (res.ok) {
          const body = (await res.json()) as { files?: { path: string; text: string }[] };
          for (const file of body.files ?? []) extra[file.path] = file.text;
        }
      } catch {
        /* 开发服务不在时，导出仍只用模板自带的样式，不读取产品目录。 */
      }
    }
    const zip = zipProject(doc, extra);
    const path = await saveFile(`${doc.config.app.name}.zip`, zip, { name: "工程压缩包", extensions: ["zip"] });
    if (path) wb.notify("success", `工程已导出（${(zip.length / 1024).toFixed(0)} KB）`, `${path}\n解压后：npm install → npm run tauri dev`);
    return path;
  } catch (e) {
    wb.notify("error", "导出失败", errMsg(e));
    return null;
  }
}
