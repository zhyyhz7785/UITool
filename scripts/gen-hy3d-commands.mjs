// 从 hy3d 当前界面生成 UITool 的命令表和图标包。
// 命令、菜单、功能区、快速访问、状态栏、分析工作台都来自 ui/ 里正在加载的文件，不再按旧的八页签分类。
// HY3D_ROOT 缺省 E:/Code/hy3d。HY3D_COMMANDS 指向 ui/commands.json。HY3D_COMMANDS_OUT 只给核对用。
import fs from "node:fs";
import path from "node:path";
import { collectCommands, commandKeybinding, windowKeysFrom } from "./hy3d-spec.mjs";

const hy3d = process.env.HY3D_ROOT ?? "E:/Code/hy3d";
const ui = path.join(hy3d, "ui");
const src = process.env.HY3D_COMMANDS ?? path.join(ui, "commands.json");
const uiDir = path.dirname(src);
const out = process.env.HY3D_COMMANDS_OUT ? path.resolve(process.env.HY3D_COMMANDS_OUT) : new URL("../src/designer/presets/work/cad.hy3dCommands.ts", import.meta.url);
const iconOut = new URL("../template/src/icons/hy3d.json", import.meta.url);
const PREFIX = "h3-";

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(uiDir, rel), "utf8"));
const doc = readJson(path.relative(uiDir, src).replace(/\\/g, "/") || "commands.json");
const cs = await collectCommands(doc, (rel) => readJson(rel));
const ribbon = readJson("design/ribbon.json");
const menuDoc = readJson("design/menus.json");
const workbench = readJson("design/workbench.json");
const windowKeys = windowKeysFrom(readJson("keymap.json"));

const seen = new Set();
for (const c of cs) {
  if (!c.id) throw new Error("命令缺少 id");
  if (seen.has(c.id)) throw new Error("命令重复 " + c.id);
  seen.add(c.id);
}

const sprite = fs.readFileSync(path.join(uiDir, "icons.svg"), "utf8");
const symbols = new Map();
for (const hit of sprite.matchAll(/<symbol id="i-([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g)) {
  const body = hit[2].trim();
  if (!body) throw new Error("空图标 " + hit[1]);
  if (symbols.has(hit[1])) throw new Error("图标重复 " + hit[1]);
  symbols.set(hit[1], body);
}

const names = new Map();
const bareIcons = [];
for (const c of cs) {
  if (!c.icon) c.icon = c.id === "hw.cmdbar" ? "terminal" : "layout";
  if (symbols.has(c.icon)) {
    if (!names.has(c.icon)) names.set(c.icon, c.label || c.id);
  } else bareIcons.push(c.id + "=" + c.icon);
}
const iconPack = { icons: {} };
for (const [id, body] of symbols) {
  iconPack.icons[PREFIX + id] = { c: "HY3d", n: names.get(id) || id, s: body };
}

function sepItem(item) {
  return item === "—" || item === "-" || item === "sep";
}

function faceOf(raw) {
  if (!Array.isArray(raw)) return undefined;
  const face = [];
  for (const slot of raw) {
    const id = slot && (slot.id || slot.command);
    if (!id) continue;
    const item = { id, size: slot.size === "big" ? "big" : "small" };
    const menu = Array.isArray(slot.menu) ? slot.menu.filter(Boolean) : [];
    if (menu.length) item.menu = menu;
    if (slot.text) item.text = slot.text;
    face.push(item);
  }
  return face.length ? face : undefined;
}

const tabs = (ribbon.tabs || []).map((t) => {
  const panels = (t.panels || []).map((p) => {
    const panel = { id: p.id, title: p.title || p.id, ids: (p.ids || []).filter(Boolean) };
    const face = faceOf(p.face);
    if (face) panel.face = face;
    if (p.launcher) panel.launcher = p.launcher;
    return panel;
  });
  const tab = { id: t.id, title: t.title || t.id, panels };
  if (t.hidden) tab.hidden = true;
  return tab;
});
const quick = (ribbon.quick || []).filter(Boolean);
const statusToggles = (ribbon.statusToggles || []).map((item) => {
  if (typeof item === "string") return { id: item, short: item };
  return { id: item.id, short: item.short || item.id };
}).filter((item) => item.id);
const benchRows = (workbench.toolbarRows || []).map((r) => ({
  id: r.id,
  title: r.title || r.id,
  commands: (r.commands || []).filter(Boolean)
}));
const menus = (menuDoc.menus || []).map((m) => ({
  id: m.id,
  title: m.title || m.id,
  items: (m.items || []).map((item) => (sepItem(item) ? "sep" : item)).filter((item) => item === "sep" || item)
}));

const missing = [];
const need = (id, where) => {
  if (!id || id === "sep") return;
  if (!seen.has(id)) missing.push(where + " " + id);
};
for (const tab of tabs) {
  for (const panel of tab.panels) {
    for (const id of panel.ids) need(id, tab.title + "/" + panel.title);
    for (const slot of panel.face || []) {
      need(slot.id, tab.title + "/" + panel.title + " 面");
      for (const id of slot.menu || []) need(id, tab.title + "/" + panel.title + " 下拉");
    }
    need(panel.launcher, tab.title + "/" + panel.title + " 启动");
  }
}
for (const id of quick) need(id, "快速访问");
for (const item of statusToggles) need(item.id, "状态栏");
for (const row of benchRows) for (const id of row.commands) need(id, "工作台 " + row.title);
for (const menu of menus) for (const id of menu.items) need(id, "菜单 " + menu.title);
if (missing.length) throw new Error("规格引用了没有登记的命令：" + missing.join(", "));
if (!tabs.some((t) => t.title === "常用")) throw new Error("功能区没有「常用」");
if (!tabs.some((t) => t.hidden && t.title === "文字编辑器")) throw new Error("功能区没有隐藏的「文字编辑器」");
if (!menus.some((m) => m.title === "参数")) throw new Error("菜单没有「参数」");
if (!statusToggles.some((t) => t.id === "cad.snapmode")) throw new Error("状态栏没有栅格捕捉");
if (!benchRows.length) throw new Error("分析工作台没有工具排");
const listed = new Set(menus.flatMap((m) => m.items.filter((id) => id !== "sep")));
const extra = cs.filter((c) => !listed.has(c.id)).map((c) => c.id);
if (extra.length) menus.push({ id: "uitool-unplaced", title: "更多", items: extra });

const lines = [];
lines.push("/** 由 scripts/gen-hy3d-commands.mjs 从 hy3d ui/design、ui/commands、ui/keymap.json 和 ui/icons.svg 生成。勿手改。 */");
lines.push("export interface Hy3dCmd { id: string; title: string; category: string; icon: string; keybinding?: string }");
lines.push("export const hy3dCommands: Hy3dCmd[] = [");
for (const c of cs) {
  const key = commandKeybinding(c, windowKeys);
  lines.push(
    `  { id: ${JSON.stringify(c.id)}, title: ${JSON.stringify(c.label || c.id)}, category: ${JSON.stringify(c.cat || "")}, icon: ${JSON.stringify(symbols.has(c.icon) ? PREFIX + c.icon : c.icon)}${key ? `, keybinding: ${JSON.stringify(key)}` : ""} },`
  );
}
lines.push("];");
lines.push("");
lines.push(`export const hy3dMenus: { id: string; title: string; items: (string | "sep")[] }[] = ${JSON.stringify(menus, null, 2)};`);
lines.push("");
lines.push(`export const hy3dTabs: { id: string; title: string; hidden?: boolean; panels: { id: string; title: string; ids: string[]; face?: { id: string; size: "big" | "small"; menu?: string[]; text?: string }[]; launcher?: string }[] }[] = ${JSON.stringify(tabs, null, 2)};`);
lines.push("");
lines.push(`export const hy3dQuick: string[] = ${JSON.stringify(quick, null, 2)};`);
lines.push("");
lines.push(`export const hy3dStatus: { id: string; short: string }[] = ${JSON.stringify(statusToggles, null, 2)};`);
lines.push("");
lines.push(`export const hy3dBenchRows: { id: string; title: string; commands: string[] }[] = ${JSON.stringify(benchRows, null, 2)};`);
lines.push("");
fs.writeFileSync(out, lines.join("\n"));
fs.writeFileSync(iconOut, JSON.stringify(iconPack));
if (bareIcons.length) console.log("精灵里没有、保留原名：" + bareIcons.join(", "));
console.log(`commands ${cs.length}  menus ${menus.length}  tabs ${tabs.length}  bench ${benchRows.length}  icons ${symbols.size}`);
