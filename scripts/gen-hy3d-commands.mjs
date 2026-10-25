// 从 hy3d ui/commands.json 的 include 清单生成 UITool 的命令表。改命令先改 JSON，再跑本脚本。
// HY3D_COMMANDS 指向 ui/commands.json。HY3D_COMMANDS_OUT 只给核对用，缺省仍写 cad.hy3dCommands.ts。
import fs from "node:fs";
import path from "node:path";
import { collectCommands, isShortcut } from "./hy3d-spec.mjs";

const src = process.env.HY3D_COMMANDS ?? "E:/Code/hy3d/ui/commands.json";
const out = process.env.HY3D_COMMANDS_OUT ? path.resolve(process.env.HY3D_COMMANDS_OUT) : new URL("../src/designer/presets/work/cad.hy3dCommands.ts", import.meta.url);
const doc = JSON.parse(fs.readFileSync(src, "utf8"));
const cs = await collectCommands(doc, (rel) => JSON.parse(fs.readFileSync(path.join(path.dirname(src), rel), "utf8")));

const menuOrder = ["文件", "编辑", "视图", "插入", "绘图", "标注", "修改", "草图", "格式", "图层", "工具", "HY 结构", "外观", "窗口", "帮助"];
const menuIds = ["file", "edit", "view", "insert", "draw", "ann", "modify", "sketch", "format", "layer", "tool", "hy", "look", "window", "help"];
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
for (const id of ["ui.skin.acad-b", "ui.skin.hy-e"]) if (!look.includes(id)) look.push(id);

const ribbonOrder = [
  "默认/文件",
  "默认/绘图",
  "默认/修改",
  "默认/注释",
  "默认/插入",
  "默认/草图与注释",
  "默认/图层",
  "默认/视图",
  "默认/工具",
  "默认/编辑",
  "默认/格式",
  "默认/帮助",
  "HY结构/分析",
  "HY沉降/观测",
  "HY沉降/分析",
  "HY沉降/输出"
];
const ribbon = [];
for (const g of ribbonOrder) {
  const ids = [];
  for (const c of cs) if ((c.place ?? []).includes("ribbon:" + g) && !ids.includes(c.id)) ids.push(c.id);
  if (ids.length) ribbon.push({ id: g.replace(/\//g, "-"), title: g.split("/")[1] || g, commands: ids });
}

const lines = [];
lines.push("/** 由 scripts/gen-hy3d-commands.mjs 从 hy3d ui/commands.json 生成。勿手改。 */");
lines.push("export interface Hy3dCmd { id: string; title: string; category: string; icon: string; keybinding?: string }");
lines.push("export const hy3dCommands: Hy3dCmd[] = [");
for (const c of cs) {
  const toolIcon = { invert: "lu:arrow-right-left", boxsel: "lu:box-select", circlesel: "lu:circle-dashed", cycle: "lu:iteration-ccw", cursel: "lu:crosshair", cursorto: "lu:crosshair", mode: "lu:box", vert: "lu:dot", edge: "lu:minus", face: "lu:triangle", tolayer: "lu:layers" };
  const icon = toolIcon[c.icon] || c.icon || (c.id === "hw.cmdbar" ? "terminal" : "layout");
  const key = isShortcut(c.key) ? c.key : "";
  lines.push(
    `  { id: ${JSON.stringify(c.id)}, title: ${JSON.stringify(c.label)}, category: ${JSON.stringify(c.cat)}, icon: ${JSON.stringify(icon)}${key ? `, keybinding: ${JSON.stringify(key)}` : ""} },`
  );
}
lines.push("];");
lines.push("");
lines.push("export const hy3dMenus: { id: string; title: string; items: (string | \"sep\")[] }[] = [");
let i = 0;
for (const [title, items] of menus) {
  if (!items.length) continue;
  const id = menuIds[i] ?? `m${i}`;
  i += 1;
  const body = title === "视图" ? ["sep", ...items.filter((id) => ["cad.pan", "cad.regen", "cad.zoomext", "cad.zoomin", "cad.zoomout", "cad.zoomsel", "cad.zoomwin"].includes(id) ? false : true)] : items;
  // 视图菜单：先普通项，再分隔，再缩放。上面的写法会丢缩放项，下面重排。
  void body;
  let arranged = items;
  if (title === "视图") {
    const zoom = new Set(["cad.pan", "cad.regen", "cad.zoomext", "cad.zoomin", "cad.zoomout", "cad.zoomsel", "cad.zoomwin"]);
    const rest = items.filter((id) => !zoom.has(id));
    const z = items.filter((id) => zoom.has(id));
    arranged = z.length ? [...rest, "sep", ...z] : rest;
  }
  lines.push(`  { id: ${JSON.stringify(id)}, title: ${JSON.stringify(title)}, items: ${JSON.stringify(arranged)} },`);
}
lines.push("];");
lines.push("");
lines.push(`export const hy3dRibbon: { id: string; title: string; commands: string[] }[] = ${JSON.stringify(ribbon, null, 2)};`);
lines.push("");

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
  if (STATUS.has(id)) return { bucket: "status" };
  if (QUICK.has(id)) return { bucket: "quick" };
  if (STAGE3.has(id)) return { bucket: "more", group: "阶段 3" };
  if (LATER.has(id)) return { bucket: "more", group: "以后再定" };
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
  throw new Error("未分组 " + id + " " + c.cat);
}

const tabOrder = ["默认", "插入", "视图", "管理", "输出", "文件", "结构", "帮助"];
const panelOrder = ["绘图", "修改", "注释", "图层", "实用工具", "剪贴板", "选择", "参照", "缩放与显示", "界面", "样式与选项", "打印与导出", "文档", "梁", "荷载", "求解", "沉降", "帮助"];
const placed = new Map();
for (const c of cs) {
  const g = tabOf(c);
  if (placed.has(c.id)) throw new Error("重复 " + c.id);
  placed.set(c.id, g);
}
if (placed.size !== cs.length) throw new Error("条数 " + placed.size + " != " + cs.length);

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
for (const t of tabs) t.panels.sort((a, b) => panelOrder.indexOf(a.title) - panelOrder.indexOf(b.title));
const quickOrder = ["ui.undo", "ui.redo", "edit.adjust"];
const statusOrder = ["cad.dyn", "cad.grid", "cad.lw", "cad.ortho", "cad.osnap", "cad.otrack", "cad.polar"];
const quick = quickOrder.filter((id) => placed.get(id) && placed.get(id).bucket === "quick");
const statusToggles = statusOrder.filter((id) => placed.get(id) && placed.get(id).bucket === "status");
const moreStage = cs.filter((c) => placed.get(c.id).group === "阶段 3").map((c) => c.id);
const moreLater = cs.filter((c) => placed.get(c.id).group === "以后再定").map((c) => c.id);
const covered = new Set([...tabs.flatMap((t) => t.panels.flatMap((p) => p.ids)), ...quick, ...statusToggles, ...moreStage, ...moreLater]);
if (covered.size !== cs.length) throw new Error("覆盖 " + covered.size + " != " + cs.length);

const blenderMenus = [
  { id: "file", title: "文件", items: [...FILE] },
  { id: "edit", title: "编辑", items: [...QUICK, "sep", ...CLIP] },
  { id: "window", title: "窗口", items: ["view.toolshelf", "view.sidebar", "view.left", "view.right", "hw.cmdbar", "view.bottom", "ui.fullscreen", "ui.resetlayout"] },
  { id: "help", title: "帮助", items: cs.filter((c) => c.cat === "帮助").map((c) => c.id) },
  { id: "more", title: "更多", items: [...moreStage, "sep", ...moreLater] }
];

lines.push(`export const BLENDER_TABS: { id: string; title: string; panels: { id: string; title: string; ids: string[] }[] }[] = ${JSON.stringify(tabs, null, 2)};`);
lines.push(`export const BLENDER_QUICK: string[] = ${JSON.stringify(quick)};`);
lines.push(`export const BLENDER_STATUS: string[] = ${JSON.stringify(statusToggles)};`);
lines.push(`export const BLENDER_MENUS: { id: string; title: string; items: (string | "sep")[] }[] = ${JSON.stringify(blenderMenus, null, 2)};`);
lines.push('export const BENCH_TOP = ["file.new", "file.open", "file.save", "ui.undo", "ui.redo", "cad.zoomext", "cad.pan", "cad.selall"];');
lines.push('export const BENCH_DEF = ["hy.beam", "hy.solve", "hy.combo", "hy.addload", "cad.layer", "hy.insert", "hy.report", "hy.settle"];');
lines.push("");
fs.writeFileSync(out, lines.join("\n"));
const ids = new Set(cs.map((c) => c.id));
const need = [...JSON.parse(fs.readFileSync(out, "utf8").includes("BLENDER_TOOLS") ? "[]" : "[]")];
void need;
const check = ["cad.line", "cad.pline", "cad.circle", "cad.arc", "cad.rect", "cad.move", "cad.copy", "cad.erase", "cad.trim", "cad.offset", "cad.dimlin", "cad.layer", "cad.dimstyle", "file.plot", "hy.beam", "hy.solve"];
const miss = check.filter((id) => !ids.has(id));
if (miss.length) throw new Error("缺少 " + miss.join(","));
console.log(`commands ${cs.length}  menus ${i}  ribbon ${ribbon.length}`);
