import type { Selection } from "./store";

/** 宽或高相差在这个像素以内，算对齐。 */
export const SPAN_EPS = 1;

export interface SpanBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function sameSpan(a: { w: number; h: number }, b: { w: number; h: number }): boolean {
  return Math.abs(a.w - b.w) <= SPAN_EPS || Math.abs(a.h - b.h) <= SPAN_EPS;
}

/** 全部同宽，或全部同高。互相覆盖不另作限制。 */
export function shareSpan(rects: { w: number; h: number }[]): boolean {
  if (rects.length < 2) return false;
  const w0 = rects[0].w;
  const h0 = rects[0].h;
  const sameW = rects.every((r) => Math.abs(r.w - w0) <= SPAN_EPS);
  const sameH = rects.every((r) => Math.abs(r.h - h0) <= SPAN_EPS);
  return sameW || sameH;
}

/** 小的在前。只留下和最小一块同宽或同高的区域。 */
export function stackOf<T extends SpanBox>(boxes: T[]): T[] {
  const sorted = [...boxes].sort((a, b) => a.w * a.h - b.w * b.h || a.w - b.w || a.h - b.h);
  if (!sorted.length) return [];
  const small = sorted[0];
  return sorted.filter((b, i) => i === 0 || sameSpan(small, b));
}

/** 单击要确认的那一块。最小块已是唯一选中时，改确认下一层更大的。 */
export function nextConfirm<T>(stack: T[], onlyKey: string | null, key: (item: T) => string): T | null {
  if (!stack.length) return null;
  if (onlyKey !== null && key(stack[0]) === onlyKey) return stack[1] ?? stack[0];
  return stack[0];
}

/** Ctrl：最小的未选中块。更小的都已选中时，就是下一层。 */
export function nextAdd<T>(stack: T[], selected: ReadonlySet<string>, key: (item: T) => string): T | null {
  return stack.find((item) => !selected.has(key(item))) ?? null;
}

export type ReduceStep<T> = { kind: "remove"; item: T } | { kind: "shrink"; item: T; drop: T[] };

/** Shift：这一块已选中就去掉；选中的是更大外层时，缩到这一块。 */
export function nextReduce<T>(stack: T[], selected: ReadonlySet<string>, key: (item: T) => string): ReduceStep<T> | null {
  if (!stack.length) return null;
  const precise = stack[0];
  if (selected.has(key(precise))) return { kind: "remove", item: precise };
  const drop = stack.slice(1).filter((item) => selected.has(key(item)));
  if (!drop.length) return null;
  return { kind: "shrink", item: precise, drop };
}

function cssValue(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function targetOf(s: Selection) {
  if (s.sub && s.item) return `[data-item="${cssValue(s.item)}"] [data-sub="${s.sub}"]`;
  if (s.sub && s.zone) return `[data-zone="${cssValue(s.zone)}"] [data-sub="${s.sub}"]`;
  if (s.item) return `[data-item="${cssValue(s.item)}"]`;
  if (s.zone) return `[data-zone="${cssValue(s.zone)}"]`;
  if (s.row) return `[data-row="${cssValue(s.row)}"]`;
  return `[data-part="${s.part}"]`;
}
