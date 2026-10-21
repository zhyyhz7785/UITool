// 检查 9 个工作类型 × 3 套方案：视图一致、命令都在菜单里、切换不丢命令。
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
  if (types.length !== 9) throw new Error("工作类型应为 9 个，实际 " + types.length);
  const tiers = new Set(["best", "good", "basic"]);
  for (const type of types) {
    if (type.schemes.length !== 3) throw new Error(type.id + " 不是 3 套");
    const got = new Set(type.schemes.map((s) => s.tier));
    if ([...tiers].some((t) => !got.has(t))) throw new Error(type.id + " 档位重复或缺档");
    if (type.dialogs.length !== 3) throw new Error(type.id + " 弹窗不是 3 个");
    const scores = Object.fromEntries(type.schemes.map((s) => [s.tier, s.score.efficiency + s.score.aesthetic + s.score.learn]));
    if (!(scores.best > scores.good && scores.good > scores.basic)) throw new Error(type.id + " 分数顺序 " + JSON.stringify(scores));
  }
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
  console.log("预设检查通过：9 类 × 3 套，切换保留命令，重置回到设计值，副页面都有分区");
} finally {
  await server.close();
}
