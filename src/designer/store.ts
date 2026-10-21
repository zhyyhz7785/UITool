import type { ThemeData } from "@tpl/theme/resolve";
import { builtinThemes } from "@tpl/theme/themes";
import defaultConfig from "@tpl/ui.config.json";
import { migrateConfig } from "@tpl/workbench/migrate";
import { syncActiveScheme } from "@tpl/workbench/schemes";
import type { PartId, UiConfig } from "@tpl/workbench/types";
import { useSyncExternalStore } from "react";

/** 一份设计 = 导出工程的 ui.config.json + 自定义主题。保存成 .uitool.json。 */
export interface DesignDoc {
  config: UiConfig;
  customThemes: ThemeData[];
}

export interface DesignFile extends DesignDoc {
  kind: "uitool-design";
  version: 1;
}

/** 预览里的选择：部件 → 区域 → 按钮 → 图标或文字。row 是一整排，给多选合并用。 */
export interface Selection {
  part: PartId;
  zone?: string;
  item?: string;
  sub?: "icon" | "text";
  row?: string;
}

export function selKey(s: Selection): string {
  return [s.part, s.zone ?? "", s.item ?? "", s.sub ?? "", s.row ?? ""].join("\u0001");
}

/** 模块：选中落在菜单上时是这个菜单，否则是所在部件。界面状态，不进设计文件。 */
export type ModuleRef = { kind: "part"; part: PartId } | { kind: "menu"; id: string };

export function moduleOf(sel: Selection): ModuleRef {
  const zone = sel.zone ?? "";
  if (zone.startsWith("menu:")) return { kind: "menu", id: zone.slice(5) };
  return { kind: "part", part: sel.part };
}

export function sameModule(a: ModuleRef | null, b: ModuleRef | null): boolean {
  if (!a || !b || a.kind !== b.kind) return false;
  return a.kind === "menu" ? a.id === (b as { id: string }).id : a.part === (b as { part: PartId }).part;
}

interface State {
  doc: DesignDoc;
  past: DesignDoc[];
  future: DesignDoc[];
  selected: Selection | null;
  /** 弹窗列表里点中的那一条。界面状态，不进设计文件，不进撤销。 */
  dialogId: string | null;
  /** 副页面列表里点中的那一页。界面状态，不进设计文件，不进撤销。 */
  pageId: string | null;
  /** 两块及以上时是完整选择，含当前确认的那块。不进撤销。 */
  multi: Selection[];
  selecting: boolean;
  frame: string;
  /** 预览只画这个模块。不进设计文件，不进撤销。 */
  focus: ModuleRef | null;
  /** 只能改这个模块。不进设计文件，不进撤销。 */
  lock: ModuleRef | null;
}

const KEY = "uitool.design.v1";
export const templateDefault = migrateConfig(defaultConfig);
export const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function load(): DesignDoc {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) ?? "null") as { config?: { version?: number }; customThemes?: ThemeData[] } | null;
    if (d?.config?.version === 1 || d?.config?.version === 2) return { config: migrateConfig(d.config), customThemes: d.customThemes ?? [] };
  } catch {
    /* 用默认 */
  }
  return { config: clone(templateDefault), customThemes: [] };
}

let state: State = { doc: load(), past: [], future: [], selected: null, dialogId: null, pageId: null, multi: [], selecting: true, frame: "fit", focus: null, lock: null };
const listeners = new Set<() => void>();
let lastCoalesce: { key: string; at: number } | null = null;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

function emit(next: State) {
  state = next;
  listeners.forEach((l) => l());
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => localStorage.setItem(KEY, JSON.stringify(state.doc)), 200);
}

export const design = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** coalesce：同一个 key 在 1 秒内的连续修改合并成一步撤销（拖滑块、连续输入） */
  update(fn: (d: DesignDoc) => DesignDoc, coalesce?: string) {
    const doc = fn(state.doc);
    if (doc === state.doc) return;
    const now = Date.now();
    const merge = coalesce && lastCoalesce?.key === coalesce && now - lastCoalesce.at < 1000;
    lastCoalesce = coalesce ? { key: coalesce, at: now } : null;
    emit({ ...state, doc, past: merge ? state.past : [...state.past.slice(-99), state.doc], future: [] });
  },
  setConfig(fn: (c: UiConfig) => UiConfig, coalesce?: string) {
    design.update((d) => ({ ...d, config: syncActiveScheme(fn(d.config)) }), coalesce);
  },
  replace(doc: DesignDoc) {
    lastCoalesce = null;
    emit({ ...state, doc, past: [...state.past.slice(-99), state.doc], future: [], dialogId: null, pageId: null, focus: null, lock: null });
  },
  undo() {
    const prev = state.past[state.past.length - 1];
    if (!prev) return;
    lastCoalesce = null;
    emit({ ...state, doc: prev, past: state.past.slice(0, -1), future: [state.doc, ...state.future], multi: [] });
  },
  redo() {
    const next = state.future[0];
    if (!next) return;
    lastCoalesce = null;
    emit({ ...state, doc: next, past: [...state.past, state.doc], future: state.future.slice(1), multi: [] });
  },
  select(selected: Selection | null) {
    if (!allowed(selected)) return;
    emit({ ...state, selected, dialogId: null, pageId: null, multi: [] });
  },
  /** 选中一条弹窗。清掉工作台部件和副页面的选中，避免两侧检查器抢同一块地方。 */
  selectDialog(dialogId: string | null) {
    if (state.lock && dialogId) return;
    emit({ ...state, dialogId, pageId: null, selected: null, multi: [] });
  },
  /** 选中一页副页面。清掉工作台部件和弹窗的选中。 */
  selectSidePage(pageId: string | null) {
    if (state.lock && pageId) return;
    emit({ ...state, pageId, dialogId: null, selected: null, multi: [] });
  },
  addRegion(sel: Selection) {
    if (!allowed(sel)) return;
    const set = regionSet(state);
    if (set.some((s) => selKey(s) === selKey(sel))) return;
    commitRegions([...set, sel], sel);
  },
  removeRegion(sel: Selection) {
    if (!allowed(sel)) return;
    const key = selKey(sel);
    const set = regionSet(state).filter((s) => selKey(s) !== key);
    const keep =
      state.selected && selKey(state.selected) !== key && set.some((s) => selKey(s) === selKey(state.selected!))
        ? state.selected
        : (set.at(-1) ?? null);
    commitRegions(set, keep);
  },
  toggleMulti(sel: Selection) {
    if (!allowed(sel)) return;
    const key = selKey(sel);
    const has = state.multi.some((s) => selKey(s) === key);
    emit({ ...state, multi: has ? state.multi.filter((s) => selKey(s) !== key) : [...state.multi, sel] });
  },
  clearMulti() {
    if (!state.multi.length) return;
    emit({ ...state, multi: [] });
  },
  setSelecting(selecting: boolean) {
    emit({ ...state, selecting });
  },
  setFrame(frame: string) {
    emit({ ...state, frame });
  },
  setFocus(focus: ModuleRef | null) {
    emit({ ...state, focus });
  },
  setLock(lock: ModuleRef | null) {
    emit({ ...state, lock, multi: lock ? [] : state.multi });
  }
};

function allowed(sel: Selection | null): boolean {
  if (!sel || !state.lock) return true;
  return sameModule(moduleOf(sel), state.lock);
}

function regionSet(s: State): Selection[] {
  if (s.multi.length >= 2) return s.multi;
  return s.selected ? [s.selected] : [];
}

function commitRegions(list: Selection[], primary: Selection | null) {
  const seen = new Set<string>();
  const uniq: Selection[] = [];
  for (const s of list) {
    const key = selKey(s);
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(s);
  }
  if (uniq.length >= 2) {
    const selected = primary && uniq.some((s) => selKey(s) === selKey(primary)) ? primary : uniq[uniq.length - 1];
    emit({ ...state, selected, dialogId: null, pageId: null, multi: uniq });
    return;
  }
  emit({ ...state, selected: uniq[0] ?? null, dialogId: null, pageId: null, multi: [] });
}

export function useDesign<T>(pick: (s: State) => T): T {
  return useSyncExternalStore(design.subscribe, () => pick(state));
}

export function allThemes(doc: DesignDoc): ThemeData[] {
  return [...builtinThemes, ...doc.customThemes];
}

export function toDesignFile(doc: DesignDoc): DesignFile {
  return { kind: "uitool-design", version: 1, ...doc };
}

/** 读入 .uitool.json，或导出工程里的 src/ui.config.json（v1 会自动升级到 v2） */
export function parseDesign(text: string): DesignDoc {
  const data = JSON.parse(text) as Partial<DesignFile> & Partial<UiConfig>;
  if (data.kind === "uitool-design" && data.config) return { config: migrateConfig(data.config), customThemes: data.customThemes ?? [] };
  if ((data.version === 1 || data.version === 2) && data.layout && data.app) return { config: migrateConfig(data), customThemes: [] };
  throw new Error("不是 UITool 设计文件，也不是 ui.config.json");
}
