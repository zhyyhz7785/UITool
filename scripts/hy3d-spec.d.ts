export const STAMP: string;
export const SCHEMES: { scheme: string; skin: string; file: string; menus: "main" | "blender" }[];
export const STATUS_TOGGLES: { id: string; short: string }[];
export function resolveFace(panel: { id?: string; title?: string; ids?: string[]; commands?: string[]; face?: { id?: string; command?: string; size?: string; menu?: string[]; text?: string }[] }): { id: string; size: "big" | "small"; menu?: string[]; text?: string }[];
export function groupFromPanel(panel: { id: string; title?: string; ids?: string[]; face?: { id?: string; size?: string; menu?: string[]; text?: string }[]; launcher?: string }): {
  id: string;
  title: string;
  commands: string[];
  slots: { command: string; size: "big" | "small"; menu?: string[]; text?: string }[];
  launcher?: string;
};
export function normalizeToggles(raw: unknown): { id: string; short: string }[];
export function overlayScheme(ui: unknown, spec: unknown, commands: { id: string; title: string }[]): unknown;
export function menusFrom(doc: { menus?: { id: string; title?: string; items?: string[] }[] } | null): { id: string; title: string; items: { separator?: boolean; command?: string }[] }[];
export function stampActive<T>(config: T): T;
export function specFromScheme(scheme: unknown, skin: string): unknown;
export function menuSpec(menus: unknown): { $comment: string; menus: { id: string; title?: string; items: string[] }[] };
export function referencedIds(specs: unknown[], menuDocs: { menus?: { items?: string[] }[] }[]): Set<string>;
