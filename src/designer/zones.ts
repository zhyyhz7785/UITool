import type { ItemZones, Menu, MenuItem, PaneTab, SideContainer, ToolGroup, ToolItem, ToolRow, ToolSlot, UiConfig, ViewSection } from "@tpl/workbench/types";
import type { Selection } from "./store";

export const nid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 6)}`;

const ZONES = ["start", "center", "end"] as const;
export type ZoneName = (typeof ZONES)[number];

/** 某个 data-zone 对应的按钮列表。管不到的区域返回 null。 */
export function zoneItems(c: UiConfig, zone: string): ToolItem[] | null {
  if (zone === "title-left") return c.layout.titleBar.left;
  if (zone === "title-center") return c.layout.titleBar.center ?? [];
  if (zone === "title-right") return c.layout.titleBar.right;
  if (zone === "activity-bottom") return c.layout.activityBar.bottom;
  if (zone === "tab-actions") return c.layout.editor.tabActions;
  if (zone === "crumb-actions") return c.layout.editor.breadcrumbActions;
  if (zone === "panel-actions") return c.layout.panel.actions;
  const status = /^status:(start|center|end)$/.exec(zone);
  if (status) return c.statusBar[status[1] as ZoneName];
  const bar = /^tb:(top|side):([^:]+):(start|center|end)$/.exec(zone);
  if (bar) {
    const row = c.layout.toolbars[bar[1] as "top" | "side"].rows.find((r) => r.id === bar[2]);
    return row ? row[bar[3] as ZoneName] : null;
  }
  const header = /^side:([^:]+):header$/.exec(zone);
  if (header) return findContainer(c, header[1])?.headerActions ?? null;
  const sec = /^sec:(.+)$/.exec(zone);
  if (sec) return findSection(c, sec[1])?.actions ?? null;
  return null;
}

export function setZoneItems(c: UiConfig, zone: string, items: ToolItem[]): UiConfig {
  const lay = <K extends keyof UiConfig["layout"]>(k: K, v: UiConfig["layout"][K]) => ({ ...c, layout: { ...c.layout, [k]: v } });
  if (zone === "title-left") return lay("titleBar", { ...c.layout.titleBar, left: items });
  if (zone === "title-center") return lay("titleBar", { ...c.layout.titleBar, center: items });
  if (zone === "title-right") return lay("titleBar", { ...c.layout.titleBar, right: items });
  if (zone === "activity-bottom") return lay("activityBar", { ...c.layout.activityBar, bottom: items });
  if (zone === "tab-actions") return lay("editor", { ...c.layout.editor, tabActions: items });
  if (zone === "crumb-actions") return lay("editor", { ...c.layout.editor, breadcrumbActions: items });
  if (zone === "panel-actions") return lay("panel", { ...c.layout.panel, actions: items });
  const status = /^status:(start|center|end)$/.exec(zone);
  if (status) return { ...c, statusBar: { ...c.statusBar, [status[1]]: items } };
  const bar = /^tb:(top|side):([^:]+):(start|center|end)$/.exec(zone);
  if (bar) {
    const which = bar[1] as "top" | "side";
    const rows = c.layout.toolbars[which].rows.map((r) => (r.id === bar[2] ? { ...r, [bar[3]]: items } : r));
    return { ...c, layout: { ...c.layout, toolbars: { ...c.layout.toolbars, [which]: { ...c.layout.toolbars[which], rows } } } };
  }
  const header = /^side:([^:]+):header$/.exec(zone);
  if (header) return mapContainer(c, header[1], (box) => ({ ...box, headerActions: items }));
  const sec = /^sec:(.+)$/.exec(zone);
  if (sec) return mapSection(c, sec[1], (s) => ({ ...s, actions: items }));
  return c;
}

export function siblingZones(zone: string): { id: string; label: string }[] {
  const status = /^status:(start|center|end)$/.exec(zone);
  if (status) return [
    { id: "status:start", label: "左" },
    { id: "status:center", label: "中" },
    { id: "status:end", label: "右" }
  ];
  const bar = /^tb:(top|side):([^:]+):(start|center|end)$/.exec(zone);
  if (bar) {
    const prefix = `tb:${bar[1]}:${bar[2]}`;
    return [
      { id: `${prefix}:start`, label: "左 / 上" },
      { id: `${prefix}:center`, label: "中" },
      { id: `${prefix}:end`, label: "右 / 下" }
    ];
  }
  if (zone === "title-left" || zone === "title-center" || zone === "title-right") return [
    { id: "title-left", label: "左侧" },
    { id: "title-center", label: "中间" },
    { id: "title-right", label: "右侧" }
  ];
  return [];
}

export function findContainer(c: UiConfig, id: string): SideContainer | undefined {
  return [...c.activity, ...c.auxiliary].find((x) => x.id === id);
}

export function findSection(c: UiConfig, id: string): ViewSection | undefined {
  for (const box of [...c.activity, ...c.auxiliary]) {
    const s = box.sections.find((x) => x.id === id);
    if (s) return s;
  }
  return undefined;
}

export function mapContainer(c: UiConfig, id: string, fn: (box: SideContainer) => SideContainer): UiConfig {
  const map = (list: SideContainer[]) => list.map((x) => (x.id === id ? fn(x) : x));
  return { ...c, activity: map(c.activity), auxiliary: map(c.auxiliary) };
}

export function mapSection(c: UiConfig, id: string, fn: (s: ViewSection) => ViewSection): UiConfig {
  const map = (list: SideContainer[]) => list.map((box) => ({ ...box, sections: box.sections.map((s) => (s.id === id ? fn(s) : s)) }));
  return { ...c, activity: map(c.activity), auxiliary: map(c.auxiliary) };
}

export function containersOf(c: UiConfig, part: "sidebar" | "auxiliarybar"): SideContainer[] {
  return part === "sidebar" ? c.activity : c.auxiliary;
}

export function setContainers(c: UiConfig, part: "sidebar" | "auxiliarybar", list: SideContainer[]): UiConfig {
  return part === "sidebar" ? { ...c, activity: list } : { ...c, auxiliary: list };
}

export function findMenu(c: UiConfig, zone?: string): Menu | undefined {
  const m = zone && /^menu:(.+)$/.exec(zone);
  return m ? c.menus.find((x) => x.id === m[1]) : undefined;
}

export function emptyZones(): ItemZones {
  return { start: [], center: [], end: [] };
}

export function rowOf(rows: ToolRow[], id: string): ToolRow | undefined {
  return rows.find((r) => r.id === id);
}

export type { PaneTab };

export function reorderById<T extends { id: string }>(list: T[], fromId: string, toId: string): T[] {
  const from = list.findIndex((x) => x.id === fromId);
  const to = list.findIndex((x) => x.id === toId);
  if (from < 0 || to < 0 || from === to) return list;
  const next = [...list];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

export function orderById<T extends { id: string }>(list: T[], ids: string[]): T[] {
  const map = new Map(list.map((x) => [x.id, x]));
  const next: T[] = [];
  for (const id of ids) {
    const it = map.get(id);
    if (it) next.push(it);
  }
  for (const it of list) if (!ids.includes(it.id)) next.push(it);
  return next;
}

export function parseGroupZone(zone: string): { which: "top" | "side"; rowId: string } | null {
  const m = /^tbg:(top|side):(.+)$/.exec(zone);
  return m ? { which: m[1] as "top" | "side", rowId: m[2] } : null;
}

export function parseToolbarRow(row: string): { which: "top" | "side"; id: string } | null {
  const m = /^tb:(top|side):(.+)$/.exec(row);
  return m ? { which: m[1] as "top" | "side", id: m[2] } : null;
}

/** 功能区按钮的 data-item：组 id / 命令 id。 */
export function parseRibbonItem(item: string): { groupId: string; command: string } | null {
  const i = item.indexOf("/");
  if (i <= 0) return null;
  return { groupId: item.slice(0, i), command: item.slice(i + 1) };
}

export function ribbonSlots(group: ToolGroup): ToolSlot[] {
  if (group.slots?.length) return group.slots;
  return group.commands.filter(Boolean).map((command, i) => ({ command, size: i === 0 ? "big" as const : "small" as const }));
}

function coveredIds(slots: ToolSlot[]) {
  const ids = new Set<string>();
  for (const slot of slots) {
    if (slot.command) ids.add(slot.command);
    for (const id of slot.menu ?? []) ids.add(id);
  }
  return ids;
}

function syncCommands(group: ToolGroup, slots: ToolSlot[]): string[] {
  const old = coveredIds(ribbonSlots(group));
  const overflow = group.commands.filter((id) => id && !old.has(id));
  const seen = new Set<string>();
  const commands: string[] = [];
  const add = (id?: string) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    commands.push(id);
  };
  for (const slot of slots) {
    add(slot.command);
    for (const id of slot.menu ?? []) add(id);
  }
  for (const id of overflow) add(id);
  return commands;
}

function rowWithGroups(row: ToolRow, groups: ToolGroup[]): ToolRow {
  const start = groups.flatMap((g) => g.commands.filter(Boolean).map((command) => ({ id: `${row.id}-${g.id}-${command}`, command })));
  return { ...row, groups, start, center: [], end: [] };
}

export function writeGroups(c: UiConfig, which: "top" | "side", rowId: string, groups: ToolGroup[]): UiConfig {
  const rows = c.layout.toolbars[which].rows.map((r) => (r.id === rowId ? rowWithGroups(r, groups) : r));
  return { ...c, layout: { ...c.layout, toolbars: { ...c.layout.toolbars, [which]: { ...c.layout.toolbars[which], rows } } } };
}

export interface SlotLoc {
  which: "top" | "side";
  rowId: string;
  group: ToolGroup;
  slot: ToolSlot;
  index: number;
}

export function locateSlot(c: UiConfig, zone: string, item: string): SlotLoc | null {
  const parsed = parseGroupZone(zone);
  const ref = parseRibbonItem(item);
  if (!parsed || !ref) return null;
  const row = c.layout.toolbars[parsed.which].rows.find((r) => r.id === parsed.rowId);
  const group = row?.groups?.find((g) => g.id === ref.groupId);
  if (!row || !group) return null;
  const slots = ribbonSlots(group);
  const index = slots.findIndex((s) => s.command === ref.command);
  if (index < 0) return null;
  return { which: parsed.which, rowId: row.id, group, slot: slots[index], index };
}

function mapGroups(c: UiConfig, loc: { which: "top" | "side"; rowId: string }, fn: (g: ToolGroup) => ToolGroup): UiConfig {
  const row = c.layout.toolbars[loc.which].rows.find((r) => r.id === loc.rowId);
  if (!row?.groups) return c;
  return writeGroups(c, loc.which, loc.rowId, row.groups.map(fn));
}

export function updateSlot(c: UiConfig, zone: string, item: string, patch: Partial<ToolSlot>): UiConfig {
  const loc = locateSlot(c, zone, item);
  if (!loc) return c;
  const slots = ribbonSlots(loc.group).map((s, i) => (i === loc.index ? { ...s, ...patch } : s));
  const group = { ...loc.group, slots, commands: syncCommands(loc.group, slots) };
  return mapGroups(c, loc, (g) => (g.id === loc.group.id ? group : g));
}

export function orderSlots(c: UiConfig, zone: string, groupId: string, itemIds: string[]): UiConfig {
  const parsed = parseGroupZone(zone);
  if (!parsed) return c;
  const row = c.layout.toolbars[parsed.which].rows.find((r) => r.id === parsed.rowId);
  const group = row?.groups?.find((g) => g.id === groupId);
  if (!group) return c;
  const slots = ribbonSlots(group);
  const map = new Map(slots.map((s) => [groupId + "/" + s.command, s]));
  const next = itemIds.map((id) => map.get(id)).filter((s): s is ToolSlot => !!s);
  for (const s of slots) if (!itemIds.includes(groupId + "/" + s.command)) next.push(s);
  return mapGroups(c, { which: parsed.which, rowId: parsed.rowId }, (g) => (g.id === groupId ? { ...g, slots: next, commands: syncCommands(g, next) } : g));
}

export function removeSlot(c: UiConfig, zone: string, item: string): UiConfig {
  const loc = locateSlot(c, zone, item);
  if (!loc) return c;
  const slots = ribbonSlots(loc.group).filter((_, i) => i !== loc.index);
  return mapGroups(c, loc, (g) => (g.id === loc.group.id ? { ...g, slots, commands: syncCommands(loc.group, slots) } : g));
}

function menuItemKey(it: MenuItem, i: number) {
  return it.id ?? `item-${i}`;
}

export function reorderMenuItems(items: MenuItem[], fromKey: string, toKey: string): MenuItem[] {
  const keys = items.map(menuItemKey);
  const from = keys.indexOf(fromKey);
  const to = keys.indexOf(toKey);
  if (from < 0 || to < 0 || from === to) return items;
  const next = [...items];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

/** 预览里松开拖动：同一区域内换位置。换不了就原样返回。 */
export function applyDrag(c: UiConfig, from: Selection, to: Selection): UiConfig {
  if (!from.item || !to.item || from.item === to.item) return c;
  if (from.item.startsWith("menu:") && to.item.startsWith("menu:")) {
    const menus = reorderById(c.menus, from.item.slice(5), to.item.slice(5));
    return menus === c.menus ? c : { ...c, menus };
  }
  if (from.zone?.startsWith("menu:") && from.zone === to.zone) {
    const menu = findMenu(c, from.zone);
    if (!menu) return c;
    const items = reorderMenuItems(menu.items, from.item, to.item);
    if (items === menu.items) return c;
    return { ...c, menus: c.menus.map((m) => (m.id === menu.id ? { ...m, items } : m)) };
  }
  if (from.zone?.startsWith("tbg:") && from.zone === to.zone) return dragRibbon(c, from.zone, from.item, to.item);
  if (from.zone && from.zone === to.zone && zoneItems(c, from.zone)) {
    const items = zoneItems(c, from.zone)!;
    const next = reorderById(items, from.item, to.item);
    return next === items ? c : setZoneItems(c, from.zone, next);
  }
  return c;
}

function dragRibbon(c: UiConfig, zone: string, fromItem: string, toItem: string): UiConfig {
  const from = parseRibbonItem(fromItem);
  const to = parseRibbonItem(toItem);
  if (from && to) return moveSlot(c, zone, fromItem, toItem);
  if (!from && !to) {
    const parsed = parseGroupZone(zone);
    const row = parsed && c.layout.toolbars[parsed.which].rows.find((r) => r.id === parsed.rowId);
    if (!parsed || !row?.groups) return c;
    const groups = reorderById(row.groups, fromItem, toItem);
    return groups === row.groups ? c : writeGroups(c, parsed.which, parsed.rowId, groups);
  }
  return c;
}

function moveSlot(c: UiConfig, zone: string, fromItem: string, toItem: string): UiConfig {
  const a = locateSlot(c, zone, fromItem);
  const b = locateSlot(c, zone, toItem);
  if (!a || !b || (a.group.id === b.group.id && a.index === b.index)) return c;
  if (a.group.id === b.group.id) {
    const slots = [...ribbonSlots(a.group)];
    const [it] = slots.splice(a.index, 1);
    slots.splice(b.index, 0, it);
    return mapGroups(c, a, (g) => (g.id === a.group.id ? { ...g, slots, commands: syncCommands(a.group, slots) } : g));
  }
  const fromSlots = ribbonSlots(a.group).filter((_, i) => i !== a.index);
  const toSlots = [...ribbonSlots(b.group)];
  toSlots.splice(b.index, 0, a.slot);
  const row = c.layout.toolbars[a.which].rows.find((r) => r.id === a.rowId);
  if (!row?.groups) return c;
  const groups = row.groups.map((g) => {
    if (g.id === a.group.id) return { ...g, slots: fromSlots, commands: syncCommands(a.group, fromSlots) };
    if (g.id === b.group.id) return { ...g, slots: toSlots, commands: syncCommands(b.group, toSlots) };
    return g;
  });
  return writeGroups(c, a.which, a.rowId, groups);
}
