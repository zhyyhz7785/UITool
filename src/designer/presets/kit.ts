import type { AppMeta, CommandDef, DialogAction, DialogDef, EditorItem, ItemZones, LayoutConfig, Menu, PaneTab, SchemeUi, SideContainer, ToolItem, ToolRow, ViewSection } from "@tpl/workbench/types";

export type SchemeTier = "best" | "good" | "basic";

export interface SchemeScore {
  efficiency: number;
  aesthetic: number;
  learn: number;
}

export interface SchemeDef {
  id: string;
  tier: SchemeTier;
  name: string;
  desc: string;
  source: string;
  reason: string;
  score: SchemeScore;
  ui: SchemeUi;
  /** 这一档自己的顶栏菜单。不填就用工作类型共用的那套。 */
  menus?: Menu[];
}

export interface WorkTypeDef {
  id: string;
  name: string;
  summary: string;
  /** 三套方案必须引用的视图 id，多了少了都不行 */
  views: string[];
  commands: CommandDef[];
  menus: Menu[];
  dialogs: DialogDef[];
  schemes: SchemeDef[];
}

export function cmd(id: string, title: string, category: string, icon: string, extra?: { keybinding?: string; core?: string }): CommandDef {
  return { id, title, category, icon, ...extra };
}

export function menu(id: string, title: string, items: (string | "sep")[]): Menu {
  return { id, title, items: items.map((x) => (x === "sep" ? { separator: true } : { command: x })) };
}

export const viewMenu = menu("view", "视图", [
  "workbench.action.selectScheme",
  "sep",
  "workbench.action.toggleSidebarVisibility",
  "workbench.action.toggleAuxiliaryBar",
  "workbench.action.togglePanel",
  "workbench.action.toggleToolbarPosition"
]);

export function dialog(def: DialogDef): DialogDef {
  return def;
}

export function okCancel(ok = "确定"): DialogAction[] {
  return [
    { id: "cancel", label: "取消" },
    { id: "ok", label: ok, primary: true }
  ];
}

export function look(id: string, density: SchemeUi["density"] = "compact", accent: string | null = null): Pick<SchemeUi, "theme" | "density" | "icons"> {
  return { theme: { id, accent, overrides: {} }, density, icons: { style: "hy", areas: {}, overrides: {} } };
}

const titleRight: ToolItem[] = [
  { id: "tb-side", command: "workbench.action.toggleSidebarVisibility", icon: "sideleft", tooltip: "切换主侧栏" },
  { id: "tb-panel", command: "workbench.action.togglePanel", icon: "bottom", tooltip: "切换面板" },
  { id: "tb-aux", command: "workbench.action.toggleAuxiliaryBar", icon: "sideright", tooltip: "切换辅助侧栏" }
];

export function baseLayout(): LayoutConfig {
  return {
    titleBar: { style: "custom", menu: "inline", commandCenter: false, appIcon: true, left: [], right: titleRight.map((x) => ({ ...x })) },
    activityBar: { visible: false, position: "side", bottom: [] },
    primarySideBar: { visible: true, position: "left", width: 240 },
    auxiliaryBar: { visible: true, width: 280 },
    panel: {
      visible: false,
      position: "bottom",
      size: 180,
      align: "center",
      actions: [
        { id: "panel-move", command: "workbench.action.togglePanelPosition", icon: "sideright", tooltip: "移到右侧" },
        { id: "panel-close", command: "workbench.action.togglePanel", icon: "x", tooltip: "关闭面板" }
      ]
    },
    editor: { tabs: true, breadcrumbs: false, tabActions: [], breadcrumbActions: [] },
    statusBar: { visible: true },
    dialogStyle: "modal",
    toolbars: {
      top: { visible: false, style: "icon", rows: [] },
      side: { visible: false, position: "left", style: "icon", rows: [] }
    }
  };
}

export function row(id: string, title: string, commands: string[]): ToolRow {
  return { id, title, start: commands.map((command) => ({ id: `${id}-${command}`, command })), center: [], end: [] };
}

export function section(id: string, title: string, icon: string, view: string, anchor: "top" | "bottom" = "top"): ViewSection {
  return { id, title, view, icon, anchor, header: true, actions: [] };
}

export function box(id: string, title: string, icon: string, view: string): SideContainer {
  return stack(id, title, icon, [section(id, title, icon, view)]);
}

export function stack(id: string, title: string, icon: string, sections: ViewSection[]): SideContainer {
  return { id, title, icon, header: "show", headerActions: [], bottomOrder: "down", sections };
}

export function tab(id: string, title: string, icon: string, view: string): PaneTab {
  return { id, title, icon, view };
}

export function editor(id: string, title: string, icon: string, view: string): EditorItem {
  return { id, title, icon, view };
}

export function zones(start: ToolItem[] = [], end: ToolItem[] = []): ItemZones {
  return { start, center: [], end };
}

export function chip(id: string, text: string, icon?: string): ToolItem {
  return { id, text, icon };
}

export function viewIds(ui: SchemeUi): string[] {
  const ids = new Set<string>();
  for (const b of [...ui.activity, ...ui.auxiliary]) for (const s of b.sections) ids.add(s.view);
  for (const p of ui.panel) ids.add(p.view);
  for (const e of ui.editors) ids.add(e.view);
  return [...ids].sort();
}

export function scoreTotal(s: SchemeScore): number {
  return s.efficiency + s.aesthetic + s.learn;
}

export function assertWorkType(t: WorkTypeDef) {
  const tiers = [...t.schemes.map((s) => s.tier)].sort().join(",");
  if (tiers !== "basic,best,good") throw new Error(`${t.id} 档位不全：${tiers}`);
  const totals = Object.fromEntries(t.schemes.map((s) => [s.tier, scoreTotal(s.score)]));
  if (!(totals.best > totals.good && totals.good > totals.basic)) throw new Error(`${t.id} 分数顺序不对 ${JSON.stringify(totals)}`);
  const want = [...t.views].sort().join(",");
  for (const s of t.schemes) {
    const sc = s.score;
    if (sc.efficiency > 60 || sc.aesthetic > 25 || sc.learn > 15 || sc.efficiency < 0) throw new Error(`${t.id}/${s.id} 分数超出范围`);
    const got = viewIds(s.ui).join(",");
    if (got !== want) throw new Error(`${t.id}/${s.id} 视图不一致\n有 ${got}\n要 ${want}`);
  }
  const menuCmds = new Set(t.menus.flatMap((m) => m.items.map((i) => i.command).filter((x): x is string => !!x)));
  for (const c of t.commands) if (!menuCmds.has(c.id)) throw new Error(`${t.id} 菜单没有命令 ${c.id}`);
  const ids = new Set(t.commands.map((c) => c.id));
  if (ids.size !== t.commands.length) throw new Error(`${t.id} 命令 id 重复`);
  for (const d of t.dialogs) if (!ids.has(d.command)) throw new Error(`${t.id} 弹窗 ${d.id} 的命令不存在`);
}

export function appMeta(id: string, title: string, description: string): AppMeta {
  return { name: id, title, identifier: `com.hy.${id}`, version: "0.1.0", description, icon: "layout" };
}
