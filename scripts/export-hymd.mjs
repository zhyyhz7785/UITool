// 「文档写作」预设 → 3 份带日期的 .uitool.json，以及（默认）HyMd 读取的规格。
// 设计器「连接」写回后，规格注释含「设计器连接写回」。此时本脚本不再覆盖 HyMd，除非 PRESET_EXPORT=1。
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const designDir = path.resolve(root, "../13-软件模板/02-HyMd侧");
const hymd = process.env.HYMD_ROOT ?? "E:/Code/HyMdTauri2";
const date = process.env.DESIGN_DATE ?? "20261017";

/** 方案 → HyMd 皮肤、推荐配色（HyMd 配色 id）、设计文件名。 */
const SCHEMES = [
  { scheme: "writing-good", skin: "vscode", colorTheme: "HyMd VS Code Dark", file: `01-HyMd写作-A-${date}.uitool.json` },
  { scheme: "writing-basic", skin: "notion", colorTheme: "HyMd Notion Light", file: `02-HyMd写作-B-${date}.uitool.json` },
  { scheme: "writing-best", skin: "obsidian", colorTheme: "HyMd Obsidian Dark", file: `03-HyMd写作-C-${date}.uitool.json` }
];

/** 容器 / 菜单的英文名。HyMd 界面双语，UITool 预设只写中文。 */
const EN = {
  explorer: "Explorer",
  files: "Files",
  search: "Search",
  scm: "Source Control",
  paper: "Paper",
  bookmarks: "Bookmarks",
  refs: "References",
  related: "Related",
  theme: "Theme",
  outline: "Outline",
  docMeta: "Info",
  backlinks: "Backlinks",
  localGraph: "Local graph",
  tags: "Tags"
};

const server = await createServer({ root, configFile: path.join(root, "vite.config.ts"), server: { middlewareMode: true, hmr: false }, appType: "custom", logLevel: "error" });
try {
  const presets = await server.ssrLoadModule("/src/designer/presets/index.ts");
  const hymdCmds = await server.ssrLoadModule("/src/designer/presets/work/writing.hymdCommands.ts");
  const writing = presets.workTypes.find((t) => t.id === "writing");

  const snapshot = JSON.parse(fs.readFileSync(path.join(hymd, "src/app/commandIds.snapshot.json"), "utf8"));
  const ids = new Set(writing.commands.map((c) => c.id));
  const missing = snapshot.filter((c) => !ids.has(c.id));
  if (missing.length) throw new Error("缺少 HyMd 命令：" + missing.map((c) => c.id).join(", "));
  for (const c of snapshot) {
    const got = writing.commands.find((x) => x.id === c.id);
    if ((got.keybinding ?? null) !== c.keybinding) throw new Error(`快捷键不一致 ${c.id}: ${got.keybinding} != ${c.keybinding}`);
  }

  const app = { name: "hymd-writing", title: "HyMd 文档写作", identifier: "com.hy.hymd-writing", version: "0.1.0", description: writing.summary, icon: "layout" };
  const stamp = "由 UITool/scripts/export-hymd.mjs 从「文档写作」预设生成，勿手改";
  const marker = path.join(hymd, "src/skins/design/vscode.json");
  let skipHymd = false;
  if (process.env.PRESET_EXPORT !== "1" && fs.existsSync(marker)) {
    try {
      skipHymd = String(JSON.parse(fs.readFileSync(marker, "utf8")).$comment || "").includes("设计器连接写回");
    } catch {
      skipHymd = false;
    }
  }
  if (skipHymd) console.log("HyMd 规格已由设计器连接写回，跳过覆盖。强制用预设覆盖请设 PRESET_EXPORT=1。");
  const container = (c) => ({ id: c.id, title: { zh: c.title, en: EN[c.id] ?? c.title }, header: c.header === "icon" ? "icon" : "text", views: c.sections.map((s) => s.view) });
  const cmdsOf = (items) => items.filter((i) => i.command).map((i) => i.command);

  fs.mkdirSync(path.join(hymd, "src/skins/design"), { recursive: true });
  fs.mkdirSync(path.join(hymd, "src/parts/design"), { recursive: true });

  for (const s of SCHEMES) {
    const config = presets.buildConfig("writing", s.scheme, app);
    fs.writeFileSync(path.join(designDir, s.file), JSON.stringify({ kind: "uitool-design", version: 1, config, customThemes: [] }, null, 2) + "\n");
    if (skipHymd) {
      console.log(`${s.file}  →  （未写 HyMd）`);
      continue;
    }

    const def = writing.schemes.find((x) => x.id === s.scheme);
    const L = def.ui.layout;
    const side = L.toolbars.side;
    const ribbonOn = side.visible && side.rows.length > 0;
    const spec = {
      $comment: stamp,
      skin: s.skin,
      scheme: s.scheme,
      name: def.name,
      source: def.source,
      colorTheme: s.colorTheme,
      layout: {
        sideBar: L.primarySideBar.visible,
        auxiliaryBar: L.auxiliaryBar.visible,
        panel: L.panel.visible,
        statusBar: L.statusBar.visible,
        activity: L.activityBar.visible ? L.activityBar.position : "hidden",
        ribbon: ribbonOn ? "side" : L.toolbars.top.visible && L.toolbars.top.rows.length ? "top" : "hidden",
        editorTabs: L.editor.tabs,
        commandCenter: L.titleBar.commandCenter
      },
      side: def.ui.activity.map(container),
      auxiliary: def.ui.auxiliary.map(container),
      panel: def.ui.panel.map((p) => p.view),
      ribbon: ribbonOn ? { start: cmdsOf(side.rows[0].start), end: cmdsOf(side.rows[0].end) } : null
    };
    fs.writeFileSync(path.join(hymd, "src/skins/design", `${s.skin}.json`), JSON.stringify(spec, null, 2) + "\n");
    console.log(`${s.file}  →  skins/design/${s.skin}.json  commands=${config.commands.length}`);
  }

  const menus = {
    $comment: stamp,
    menus: hymdCmds.hymdMenus.map((m) => ({
      id: m.id,
      items: m.items.map((x) => (x === "sep" ? "—" : typeof x === "string" ? x : `@${x.sub}`))
    }))
  };
  if (!skipHymd) fs.writeFileSync(path.join(hymd, "src/parts/design/menus.json"), JSON.stringify(menus, null, 2) + "\n");
  console.log(`${skipHymd ? "未写菜单。" : "parts/design/menus.json  "}菜单 ${menus.menus.length} 组；HyMd 快照 ${snapshot.length} 条，模板共 ${writing.commands.length} 条`);
} finally {
  await server.close();
}
