// 从 hy3d 的命令和图标精灵生成 UITool 的 HY3d 模板数据。不改 cad2d 的功能区预设。
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const hy3d = process.env.HY3D_ROOT ?? "E:/Code/hy3d";
const mapUrl = pathToFileURL("E:/Code/UI设计规范/12-工具图标/_build/hy3d-map.mjs");
const { reserved } = await import(mapUrl.href);

const index = JSON.parse(fs.readFileSync(path.join(hy3d, "ui/commands.json"), "utf8"));
const cs = [];
for (const rel of index.include) {
  const data = JSON.parse(fs.readFileSync(path.join(hy3d, "ui", rel), "utf8"));
  cs.push(...data.commands);
}

const sprite = fs.readFileSync(path.join(hy3d, "ui/icons.svg"), "utf8");
const symbols = new Map();
for (const hit of sprite.matchAll(/<symbol id="i-([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g)) {
  const body = hit[2].trim();
  if (!body) throw new Error("空图标 " + hit[1]);
  if (symbols.has(hit[1])) throw new Error("图标重复 " + hit[1]);
  symbols.set(hit[1], body);
}

const usedIcons = new Set();
for (const c of cs) {
  if (!c.icon) throw new Error("命令没有图标 " + c.id);
  if (!symbols.has(c.icon)) throw new Error("精灵里没有 " + c.icon + "（" + c.id + "）");
  if (usedIcons.has(c.icon)) throw new Error("两个命令共用图标 " + c.icon);
  usedIcons.add(c.icon);
}
for (const r of reserved) {
  if (!symbols.has(r.icon)) throw new Error("精灵里没有预留图标 " + r.icon);
  if (usedIcons.has(r.icon)) continue;
  usedIcons.add(r.icon);
  cs.push({
    id: "rsv." + r.icon,
    label: r.zh,
    cat: "三维",
    icon: r.icon,
    key: "",
    place: ["menu:三维"]
  });
}
for (const id of symbols.keys()) {
  if (usedIcons.has(id)) continue;
  usedIcons.add(id);
  cs.push({ id: "ico." + id, label: id, cat: "图标", icon: id, key: "", place: ["menu:图标"] });
}

const names = new Map();
for (const c of cs) if (!names.has(c.icon)) names.set(c.icon, c.label);

const PREFIX = "h3-";
const iconPack = { icons: {} };
for (const [id, body] of symbols) {
  iconPack.icons[PREFIX + id] = { c: "HY3d", n: names.get(id) || id, s: body };
}

function isKey(k) {
  return !!k && (/^(Ctrl|Alt|Shift|F\d|Del)/.test(k) || k.includes("+"));
}

const menuOrder = ["文件", "编辑", "视图", "插入", "绘图", "标注", "修改", "草图", "格式", "图层", "工具", "HY 结构", "外观", "窗口", "帮助", "三维", "图标", "更多"];
const menuIds = ["file", "edit", "view", "insert", "draw", "ann", "modify", "sketch", "format", "layer", "tool", "hy", "look", "window", "help", "solid", "icons", "more"];
const menus = new Map(menuOrder.map((n) => [n, []]));
for (const c of cs) {
  for (const p of c.place ?? []) {
    if (!p.startsWith("menu:")) continue;
    const name = p.slice(5) === "视图>缩放" ? "视图" : p.slice(5);
    if (!menus.has(name)) menus.set(name, []);
    const list = menus.get(name);
    if (!list.includes(c.id)) list.push(c.id);
  }
}
const look = menus.get("外观");
if (look) {
  for (const id of ["ui.skin.acad-b", "ui.skin.hy-e"]) {
    const at = look.indexOf(id);
    if (at >= 0) look.splice(at, 1);
  }
}
const listed = new Set();
for (const items of menus.values()) for (const id of items) listed.add(id);
const missing = cs.filter((c) => !listed.has(c.id)).map((c) => c.id);
if (missing.length) menus.get("更多").push(...missing);

const set = (...ids) => new Set(ids);
const DRAW = set("cad.line", "cad.pline", "cad.circle", "cad.circle.ttt", "cad.arc", "cad.arc.sce", "cad.arc.sca", "cad.arc.scl", "cad.arc.sea", "cad.arc.sed", "cad.arc.ser", "cad.arc.cse", "cad.arc.csa", "cad.arc.csl", "cad.arc.con", "cad.rect", "cad.polygon", "cad.ellipse", "cad.spline", "cad.point", "cad.pointm", "cad.divide", "cad.measure", "cad.ray", "cad.xline", "cad.donut");
const ANNO = set("cad.text", "cad.hatch", "cad.dimlin", "cad.dimali", "cad.dimang", "cad.leader");
const SELECT = set("cad.selall", "cad.deselect", "cad.select.invert", "cad.select.box", "cad.select.circle", "cad.select.cycle", "cad.qselect");
const CLIP = set("edit.cut", "edit.copy", "edit.paste", "edit.pastespec", "edit.find");
const ZOOM = set("cad.pan", "cad.zoomext", "cad.zoomin", "cad.zoomout", "cad.zoomsel", "cad.zoomwin", "cad.regen", "cad.hide", "cad.isolate", "cad.unisolate");
const UI = set("ui.fullscreen", "ui.resetlayout", "hw.cmdbar", "hw.toolbarpos", "view.sidebar", "view.toolshelf");
const FILE = set("file.new", "file.open", "file.save", "file.saveas", "file.close");
const OUTPUT = set("file.plot", "file.export", "file.import.dwg", "file.props");
const MANAGE = set("cad.dimstyle", "cad.linetype", "cad.textstyle", "cad.units", "app.options", "cad.cui");
const QUICK = set("ui.undo", "ui.redo", "edit.adjust");
const STATUS = set("cad.dyn", "cad.grid", "cad.lw", "cad.ortho", "cad.osnap", "cad.otrack", "cad.polar");
const STAGE3 = set("view.cursor", "view.cursor.selected", "view.cursor.to", "view.cursor.origin", "edit.select.vert", "edit.select.edge", "edit.select.face", "edit.mode", "view.add");
const LATER = set("edit.rename", "edit.undo.history", "cad.appload", "cad.dc", "cad.netload", "cad.palettes", "cad.props", "cad.wscur");
const BEAM = set("hy.beam", "hy.pick", "hy.sup.pin", "hy.sup.roller", "hy.sup.fixed", "hy.sup.spring");
const LOAD = set("hy.addload", "hy.pload", "hy.udl", "hy.moment", "hy.combo");
const SOLVE = set("hy.solve", "hy.check", "hy.bmd", "hy.sfd", "hy.nfd", "hy.deform", "hy.reaction", "hy.envelope", "hy.report", "hy.export", "hy.insert");
const SETTLE = set("hy.settle", "hy.settle.import", "hy.settle.fit", "hy.settle.report");

function tabOf(c) {
  const id = c.id;
  if (id.startsWith("rsv.") || id.startsWith("ico.")) return { bucket: "tab", tab: "视图", panel: "三维" };
  if (STATUS.has(id)) return { bucket: "status" };
  if (QUICK.has(id)) return { bucket: "quick" };
  if (STAGE3.has(id)) return { bucket: "tab", tab: "更多", panel: "阶段 3" };
  if (LATER.has(id)) return { bucket: "tab", tab: "更多", panel: "以后再定" };
  if (SELECT.has(id)) return { bucket: "tab", tab: "默认", panel: "选择" };
  if (DRAW.has(id)) return { bucket: "tab", tab: "默认", panel: "绘图" };
  if (c.cat === "修改") return { bucket: "tab", tab: "默认", panel: "修改" };
  if (ANNO.has(id)) return { bucket: "tab", tab: "默认", panel: "注释" };
  if (id === "cad.layer") return { bucket: "tab", tab: "默认", panel: "图层" };
  if (id === "cad.dist" || id === "cad.area") return { bucket: "tab", tab: "默认", panel: "实用工具" };
  if (CLIP.has(id)) return { bucket: "tab", tab: "默认", panel: "剪贴板" };
  if (c.cat === "插入") return { bucket: "tab", tab: "插入", panel: "参照" };
  if (ZOOM.has(id)) return { bucket: "tab", tab: "视图", panel: "缩放与显示" };
  if (c.cat === "窗口" || c.cat === "外观" || UI.has(id)) return { bucket: "tab", tab: "视图", panel: "界面" };
  if (MANAGE.has(id)) return { bucket: "tab", tab: "管理", panel: "样式与选项" };
  if (OUTPUT.has(id)) return { bucket: "tab", tab: "输出", panel: "打印与导出" };
  if (FILE.has(id)) return { bucket: "tab", tab: "文件", panel: "文档" };
  if (BEAM.has(id)) return { bucket: "tab", tab: "结构", panel: "梁" };
  if (LOAD.has(id)) return { bucket: "tab", tab: "结构", panel: "荷载" };
  if (SOLVE.has(id)) return { bucket: "tab", tab: "结构", panel: "求解" };
  if (SETTLE.has(id)) return { bucket: "tab", tab: "结构", panel: "沉降" };
  if (c.cat === "帮助") return { bucket: "tab", tab: "帮助", panel: "帮助" };
  return { bucket: "tab", tab: "更多", panel: c.cat || "其他" };
}

const tabOrder = ["默认", "插入", "视图", "管理", "输出", "文件", "结构", "帮助", "更多"];
const panelOrder = ["绘图", "修改", "注释", "图层", "实用工具", "剪贴板", "选择", "参照", "缩放与显示", "界面", "三维", "样式与选项", "打印与导出", "文档", "梁", "荷载", "求解", "沉降", "帮助", "阶段 3", "以后再定"];
const placed = new Map();
for (const c of cs) {
  if (placed.has(c.id)) throw new Error("命令重复 " + c.id);
  placed.set(c.id, tabOf(c));
}
const tabs = tabOrder.map((title) => ({ id: title, title, panels: [] }));
const tabBy = Object.fromEntries(tabs.map((t) => [t.title, t]));
const panelBy = new Map();
for (const g of placed.values()) {
  if (g.bucket !== "tab") continue;
  const key = g.tab + "/" + g.panel;
  if (!panelBy.has(key)) {
    const panel = { id: g.panel, title: g.panel, ids: [] };
    panelBy.set(key, panel);
    tabBy[g.tab].panels.push(panel);
  }
}
for (const c of cs) {
  const g = placed.get(c.id);
  if (g.bucket === "tab") panelBy.get(g.tab + "/" + g.panel).ids.push(c.id);
}
const rank = (title) => {
  const i = panelOrder.indexOf(title);
  return i < 0 ? 1000 : i;
};
for (const t of tabs) t.panels.sort((a, b) => rank(a.title) - rank(b.title) || a.title.localeCompare(b.title, "zh"));
const quickOrder = ["ui.undo", "ui.redo", "edit.adjust"];
const statusOrder = ["cad.dyn", "cad.grid", "cad.lw", "cad.ortho", "cad.osnap", "cad.otrack", "cad.polar"];
const quick = quickOrder.filter((id) => placed.get(id)?.bucket === "quick");
const statusToggles = statusOrder.filter((id) => placed.get(id)?.bucket === "status");
if (statusToggles.length) tabBy["默认"].panels.push({ id: "状态", title: "状态", ids: statusToggles });
const liveTabs = tabs.filter((t) => t.panels.length);
const covered = new Set([...liveTabs.flatMap((t) => t.panels.flatMap((p) => p.ids)), ...quick]);
if (covered.size !== cs.length) {
  const lost = cs.filter((c) => !covered.has(c.id)).map((c) => c.id);
  throw new Error("没放到功能区上 " + lost.join(","));
}

const menuLines = [];
let mi = 0;
for (const [title, items] of menus) {
  if (!items.length) continue;
  const id = menuIds[mi] ?? `m${mi}`;
  mi += 1;
  let arranged = items;
  if (title === "视图") {
    const zoom = new Set(["cad.pan", "cad.regen", "cad.zoomext", "cad.zoomin", "cad.zoomout", "cad.zoomsel", "cad.zoomwin"]);
    const rest = items.filter((item) => !zoom.has(item));
    const z = items.filter((item) => zoom.has(item));
    arranged = z.length ? [...rest, "sep", ...z] : rest;
  }
  menuLines.push({ id, title, items: arranged });
}
const menuIdsSeen = new Set(menuLines.flatMap((m) => m.items));
const notInMenu = cs.filter((c) => !menuIdsSeen.has(c.id)).map((c) => c.id);
if (notInMenu.length) throw new Error("菜单没有 " + notInMenu.join(","));

const outTs = new URL("../src/designer/presets/work/hy3d.generated.ts", import.meta.url);
const lines = [];
lines.push("/** 由 scripts/gen-hy3d-template.mjs 从 hy3d ui/commands 和 ui/icons.svg 生成。勿手改。 */");
lines.push("export interface Hy3dCmd { id: string; title: string; category: string; icon: string; keybinding?: string }");
lines.push("export const hy3dFullCommands: Hy3dCmd[] = [");
for (const c of cs) {
  const key = isKey(c.key) ? c.key : "";
  lines.push(
    `  { id: ${JSON.stringify(c.id)}, title: ${JSON.stringify(c.label)}, category: ${JSON.stringify(c.cat)}, icon: ${JSON.stringify(PREFIX + c.icon)}${key ? `, keybinding: ${JSON.stringify(key)}` : ""} },`
  );
}
lines.push("];");
lines.push("");
lines.push(`export const hy3dFullMenus: { id: string; title: string; items: (string | "sep")[] }[] = ${JSON.stringify(menuLines, null, 2)};`);
lines.push("");
lines.push(`export const hy3dFullTabs: { id: string; title: string; panels: { id: string; title: string; ids: string[] }[] }[] = ${JSON.stringify(liveTabs, null, 2)};`);
lines.push("");
fs.writeFileSync(outTs, lines.join("\n"));

const outJson = new URL("../template/src/icons/hy3d.json", import.meta.url);
fs.writeFileSync(outJson, JSON.stringify(iconPack));
console.log(`commands ${cs.length} icons ${symbols.size} tabs ${liveTabs.length} menus ${menuLines.length}`);
