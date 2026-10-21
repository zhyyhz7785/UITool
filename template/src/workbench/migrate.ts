import type { IconConfig, ItemZones, LayoutConfig, PaneTab, SideContainer, ToolItem, ToolRow, UiConfig, ViewSection } from "./types";

interface V1Container {
  id: string;
  title: string;
  icon: string;
  view: string;
  badge?: number;
}
interface V1Status {
  id: string;
  text?: string;
  icon?: string;
  tooltip?: string;
  command?: string;
  kind?: "normal" | "accent";
}

/** 读到任何版本的配置都变成完整的 v2。缺字段用默认补齐，不丢已有内容。 */
export function migrateConfig(raw: unknown): UiConfig {
  const c = (raw ?? {}) as Record<string, unknown>;
  if (c.version === 2 && c.layout && (c.layout as LayoutConfig).toolbars) return fill(c as unknown as UiConfig);
  return fill(fromV1(c));
}

function fromV1(c: Record<string, unknown>): UiConfig {
  const layout = (c.layout ?? {}) as Record<string, Record<string, unknown>>;
  const tb = layout.toolbar ?? {};
  const title = layout.titleBar ?? {};
  const editor = layout.editor ?? {};
  const panel = layout.panel ?? {};
  const activityBar = layout.activityBar ?? {};
  const side = (tb.position === "side");
  const groups = Array.isArray(c.toolbar) ? (c.toolbar as string[][]) : [];
  const row = groupsToRow(groups);
  const status = (c.statusBar ?? {}) as { left?: V1Status[]; right?: V1Status[] };
  const app = (c.app ?? {}) as UiConfig["app"];

  return {
    version: 2,
    app,
    theme: (c.theme as UiConfig["theme"]) ?? { id: "hy-dark", accent: null, overrides: {} },
    density: (c.density as UiConfig["density"]) ?? "compact",
    icons: { style: "hy", areas: {}, overrides: {} },
    layout: {
      titleBar: {
        style: title.style === "native" ? "native" : "custom",
        menu: title.menu === "hidden" ? "hidden" : "inline",
        commandCenter: title.commandCenter !== false,
        appIcon: true,
        left: [],
        right: defaultTitleButtons()
      },
      activityBar: {
        visible: activityBar.visible !== false,
        position: activityBar.position === "top" ? "top" : "side",
        bottom: [{ id: "settings", command: "workbench.action.openSettings", icon: "settings", tooltip: "设置" }]
      },
      primarySideBar: { visible: layout.primarySideBar ? layout.primarySideBar.visible !== false : true, position: layout.primarySideBar?.position === "right" ? "right" : "left", width: num(layout.primarySideBar?.width, 260) },
      auxiliaryBar: { visible: layout.auxiliaryBar?.visible === true, width: num(layout.auxiliaryBar?.width, 280) },
      panel: {
        visible: panel.visible !== false,
        position: panel.position === "right" ? "right" : "bottom",
        size: num(panel.size, 200),
        align: "center",
        actions: defaultPanelActions()
      },
      editor: {
        tabs: editor.tabs !== false,
        breadcrumbs: editor.breadcrumbs !== false,
        tabActions: defaultTabActions(),
        breadcrumbActions: []
      },
      statusBar: { visible: (layout.statusBar?.visible as boolean) !== false },
      dialogStyle: "modal",
      toolbars: {
        top: { visible: !!tb.visible && !side, style: "icon", rows: !side && row ? [row] : [] },
        side: { visible: !!tb.visible && side, position: "left", style: "icon", rows: side && row ? [row] : [] }
      }
    },
    activity: asContainers(c.activity),
    auxiliary: asContainers(c.auxiliary),
    panel: asTabs(c.panel),
    editors: (c.editors as UiConfig["editors"]) ?? [],
    menus: (c.menus as UiConfig["menus"]) ?? [],
    statusBar: { start: (status.left ?? []).map(statusToItem), center: [], end: (status.right ?? []).map(statusToItem) },
    commands: (c.commands as UiConfig["commands"]) ?? []
  };
}

/** 补齐 v2 里后加的字段，旧的 v2 文件也能打开。 */
function fill(c: UiConfig): UiConfig {
  const d = fromV1({});
  const L = c.layout ?? d.layout;
  return {
    ...d,
    ...c,
    version: 2,
    app: { ...d.app, ...c.app },
    theme: { ...d.theme, ...c.theme, overrides: c.theme?.overrides ?? {} },
    icons: { style: c.icons?.style ?? "hy", areas: c.icons?.areas ?? {}, overrides: c.icons?.overrides ?? {} } satisfies IconConfig,
    layout: {
      ...d.layout,
      ...L,
      titleBar: { ...d.layout.titleBar, ...L.titleBar },
      activityBar: { ...d.layout.activityBar, ...L.activityBar },
      primarySideBar: { ...d.layout.primarySideBar, ...L.primarySideBar },
      auxiliaryBar: { ...d.layout.auxiliaryBar, ...L.auxiliaryBar },
      panel: { ...d.layout.panel, ...L.panel },
      editor: { ...d.layout.editor, ...L.editor },
      statusBar: { ...d.layout.statusBar, ...L.statusBar },
      dialogStyle: L.dialogStyle ?? "modal",
      toolbars: {
        top: { ...d.layout.toolbars.top, ...L.toolbars?.top, style: L.toolbars?.top?.style ?? "icon" },
        side: { ...d.layout.toolbars.side, ...L.toolbars?.side, style: L.toolbars?.side?.style ?? "icon" }
      }
    },
    workType: c.workType,
    scheme: c.scheme,
    schemes: c.schemes,
    dialogs: c.dialogs ?? [],
    sidePages: c.sidePages ?? [],
    activity: (c.activity ?? []).map(fillContainer),
    auxiliary: (c.auxiliary ?? []).map(fillContainer),
    panel: c.panel ?? [],
    statusBar: { start: c.statusBar?.start ?? [], center: c.statusBar?.center ?? [], end: c.statusBar?.end ?? [] }
  };
}

function fillContainer(x: SideContainer): SideContainer {
  return {
    ...x,
    header: x.header ?? "show",
    headerActions: x.headerActions ?? [],
    bottomOrder: x.bottomOrder ?? "down",
    sections: (x.sections ?? []).map((s) => ({ ...s, anchor: s.anchor ?? "top", header: s.header ?? true, actions: s.actions ?? [] }))
  };
}

function asContainers(v: unknown): SideContainer[] {
  if (!Array.isArray(v)) return [];
  return (v as (V1Container | SideContainer)[]).map((x) => ("sections" in x && x.sections ? fillContainer(x as SideContainer) : containerFrom(x as V1Container)));
}

function asTabs(v: unknown): PaneTab[] {
  if (!Array.isArray(v)) return [];
  return (v as (V1Container | PaneTab)[]).map((x) => ("view" in x ? { id: x.id, title: x.title, icon: x.icon, view: (x as V1Container).view, badge: x.badge } : (x as PaneTab)));
}

function containerFrom(x: V1Container): SideContainer {
  return {
    id: x.id,
    title: x.title,
    icon: x.icon,
    badge: x.badge,
    header: "show",
    headerActions: [],
    bottomOrder: "down",
    sections: [sectionOf(x.id, x.title, x.view, x.icon, false)]
  };
}

function sectionOf(id: string, title: string, view: string, icon?: string, header = true): ViewSection {
  return { id, title, view, icon, anchor: "top", header, actions: [] };
}

function statusToItem(s: V1Status): ToolItem {
  return { id: s.id, text: s.text, icon: s.icon, tooltip: s.tooltip, command: s.command, kind: s.kind };
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" ? v : fallback;
}

function groupsToRow(groups: string[][]): ToolRow | null {
  const start: ToolItem[] = [];
  groups.forEach((g, gi) => {
    if (gi) start.push({ id: `sep-${gi}`, separator: true });
    g.forEach((command) => start.push({ id: command, command }));
  });
  return start.length ? { id: "row-1", start, center: [], end: [] } : null;
}

function defaultTitleButtons(): ToolItem[] {
  return [
    { id: "tb-side", command: "workbench.action.toggleSidebarVisibility", icon: "sideleft", tooltip: "切换主侧栏" },
    { id: "tb-panel", command: "workbench.action.togglePanel", icon: "bottom", tooltip: "切换面板" },
    { id: "tb-aux", command: "workbench.action.toggleAuxiliaryBar", icon: "sideright", tooltip: "切换辅助侧栏" }
  ];
}

function defaultPanelActions(): ToolItem[] {
  return [
    { id: "panel-move", command: "workbench.action.togglePanelPosition", icon: "sideright", tooltip: "移到右侧" },
    { id: "panel-close", command: "workbench.action.togglePanel", icon: "x", tooltip: "关闭面板" }
  ];
}

function defaultTabActions(): ToolItem[] {
  return [
    { id: "tab-split", icon: "split", tooltip: "拆分编辑器" },
    { id: "tab-more", icon: "more", tooltip: "更多操作" }
  ];
}

export function emptyZones(): ItemZones {
  return { start: [], center: [], end: [] };
}

export function newRow(id: string): ToolRow {
  return { id, ...emptyZones() };
}
