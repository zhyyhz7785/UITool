import { builtinCommands } from "@tpl/workbench/commands";
import type { ToolGroup, ToolItem, ToolRow, ToolSlot, UiConfig } from "@tpl/workbench/types";
import type { Selection } from "./store";
import { findMenu, locateSlot, nid, parseToolbarRow, removeSlot, ribbonSlots, setZoneItems, updateSlot, writeGroups, zoneItems } from "./zones";

export type SelKind = "item" | "menu" | "row" | "other";

export function kindOf(c: UiConfig, s: Selection): SelKind {
  if (s.row && !s.item) return "row";
  if (s.zone?.startsWith("menu:") && !s.item) return "menu";
  if (s.zone && s.item && (zoneItems(c, s.zone)?.some((x) => x.id === s.item) || locateSlot(c, s.zone, s.item))) return "item";
  return "other";
}

function commandName(c: UiConfig, id: string) {
  return c.commands.find((x) => x.id === id)?.title ?? builtinCommands[id]?.title ?? id;
}

export function describe(c: UiConfig, s: Selection): string {
  if (s.row === "title") return "标题栏一排";
  if (s.row === "menu") return "菜单一排";
  if (s.row) {
    const p = parseToolbarRow(s.row);
    if (p) {
      const rows = c.layout.toolbars[p.which].rows;
      const row = rows.find((r) => r.id === p.id);
      const name = row?.title || `第 ${Math.max(1, rows.findIndex((r) => r.id === p.id) + 1)} 排`;
      return `${p.which === "top" ? "上侧" : "侧面"} · ${name}`;
    }
  }
  if (s.zone?.startsWith("menu:")) return findMenu(c, s.zone)?.title ?? "菜单";
  if (s.item && s.zone) {
    const it = zoneItems(c, s.zone)?.find((x) => x.id === s.item);
    if (it) return it.text || it.tooltip || (it.command ? commandName(c, it.command) : it.separator ? "分隔线" : it.id);
    const slot = locateSlot(c, s.zone, s.item);
    if (slot) return slot.slot.text || commandName(c, slot.slot.command);
    if (s.item === "command-center") return "命令中心";
    if (s.item === "title-text") return "标题";
    if (s.item === "appicon") return "应用图标";
  }
  return s.zone ?? s.part;
}

function uniq(ids: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function commandsOf(c: UiConfig, s: Selection): string[] {
  const slot = s.zone && s.item ? locateSlot(c, s.zone, s.item) : null;
  if (slot) return uniq([slot.slot.command, ...(slot.slot.menu ?? [])]);
  if (s.zone && s.item) {
    const it = zoneItems(c, s.zone)?.find((x) => x.id === s.item);
    if (!it || it.separator) return [];
    return uniq([...(it.command ? [it.command] : []), ...(it.menu ?? [])]);
  }
  return [];
}

function removeItem(c: UiConfig, s: Selection): UiConfig {
  if (s.zone && s.item && locateSlot(c, s.zone, s.item)) return removeSlot(c, s.zone, s.item);
  if (s.zone && s.item && zoneItems(c, s.zone)) return setZoneItems(c, s.zone, (zoneItems(c, s.zone) ?? []).filter((x) => x.id !== s.item));
  return c;
}

/** 保留的按钮做面，其余按钮的命令进它的右键下拉，并从原处删掉。 */
export function mergeAsMenu(c: UiConfig, keep: Selection, drops: Selection[]): UiConfig {
  if (!keep.zone || !keep.item) return c;
  const extra = drops.flatMap((s) => commandsOf(c, s));
  let next = c;
  for (const s of drops) next = removeItem(next, s);
  const slot = locateSlot(next, keep.zone, keep.item);
  if (slot) {
    const menu = uniq([...(slot.slot.menu ?? []), ...extra].filter((id) => id !== slot.slot.command));
    return updateSlot(next, keep.zone, keep.item, { menu, menuOn: "right" });
  }
  const items = zoneItems(next, keep.zone);
  const it = items?.find((x) => x.id === keep.item);
  if (!items || !it) return next;
  const menu = uniq([...(it.menu ?? []), ...extra].filter((id) => id !== it.command));
  return setZoneItems(next, keep.zone, items.map((x) => (x.id === it.id ? { ...x, menu } : x)));
}

/** 把右键下拉里的命令拆回旁边的按钮。 */
export function splitMenu(c: UiConfig, s: Selection): UiConfig {
  if (!s.zone || !s.item) return c;
  const slot = locateSlot(c, s.zone, s.item);
  if (slot?.slot.menu?.length) {
    const slots = ribbonSlots(slot.group);
    const added: ToolSlot[] = slot.slot.menu.map((command) => ({ command, size: "small" }));
    const next = [...slots.slice(0, slot.index), { ...slot.slot, menu: undefined, menuOn: undefined }, ...added, ...slots.slice(slot.index + 1)];
    return replaceGroupSlots(c, slot.which, slot.rowId, slot.group, next);
  }
  const items = zoneItems(c, s.zone);
  const index = items?.findIndex((x) => x.id === s.item) ?? -1;
  const it = index >= 0 ? items?.[index] : undefined;
  if (!items || !it?.menu?.length) return c;
  const added: ToolItem[] = it.menu.map((command) => ({ id: nid("btn"), command, icon: c.commands.find((x) => x.id === command)?.icon }));
  const next = [...items.slice(0, index), { ...it, menu: undefined }, ...added, ...items.slice(index + 1)];
  return setZoneItems(c, s.zone, next);
}

function replaceGroupSlots(c: UiConfig, which: "top" | "side", rowId: string, group: ToolGroup, slots: ToolSlot[]): UiConfig {
  const row = c.layout.toolbars[which].rows.find((r) => r.id === rowId);
  if (!row?.groups) return c;
  const commands = syncLoose(group, slots);
  const groups = row.groups.map((g) => (g.id === group.id ? { ...g, slots, commands } : g));
  return writeGroups(c, which, rowId, groups);
}

function syncLoose(group: ToolGroup, slots: ToolSlot[]): string[] {
  const old = new Set(ribbonSlots(group).flatMap((s) => [s.command, ...(s.menu ?? [])]));
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

function zonesOf(row: ToolRow): ToolGroup[] {
  const commands = [...row.start, ...row.center, ...row.end].map((i) => i.command).filter((id): id is string => !!id);
  if (!commands.length) return [];
  return [{ id: nid("grp"), title: row.title || "合并", commands, slots: commands.map((command) => ({ command, size: "small" as const })) }];
}

function appendRow(keep: ToolRow, other: ToolRow): ToolRow {
  if (keep.groups || other.groups) {
    const groups = [...(keep.groups ?? zonesOf(keep)), ...(other.groups ?? zonesOf(other))];
    const start = groups.flatMap((g) => g.commands.filter(Boolean).map((command) => ({ id: `${keep.id}-${g.id}-${command}`, command })));
    return { ...keep, groups, start, center: [], end: [] };
  }
  return { ...keep, start: [...keep.start, ...other.start], center: [...keep.center, ...other.center], end: [...keep.end, ...other.end] };
}

/** 标题栏和菜单排收成一排；同一侧的工具栏排按顺序拼进保留的那一排。 */
export function mergeRows(c: UiConfig, keep: Selection, drops: Selection[]): UiConfig {
  const rows = [keep, ...drops].map((s) => s.row).filter((x): x is string => !!x);
  let next = c;
  if (rows.includes("title") && rows.includes("menu")) {
    next = { ...next, layout: { ...next.layout, titleBar: { ...next.layout.titleBar, menu: "inline" } } };
  }
  const keepTb = keep.row ? parseToolbarRow(keep.row) : null;
  if (!keepTb) return next;
  const dropIds = drops.map((s) => (s.row ? parseToolbarRow(s.row) : null)).filter((p): p is { which: "top" | "side"; id: string } => !!p && p.which === keepTb.which && p.id !== keepTb.id);
  if (!dropIds.length) return next;
  const bar = next.layout.toolbars[keepTb.which];
  let row = bar.rows.find((r) => r.id === keepTb.id);
  if (!row) return next;
  for (const d of dropIds) {
    const other = bar.rows.find((r) => r.id === d.id);
    if (other) row = appendRow(row, other);
  }
  const gone = new Set(dropIds.map((d) => d.id));
  const rowsNext = bar.rows.filter((r) => r.id === keepTb.id || !gone.has(r.id)).map((r) => (r.id === keepTb.id ? row! : r));
  return { ...next, layout: { ...next.layout, toolbars: { ...next.layout.toolbars, [keepTb.which]: { ...bar, rows: rowsNext } } } };
}

/** 被合并菜单的项接到保留菜单后面，中间加一条分隔线。 */
export function mergeMenus(c: UiConfig, keep: Selection, drops: Selection[]): UiConfig {
  const id = keep.zone?.startsWith("menu:") ? keep.zone.slice(5) : "";
  const base = c.menus.find((m) => m.id === id);
  if (!base) return c;
  let items = [...base.items];
  const remove = new Set<string>();
  for (const d of drops) {
    const mid = d.zone?.startsWith("menu:") ? d.zone.slice(5) : "";
    if (!mid || mid === id) continue;
    const menu = c.menus.find((m) => m.id === mid);
    if (!menu) continue;
    items = [...items, { id: nid("sep"), separator: true }, ...menu.items];
    remove.add(mid);
  }
  if (!remove.size) return c;
  return { ...c, menus: c.menus.filter((m) => !remove.has(m.id)).map((m) => (m.id === id ? { ...m, items } : m)) };
}

export function deleteSelections(c: UiConfig, drops: Selection[]): UiConfig {
  let next = c;
  for (const s of drops) {
    if (kindOf(next, s) === "item") next = removeItem(next, s);
    else if (s.zone?.startsWith("menu:") && !s.item) {
      const id = s.zone.slice(5);
      next = { ...next, menus: next.menus.filter((m) => m.id !== id) };
    } else if (s.row) {
      const p = parseToolbarRow(s.row);
      if (!p) continue;
      const bar = next.layout.toolbars[p.which];
      next = { ...next, layout: { ...next.layout, toolbars: { ...next.layout.toolbars, [p.which]: { ...bar, rows: bar.rows.filter((r) => r.id !== p.id) } } } };
    }
  }
  return next;
}
