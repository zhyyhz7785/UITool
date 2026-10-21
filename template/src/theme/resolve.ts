import { formatColor, luma, parseColor, type RGBA } from "./color";
import hyTokens from "./hy-tokens.json";
import { colorKeyMap, colorRegistry, cssVarName, type ThemeType } from "./registry";

/** VSCode 主题文件格式（多出的 id / source 不影响 VSCode 读取）。 */
export interface ThemeData {
  id: string;
  name: string;
  type: ThemeType;
  colors: Record<string, string>;
  source?: string;
}

export interface ThemeSelection {
  /** 主题 id，对应 src/theme/themes/<id>.json */
  id: string;
  /** 可选强调色，覆盖 base.accent，派生色自动跟随 */
  accent: string | null;
  /** 单键覆盖，同 VSCode 的 workbench.colorCustomizations */
  overrides: Record<string, string>;
}

export type Density = "compact" | "comfortable";

/** 把主题解析成全部颜色键的最终取值。 */
export function resolveColors(theme: ThemeData, sel?: Partial<ThemeSelection>): Record<string, string> {
  const explicit: Record<string, string> = { ...theme.colors };
  if (sel?.accent && parseColor(sel.accent)) explicit["base.accent"] = sel.accent;
  Object.assign(explicit, sel?.overrides);

  const cache = new Map<string, RGBA | null>();
  const visiting = new Set<string>();
  const get = (key: string): RGBA | null => {
    if (cache.has(key)) return cache.get(key)!;
    if (visiting.has(key)) return null;
    visiting.add(key);
    let value: RGBA | null = null;
    const raw = explicit[key];
    if (raw != null && parseColor(raw)) value = parseColor(raw);
    else {
      const def = colorKeyMap.get(key)?.[theme.type];
      if (typeof def === "function") value = def(get, theme.type);
      else if (typeof def === "string") value = parseColor(def) ?? get(def);
    }
    visiting.delete(key);
    cache.set(key, value);
    return value;
  };

  const out: Record<string, string> = {};
  for (const c of colorRegistry) out[c.id] = formatColor(get(c.id));
  for (const key of Object.keys(explicit)) if (!(key in out) && parseColor(explicit[key])) out[key] = formatColor(get(key));
  return out;
}

type TokenMap = Record<string, string>;
const shared = hyTokens.shared as TokenMap;
const densities = hyTokens.density as Record<Density, TokenMap>;
const shadows = hyTokens.shadows as Record<ThemeType, TokenMap>;

/** 主题 + 密度 → 写到界面根元素上的 CSS 变量。 */
export function themeCssVars(theme: ThemeData, sel: Partial<ThemeSelection>, density: Density): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(resolveColors(theme, sel))) vars[cssVarName(k)] = v;
  for (const [k, v] of Object.entries(shared)) vars[`--${k}`] = v;
  for (const [k, v] of Object.entries(densities[density] ?? densities.compact)) vars[`--${k}`] = v;
  for (const [k, v] of Object.entries(shadows[theme.type])) vars[`--${k}`] = v;
  vars.colorScheme = theme.type;
  return vars;
}

/** 主题预览用的几块代表色。 */
export function themeSwatches(theme: ThemeData, accent?: string | null): string[] {
  const c = resolveColors(theme, { accent });
  return [c["activityBar.background"], c["sideBar.background"], c["editor.background"], c["foreground"], c["base.accent"], c["statusBar.background"]];
}

// ---------- 导入 VSCode 主题 ----------

function stripJsonc(text: string): string {
  let out = "";
  let inStr = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      out += ch;
      if (ch === "\\") out += text[++i] ?? "";
      else if (ch === '"') inStr = false;
    } else if (ch === '"') {
      inStr = true;
      out += ch;
    } else if (ch === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      out += "\n";
    } else if (ch === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i++;
    } else out += ch;
  }
  return out.replace(/,(\s*[}\]])/g, "$1");
}

/** 读入 VSCode 颜色主题（.json / .jsonc），补齐 base.* 让未给出的键也协调。 */
export function importVSCodeTheme(text: string, fileName = "theme.json"): ThemeData {
  const raw = JSON.parse(stripJsonc(text)) as { name?: string; type?: string; colors?: Record<string, unknown> };
  const colors: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw.colors ?? {})) if (typeof v === "string" && parseColor(v)) colors[k] = v;

  const editorBg = parseColor(colors["editor.background"]);
  const t = (raw.type ?? "").toLowerCase();
  const type: ThemeType = t.includes("light") || t === "vs" ? "light" : t ? "dark" : editorBg && luma(editorBg) > 0.5 ? "light" : "dark";

  const pick = (...keys: string[]) => keys.map((x) => colors[x]).find(Boolean);
  const infer: Record<string, string | undefined> = {
    "base.accent": pick("focusBorder", "button.background", "activityBarBadge.background", "progressBar.background"),
    "base.editor": pick("editor.background"),
    "base.sidebar": pick("sideBar.background", "editor.background"),
    "base.activity": pick("activityBar.background", "sideBar.background", "editor.background"),
    "base.header": pick("titleBar.activeBackground", "editorGroupHeader.tabsBackground", "sideBar.background", "editor.background"),
    "base.panel": pick("panel.background", "sideBar.background", "editor.background"),
    "base.window": pick("sideBar.background", "editor.background"),
    "base.raised": pick("editorWidget.background", "menu.background", "dropdown.background", "quickInput.background"),
    "base.input": pick("input.background", "dropdown.background"),
    "base.border": pick("panel.border", "sideBar.border", "editorGroup.border", "contrastBorder", "widget.border"),
    "base.status": pick("statusBar.background"),
    "base.statusForeground": pick("statusBar.foreground"),
    foreground: pick("foreground", "editor.foreground", "sideBar.foreground")
  };
  for (const [k, v] of Object.entries(infer)) if (v && !colors[k]) colors[k] = v;

  const base = fileName.replace(/\.[^.]+$/, "");
  const id = "vsc-" + (base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "theme");
  return { id, name: raw.name ?? base, type, colors, source: `VSCode 主题 ${fileName}` };
}
