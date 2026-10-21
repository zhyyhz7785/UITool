import type { LayoutConfig, SchemeUi, UiConfig, UiScheme } from "./types";

export const TIER_NAME: Record<UiScheme["tier"], string> = { best: "最优", good: "次优", basic: "一般" };

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/** 当前界面上属于「方案」的那一部分。命令、菜单、弹窗、副页面不在内。 */
export function schemeUiOf(c: UiConfig): SchemeUi {
  return {
    theme: c.theme,
    density: c.density,
    icons: c.icons,
    layout: c.layout,
    activity: c.activity,
    auxiliary: c.auxiliary,
    panel: c.panel,
    editors: c.editors,
    statusBar: c.statusBar
  };
}

export function applySchemeUi(c: UiConfig, ui: SchemeUi): UiConfig {
  return { ...c, ...clone(ui) };
}

/**
 * 设计器里每次修改后调用：把当前呈现写进正在调整的那一套，并标成主方案。
 * 没有方案时原样返回。
 */
export function syncActiveScheme(c: UiConfig): UiConfig {
  if (!c.scheme || !c.schemes?.length) return c;
  const ui = clone(schemeUiOf(c));
  const menus = clone(c.menus);
  return { ...c, schemes: c.schemes.map((s) => (s.id === c.scheme ? { ...s, ui, menus, tuned: true } : { ...s, tuned: false })) };
}

/**
 * 换成另一套方案。
 * session：先把当前呈现存进原来那套的 live，再套用目标的 live（没有就用设计值）。设计值 ui 不动。
 * design：把当前呈现写进原来那套的 ui，再套用目标的设计值，并把目标标成主方案。
 */
export function switchScheme(c: UiConfig, id: string, kind: "design" | "session" = "session"): UiConfig {
  const schemes = c.schemes;
  if (!schemes?.some((s) => s.id === id) || c.scheme === id) return c;
  const snap = clone(schemeUiOf(c));
  const next = schemes.find((s) => s.id === id)!;
  const updated = schemes.map((s) => {
    if (s.id !== c.scheme) return s;
    return kind === "design" ? { ...s, ui: snap, menus: clone(c.menus) } : { ...s, live: snap };
  });
  const stamped = kind === "design" ? updated.map((s) => ({ ...s, tuned: s.id === id })) : updated;
  const ui = kind === "session" ? (next.live ?? next.ui) : next.ui;
  const menus = next.menus ? clone(next.menus) : c.menus;
  return { ...applySchemeUi(c, ui), scheme: id, schemes: stamped, menus };
}

/** 布局回到当前方案的设计值。没有方案时用 fallback。 */
export function resetSchemeLayout(c: UiConfig, fallback: LayoutConfig): UiConfig {
  const current = c.schemes?.find((s) => s.id === c.scheme);
  const layout = clone(current ? current.ui.layout : fallback);
  const schemes = c.schemes?.map((s) => (s.id === c.scheme && s.live ? { ...s, live: { ...s.live, layout: clone(layout) } } : s));
  return schemes ? { ...c, layout, schemes } : { ...c, layout };
}
