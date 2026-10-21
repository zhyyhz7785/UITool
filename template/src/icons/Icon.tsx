import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { IconArea, IconConfig, IconStyleId } from "../workbench/types";
import { builtinIcons } from "./builtin";
import iconData from "./icons.json";
import variantData from "./icon-variants.json";

export interface IconEntry {
  /** 所在分类，如 01-文件 */
  c?: string;
  /** 中文名 */
  n: string;
  /** 英文名 */
  e?: string;
  /** 通用快捷键 */
  k?: string;
  vb?: string;
  fill?: string;
  stroke?: string;
  /** svg 内部内容 */
  s: string;
}

/** 工具图标（12-工具图标 的推荐项）在前，内置补充在后。 */
export const icons: Record<string, IconEntry> = { ...builtinIcons, ...(iconData.icons as Record<string, IconEntry>) };
export const iconCategories: { id: string; name: string; icons: string[] }[] = [
  ...iconData.categories,
  { id: "壳层补充", name: "壳层补充", icons: Object.keys(builtinIcons) }
];

export interface IconContextValue {
  config?: IconConfig;
  area?: IconArea;
}

/** 当前图标风格和作用区域。工作台根上放全局配置，各部件用 IconScope 标区域。 */
export const IconContext = createContext<IconContextValue>({});

export function IconScope({ area, children }: { area: IconArea; children: ReactNode }) {
  const parent = useContext(IconContext);
  return <IconContext.Provider value={{ ...parent, area }}>{children}</IconContext.Provider>;
}

type PoolIcon = { id: string; n: string; s: string };
let poolMap: Map<string, PoolIcon> | null = null;
let poolLoading: Promise<void> | null = null;
const poolListeners = new Set<() => void>();

/** 命令表没有的名字再加载备用池（Lucide / Tabler），不打进首屏包。 */
export function loadIconPool(): Promise<void> {
  if (poolMap) return Promise.resolve();
  if (!poolLoading) {
    poolLoading = import("./pool.json").then((mod) => {
      const data = (mod.default ?? mod) as { icons: PoolIcon[] };
      poolMap = new Map(data.icons.map((ic) => [ic.id, ic]));
      poolListeners.forEach((fn) => fn());
    });
  }
  return poolLoading;
}

function fromPool(name: string): IconEntry | undefined {
  if (!poolMap) return undefined;
  const hit = poolMap.get(name) ?? (name.includes(":") ? undefined : poolMap.get("lu:" + name) ?? poolMap.get("ta:" + name));
  return hit ? { n: hit.n, s: hit.s } : undefined;
}

type Glyph = { vb?: string; fill?: string; stroke?: string; s: string };
type VariantRow = { n: string; e?: string; c?: string; hy: Glyph } & Partial<Record<IconStyleId, Glyph>>;
const variantIcons = (variantData as { icons: Record<string, VariantRow> }).icons;

function glyphEntry(row: VariantRow, glyph: Glyph): IconEntry {
  return { n: row.n, e: row.e, c: row.c, vb: glyph.vb, fill: glyph.fill, stroke: glyph.stroke, s: glyph.s };
}

/** 语义 id 在各风格下的画法。没有该风格时不返回。 */
export function styleGlyphs(semantic: string): { style: IconStyleId; entry: IconEntry }[] {
  const row = variantIcons[semantic];
  if (!row) return [];
  return (["hy", "lucide", "tabler", "phosphor", "fluent", "material", "codicons"] as IconStyleId[]).flatMap((style) => {
    const glyph = row[style];
    return glyph?.s ? [{ style, entry: glyphEntry(row, glyph) }] : [];
  });
}

export function variantIds(): string[] {
  return Object.keys(variantIcons);
}

/**
 * 解析图标。顺序：单个替换 → 所在区域的风格 → 全局风格 → hy 推荐 → 内置 → 备用池。
 * 替换值可以是 lu: / ta: 全库引用，或「风格:语义id」（如 codicons:save）。
 */
export function resolveIcon(name: string | undefined, ctx: IconContextValue = {}): IconEntry | undefined {
  if (!name) return undefined;
  const ref = name.includes(":") ? name : (ctx.config?.overrides?.[name] ?? name);
  if (ref.startsWith("lu:") || ref.startsWith("ta:")) return fromPool(ref) ?? icons[name];
  const cut = ref.indexOf(":");
  const forced = cut > 0 ? (ref.slice(0, cut) as IconStyleId) : undefined;
  const semantic = cut > 0 ? ref.slice(cut + 1) : ref;
  const row = variantIcons[semantic];
  if (row) {
    const style = forced || (ctx.area && ctx.config?.areas?.[ctx.area]) || ctx.config?.style || "hy";
    const glyph = row[style] ?? row.hy;
    if (glyph?.s) return glyphEntry(row, glyph);
  }
  return icons[semantic] ?? fromPool(semantic);
}

export function hasIcon(name: string | undefined): boolean {
  return !!name && (name in icons || name.startsWith("lu:") || name.startsWith("ta:"));
}

interface IconProps {
  name?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

export function Icon({ name, size = 16, strokeWidth = 1.5, className, style, title }: IconProps) {
  const ctx = useContext(IconContext);
  const [, bump] = useState(0);
  const ref = name && !name.includes(":") ? (ctx.config?.overrides?.[name] ?? name) : name;
  const needsPool = !!ref && (ref.startsWith("lu:") || ref.startsWith("ta:") || (!ref.includes(":") && !(ref in icons) && !variantIcons[ref]));
  useEffect(() => {
    if (!needsPool) return;
    const fn = () => bump((n) => n + 1);
    poolListeners.add(fn);
    loadIconPool();
    return () => {
      poolListeners.delete(fn);
    };
  }, [needsPool]);
  const ic = resolveIcon(name, ctx);
  const cls = "wb-icon" + (className ? " " + className : "");
  if (!ic) {
    return (
      <svg className={cls} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} style={style} aria-hidden>
        {title && <title>{title}</title>}
        <rect x="4" y="4" width="16" height="16" rx="3" strokeDasharray="3 3" />
      </svg>
    );
  }
  return (
    <svg
      className={cls}
      width={size}
      height={size}
      viewBox={ic.vb ?? "0 0 24 24"}
      fill={ic.fill ?? "none"}
      stroke={ic.stroke ?? "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden={title ? undefined : true}
      dangerouslySetInnerHTML={{ __html: (title ? `<title>${title}</title>` : "") + ic.s }}
    />
  );
}
