export const STAMP: string;
export const SCHEMES: { scheme: string; skin: string; colorTheme: string; file: string }[];
export function overlayHymd(ui: unknown, spec: unknown): unknown;
export function hymdMenusFrom(
  doc: { menus?: { id: string; items?: string[] }[] } | null,
  fallback: { id: string; title: string }[]
): { id: string; title: string; ghost?: boolean; items: { separator?: boolean; command?: string; title?: string; items?: unknown[]; swatches?: unknown[] }[] }[];
export function stampExplorerGhost(ui: unknown): unknown;
export function specFromHymd(scheme: unknown): unknown;
export function hymdMenuSpec(menus: unknown): { $comment: string; menus: { id: string; items: string[] }[] };

export interface SpecSideItem {
  id: string;
  label: string;
  group?: string;
}

export type SpecSidePresent = "ribbon" | "tabs" | "swatches" | "search" | "list" | "canvas" | "status" | "paper" | "grid" | "aside";

export interface SpecSideRegion {
  id: string;
  title: string;
  present: SpecSidePresent;
  tab?: string;
  place?: "start" | "end";
  edge?: "bottom";
  items: SpecSideItem[];
}

export interface SpecSidePage {
  id: string;
  title: string;
  source: string;
  regions: SpecSideRegion[];
}

/** 预设点不开的整页。hy3d 没有这类页。 */
export function hymdSidePages(): SpecSidePage[];
