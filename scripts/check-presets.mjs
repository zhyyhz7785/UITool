// 检查三个内置预设：皮肤视图一致、命令都在菜单里、切换不丢命令。不要求档位和分数。
import { createServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SIDE_PRESENTS = new Set(["ribbon", "tabs", "swatches", "search", "list", "canvas", "status", "paper", "grid", "aside"]);

function checkSidePages(pages) {
  if (!pages.length) throw new Error("HyMd 副页面是空的");
  const seen = new Set();
  for (const page of pages) {
    if (!page.id || !page.title || !page.source) throw new Error("副页面缺 id、标题或来源");
    if (seen.has(page.id)) throw new Error("副页面 id 重复 " + page.id);
    seen.add(page.id);
    if (!Array.isArray(page.regions) || page.regions.length === 0) throw new Error("副页面 " + page.id + " 没有分区");
    const regions = new Set();
    for (const region of page.regions) {
      if (!region.id || !region.title) throw new Error("副页面 " + page.id + " 的分区缺 id 或标题");
      if (!SIDE_PRESENTS.has(region.present)) throw new Error("副页面 " + page.id + " 分区 " + region.id + " 的呈现不对：" + region.present);
      if (regions.has(region.id)) throw new Error("副页面 " + page.id + " 分区 id 重复 " + region.id);
      regions.add(region.id);
      if (!Array.isArray(region.items)) throw new Error("副页面 " + page.id + " 分区 " + region.id + " 没有条目");
      const items = new Set();
      for (const item of region.items) {
        if (!item.id || !item.label) throw new Error("副页面 " + page.id + " 的条目缺 id 或文案");
        if (items.has(item.id)) throw new Error("副页面 " + page.id + " 条目 id 重复 " + item.id);
        items.add(item.id);
      }
    }
  }
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const server = await createServer({ root, configFile: path.join(root, "vite.config.ts"), server: { middlewareMode: true, hmr: false }, appType: "custom", logLevel: "error" });
try {
  const presets = await server.ssrLoadModule("/src/designer/presets/index.ts");
  const schemes = await server.ssrLoadModule("/template/src/workbench/schemes.ts");
  const hymdSpec = await server.ssrLoadModule("/scripts/hymd-spec.mjs");
  const types = presets.workTypes;
  const wantIds = ["writing", "cad2d", "general"];
  if (types.length !== 3 || types.some((t, i) => t.id !== wantIds[i])) throw new Error("内置预设应为 HyMdTauri、HY3D、通用模板，实际 " + types.map((t) => t.id).join(","));
  for (const type of types) {
    if (!type.schemes.length) throw new Error(type.id + " 没有皮肤");
    if (type.schemes.some((s) => s.tier || s.score || s.reason)) throw new Error(type.id + " 仍带档位或分数");
  }
  const writing = types.find((t) => t.id === "writing");
  const skins = writing.schemes.map((s) => s.skin).sort().join(",");
  if (skins !== "notion,obsidian,vscode") throw new Error("HyMd 皮肤不对：" + skins);
  const cad = types.find((t) => t.id === "cad2d");
  const cadSkins = cad.schemes.filter((s) => s.listed !== false).map((s) => s.skin).join(",");
  if (cadSkins !== "ribbon-top,ribbon-compact,hy-ribbon") throw new Error("HY3D 列出的皮肤不对：" + cadSkins);
  if (!cad.schemes.find((s) => s.id === "cad2d-hy-ribbon")?.chrome?.hyRibbon) throw new Error("HY Ribbon 没有常显状态");
  if (cad.schemes.some((s) => s.id === "cad2d-good")) throw new Error("Blender 皮肤不该再作为内置预设");
  if (types.find((t) => t.id === "general").schemes.length !== 1) throw new Error("通用模板应只有一套工作台");
  const cfg = presets.buildConfig("writing", "writing-best", { name: "demo", title: "演示", identifier: "com.hy.demo", version: "0.1.0", description: "", icon: "layout" });
  if (cfg.app.name !== "demo") throw new Error("生成时没有保留应用名");
  if (cfg.schemes.length !== 3 || cfg.scheme !== "writing-best") throw new Error("附带方案不对");
  if (!cfg.schemes.find((s) => s.id === "writing-best")?.tuned) throw new Error("主方案没有 tuned");
  if (cfg.schemes.filter((s) => s.tuned).length !== 1) throw new Error("tuned 应只有一个");
  const cmds = cfg.commands.map((c) => c.id).join(",");
  const switched = schemes.switchScheme(cfg, "writing-good", "session");
  if (switched.scheme !== "writing-good") throw new Error("没有切到次优");
  if (switched.commands.map((c) => c.id).join(",") !== cmds) throw new Error("切换后命令变了");
  if (switched.dialogs.length !== cfg.dialogs.length) throw new Error("切换后弹窗变了");
  const back = schemes.switchScheme(switched, "writing-best", "session");
  if (back.layout.dialogStyle !== "sheet") throw new Error("切回最优后弹窗呈现丢了，得到 " + back.layout.dialogStyle);
  if (!switched.schemes.find((s) => s.id === "writing-best")?.live) throw new Error("切换没有记住上一套的呈现");
  const reset = schemes.resetSchemeLayout(switched, switched.layout);
  const designed = switched.schemes.find((s) => s.id === "writing-good").ui.layout;
  if (reset.layout.dialogStyle !== designed.dialogStyle) throw new Error("重置布局没有回到设计值");
  checkSidePages(hymdSpec.hymdSidePages());
  const archived = { kind: "uitool-design", version: 1, customThemes: [], config: { ...cfg, workType: "image", app: { ...cfg.app, name: "old-image" } } };
  if (!globalThis.localStorage) {
    const mem = new Map();
    globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  }
  const store = await server.ssrLoadModule("/src/designer/store.ts");
  const opened = store.parseDesign(JSON.stringify(archived));
  if (opened.config.workType !== "image" || opened.config.app.name !== "old-image") throw new Error("归档预设被换掉了");
  console.log("预设检查通过：3 个预设，切换保留命令，重置回到设计值，归档设计按原文件打开");
} finally {
  await server.close();
}
