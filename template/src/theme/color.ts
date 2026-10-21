/** 颜色：0–255 的 RGB 加 0–1 的透明度。 */
export type RGBA = [number, number, number, number];

export function parseColor(input: string | null | undefined): RGBA | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();
  if (s === "transparent") return [0, 0, 0, 0];
  if (s.startsWith("#")) {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(h)) return null;
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const m = /^rgba?\(([^)]+)\)$/.exec(s);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const ch = (v: string) => (v.endsWith("%") ? (parseFloat(v) * 255) / 100 : parseFloat(v));
    const a = parts[3] == null ? 1 : parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    const c: RGBA = [ch(parts[0]), ch(parts[1]), ch(parts[2]), a];
    return c.some((v) => Number.isNaN(v)) ? null : c;
  }
  return null;
}

const hex2 = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0").toUpperCase();

/** 不透明输出 #RRGGBB，半透明输出 #RRGGBBAA（与 VSCode 主题文件一致）。 */
export function formatColor(c: RGBA | null): string {
  if (!c) return "transparent";
  const base = `#${hex2(c[0])}${hex2(c[1])}${hex2(c[2])}`;
  return c[3] >= 1 ? base : base + hex2(c[3] * 255);
}

export function mix(a: RGBA, b: RGBA, t: number): RGBA {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t];
}

export function withAlpha(c: RGBA, factor: number): RGBA {
  return [c[0], c[1], c[2], c[3] * factor];
}

/** 感知亮度 0–1（与 hy 令牌的 text-on-accent 判定相同）。 */
export function luma(c: RGBA): number {
  return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
}

export function isColor(s: string): boolean {
  return parseColor(s) != null;
}
