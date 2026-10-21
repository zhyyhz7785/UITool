// 「CAD 二维制图」预设 → 3 份带日期的 .uitool.json，以及（默认）hy3d 读取的规格。
// 手改通路不走这里：pull-hy3d.mjs 载入，改 Hy3d制图.uitool.json，push-hy3d.mjs 写回。
// 手改文件已存在时，本脚本不再写 hy3d/ui/design。要强制用预设覆盖，设 PRESET_EXPORT=1。
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const designDir = path.resolve(root, "../13-软件模板/01-AutoCAD侧");
const hy3d = process.env.HY3D_ROOT ?? "E:/Code/hy3d";
const date = process.env.DESIGN_DATE ?? "20261017";
const handFile = path.resolve(root, "../13-软件模板/01-AutoCAD侧/Hy3d制图.uitool.json");
const skipHy3d = fs.existsSync(handFile) && process.env.PRESET_EXPORT !== "1";

/** 方案 → hy3d 皮肤 id、推荐配色（现有色板只有 acad-b）、设计文件名。 */
const SCHEMES = [
  { scheme: "cad2d-good", skin: "blender", file: `01-Hy3d制图-A-${date}.uitool.json` },
  { scheme: "cad2d-best", skin: "ribbon-top", file: `02-Hy3d制图-B-${date}.uitool.json` },
  { scheme: "cad2d-basic", skin: "workbench", file: `03-Hy3d制图-C-${date}.uitool.json` }
];

const SPEC_FILE = { blender: "blender", "ribbon-top": "ribbon", workbench: "workbench" };

const EN = {
  layers: "Layers",
  props: "Properties",
  tree: "Outline",
  right: "Properties",
  left: "Model"
};

function isKey(k) {
  return !!k && (/^(Ctrl|Alt|Shift|F\d|Del)/.test(k) || k.includes("+"));
}

const server = await createServer({ root, configFile: path.join(root, "vite.config.ts"), server: { middlewareMode: true, hmr: false }, appType: "custom", logLevel: "error" });
try {
  const presets = await server.ssrLoadModule("/src/designer/presets/index.ts");
  const cad = presets.workTypes.find((t) => t.id === "cad2d");
  const source = JSON.parse(fs.readFileSync(path.join(hy3d, "ui/commands.json"), "utf8")).commands;
  const ids = new Set(cad.commands.map((c) => c.id));
  const missing = source.filter((c) => !ids.has(c.id));
  if (missing.length) throw new Error("缺少 hy3d 命令：" + missing.map((c) => c.id).join(", "));
  if (ids.size !== source.length) throw new Error(`命令条数 ${ids.size} != ${source.length}`);
  for (const c of source) {
    const got = cad.commands.find((x) => x.id === c.id);
    const want = isKey(c.key) ? c.key : null;
    if ((got.keybinding ?? null) !== want) throw new Error(`快捷键不一致 ${c.id}: ${got.keybinding ?? ""} != ${want ?? ""}`);
  }

  const app = { name: "hy3d-cad", title: "hy3d 二维制图", identifier: "com.hy.hy3d", version: "0.1.0", description: cad.summary, icon: "layout" };
  const stamp = "由 UITool/scripts/export-hy3d.mjs 从「CAD 二维制图」预设生成，勿手改";
  const container = (c) => ({ id: c.id, title: { zh: c.title, en: EN[c.id] ?? c.title }, header: c.header === "icon" ? "icon" : "text", views: c.sections.map((s) => s.view) });
  const cmdsOf = (items) => items.filter((i) => i.command).map((i) => i.command);

  const designOut = path.join(hy3d, "ui/design");
  if (skipHy3d) console.log("已有 Hy3d制图.uitool.json，跳过写入 hy3d/ui/design。写回用手改文件：node scripts/push-hy3d.mjs。强制用预设覆盖请设 PRESET_EXPORT=1。");
  else fs.mkdirSync(designOut, { recursive: true });
  const hy = await server.ssrLoadModule("/src/designer/presets/work/cad.hy3dCommands.ts");

  for (const s of SCHEMES) {
    const config = presets.buildConfig("cad2d", s.scheme, app);
    fs.writeFileSync(path.join(designDir, s.file), JSON.stringify({ kind: "uitool-design", version: 1, config, customThemes: [] }, null, 2) + "\n");

    const def = cad.schemes.find((x) => x.id === s.scheme);
    const L = def.ui.layout;
    const top = L.toolbars.top;
    const side = L.toolbars.side;
    const topOn = top.visible && top.rows.length > 0;
    const sideOn = side.visible && side.rows.length > 0;
    const toolbar = topOn ? "top" : sideOn ? "side" : "hidden";
    const spec = {
      $comment: stamp,
      skin: s.skin,
      scheme: s.scheme,
      name: def.name,
      source: def.source,
      colorTheme: "acad-b",
      layout: {
        sideBar: L.primarySideBar.visible,
        auxiliaryBar: L.auxiliaryBar.visible,
        panel: L.panel.visible,
        statusBar: L.statusBar.visible,
        activity: L.activityBar.visible ? L.activityBar.position : "hidden",
        toolbar,
        toolbarStyle: topOn ? top.style : sideOn ? side.style : "hidden",
        editorTabs: L.editor.tabs,
        commandCenter: L.titleBar.commandCenter
      },
      side: def.ui.activity.map(container),
      auxiliary: def.ui.auxiliary.map(container),
      panel: def.ui.panel.map((p) => p.view),
      toolbarRows: (topOn ? top.rows : sideOn ? side.rows : []).map((r) => ({ id: r.id, title: r.title, commands: cmdsOf(r.start) }))
    };
    if (s.skin === "blender" || s.skin === "ribbon-top") {
      spec.tabs = hy.BLENDER_TABS;
      spec.quick = hy.BLENDER_QUICK;
      spec.statusToggles = hy.BLENDER_STATUS;
    }
    if (!skipHy3d) fs.writeFileSync(path.join(designOut, `${SPEC_FILE[s.skin]}.json`), JSON.stringify(spec, null, 2) + "\n");
    console.log(`${s.file}  →  ${skipHy3d ? "（未写 hy3d）" : `ui/design/${SPEC_FILE[s.skin]}.json`}  commands=${config.commands.length}`);
  }

  const known = ids;
  const menus = {
    $comment: stamp,
    menus: cad.menus
      .map((m) => ({
        id: m.id,
        title: m.title,
        items: m.items
          .map((x) => (x.separator ? "—" : x.command))
          .filter((x) => x === "—" || known.has(x))
      }))
      .filter((m) => m.items.some((x) => x !== "—"))
  };
  if (!skipHy3d) fs.writeFileSync(path.join(designOut, "menus.json"), JSON.stringify(menus, null, 2) + "\n");
  const blenderMenus = {
    $comment: stamp,
    menus: (hy.BLENDER_MENUS ?? [])
      .map((m) => ({
        id: m.id,
        title: m.title,
        items: m.items.filter((x) => x === "sep" || known.has(x)).map((x) => (x === "sep" ? "—" : x))
      }))
      .filter((m) => m.items.length)
  };
  if (!skipHy3d) fs.writeFileSync(path.join(designOut, "menus.blender.json"), JSON.stringify(blenderMenus, null, 2) + "\n");
  console.log(`${skipHy3d ? "未写菜单。" : "ui/design/menus.json  "}菜单 ${menus.menus.length} 组；Blender 菜单 ${blenderMenus.menus.length} 组；命令 ${source.length} 条`);
} finally {
  await server.close();
}
