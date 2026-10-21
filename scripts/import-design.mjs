// 从设计规范库导入数据到 template/：
//   13-软件模板/90-整理仓/40-主题令牌/tokens.json → template/src/theme/hy-tokens.json + themes/*.json（VSCode 主题格式）
//   12-工具图标/*.html 每行「推荐 ★」图标 → template/src/icons/icons.json
// 用法：node scripts/import-design.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const lib = path.resolve(root, "..");
const tokensFile = path.join(lib, "13-软件模板", "90-整理仓", "40-主题令牌", "tokens.json");
const iconDir = path.join(lib, "12-工具图标");
const outTheme = path.join(root, "template", "src", "theme");
const outIcons = path.join(root, "template", "src", "icons");

const write = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof data === "string" ? data : JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("写入", path.relative(root, file));
};

// ---------- 令牌 → 主题 ----------
const doc = JSON.parse(fs.readFileSync(tokensFile, "utf8"));
const shadows = (b) => ({ "shadow-1": b["shadow-1"], "shadow-2": b["shadow-2"], "shadow-3": b["shadow-3"] });
write(path.join(outTheme, "hy-tokens.json"), {
  version: doc.version,
  source: "90-整理仓/40-主题令牌/tokens.json",
  shared: doc.shared,
  density: doc.density,
  shadows: { dark: shadows(doc.bases.dark), light: shadows(doc.bases.light) }
});

// hy 令牌名 → 主题颜色键。base.* 是本模板的基础键，VSCode 键都从它们派生。
const MAP = {
  "bg-window": "base.window",
  "bg-header": "base.header",
  "bg-panel": "base.panel",
  "bg-raised": "base.raised",
  "bg-input": "base.input",
  "bg-doc": "base.editor",
  "bg-sidebar": "base.sidebar",
  "bg-activity": "base.activity",
  "bg-canvas": "base.canvas",
  "bg-hover": "base.hover",
  "bg-active": "base.active",
  "bg-ctl": "base.control",
  "bg-ctl-hover": "base.controlHover",
  "bg-status": "base.status",
  "text-status": "base.statusForeground",
  border: "base.border",
  "border-strong": "base.borderStrong",
  "sash-hover": "sash.hoverBorder",
  text: "foreground",
  "text-2": "descriptionForeground",
  "text-3": "disabledForeground",
  accent: "base.accent",
  danger: "errorForeground",
  warning: "editorWarning.foreground",
  success: "base.success",
  "sb-thumb": "scrollbarSlider.background",
  "sb-thumb-hover": "scrollbarSlider.hoverBackground",
  "code-bg": "textCodeBlock.background",
  scrim: "base.scrim"
};
// 这两项在 hy 里指向强调色；不写进主题，交给注册表默认值，这样换强调色时状态栏跟着变。
const FOLLOW_ACCENT = new Set(["var(--accent)", "var(--text-on-accent)"]);

for (const [id, p] of Object.entries(doc.palettes)) {
  const merged = { ...doc.bases[p.base], ...p.colors };
  const resolve = (v, depth = 0) => {
    const m = /^var\(--([\w-]+)\)$/.exec(v);
    return m && depth < 8 ? resolve(merged[m[1]], depth + 1) : v;
  };
  const colors = {};
  for (const [hy, key] of Object.entries(MAP)) {
    const raw = merged[hy];
    if (raw == null || FOLLOW_ACCENT.has(raw)) continue;
    colors[key] = resolve(raw);
  }
  write(path.join(outTheme, "themes", `${id}.json`), {
    name: p.name,
    type: p.base === "dark" ? "dark" : "light",
    source: `hy palettes.${id}（base: ${p.base}）`,
    colors
  });
}
write(path.join(outTheme, "accents.json"), doc.accents);

// ---------- 工具图标 ----------
const files = fs.readdirSync(iconDir).filter((f) => /^\d\d-.+\.html$/.test(f) && !f.startsWith("00-")).sort();
const icons = {};
const categories = [];
const variants = {};
const STYLE_COLS = ["lucide", "tabler", "phosphor", "fluent", "material", "codicons"];
const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
const packSvg = (td, prefer) => {
  const re = /<svg([^>]*)>([\s\S]*?)<\/svg>/g;
  let m;
  let pick;
  while ((m = re.exec(td))) {
    pick = pick || m;
    if (prefer && m[1].includes(prefer)) {
      pick = m;
      break;
    }
  }
  if (!pick) return;
  const attr = (n) => new RegExp(`\\s${n}="([^"]*)"`).exec(pick[1])?.[1];
  const s = pick[2].replace(/\s+/g, " ").trim();
  if (!s) return;
  const fill = attr("fill") ?? "none";
  return { vb: attr("viewBox") ?? "0 0 24 24", fill, stroke: attr("stroke") ?? (fill !== "none" ? "none" : "currentColor"), s };
};
for (const f of files) {
  const html = fs.readFileSync(path.join(iconDir, f), "utf8");
  const cat = f.replace(/\.html$/, "");
  const catItems = [];
  for (const m of html.matchAll(/<tr data-key="([^"]+)">([\s\S]*?)<\/tr>/g)) {
    const [, key, row] = m;
    const fn = /<td class="fn">([\s\S]*?)<\/td>/.exec(row)?.[1] ?? "";
    const rec = /<td class="rec">([\s\S]*?)<\/td>/.exec(row)?.[1] ?? "";
    const hy = packSvg(rec);
    if (!hy) continue;
    const label = strip(/<b>([\s\S]*?)<\/b>/.exec(fn)?.[1] ?? key);
    const zh = label.replace(/\s+[A-Za-z][\w ./&+-]*$/, "").trim() || label;
    const en = label.slice(zh.length).trim();
    let id = key.split("/").pop();
    if (icons[id]) id = `${cat.slice(0, 2)}-${id}`;
    icons[id] = {
      c: cat,
      n: zh,
      e: en || undefined,
      k: strip(/<kbd>([\s\S]*?)<\/kbd>/.exec(fn)?.[1] ?? "") || undefined,
      src: /value="([^"]+)"/.exec(rec)?.[1],
      vb: hy.vb,
      fill: hy.fill,
      stroke: hy.stroke,
      s: hy.s
    };
    const cells = [...row.matchAll(/<td\b[^>]*>[\s\S]*?<\/td>/g)].map((x) => x[0]);
    const entry = { n: zh, e: en || undefined, c: cat, hy };
    STYLE_COLS.forEach((style, i) => {
      const packed = packSvg(cells[i + 2] ?? "", style === "fluent" ? "f20" : undefined);
      if (packed) entry[style] = packed;
    });
    variants[id] = entry;
    catItems.push(id);
  }
  if (!catItems.length) continue;
  categories.push({ id: cat, name: cat.replace(/^\d\d-/, ""), icons: catItems });
}
write(path.join(outIcons, "icons.json"), { source: "12-工具图标（每行推荐 ★）", categories, icons });
write(path.join(outIcons, "icon-variants.json"), { source: "12-工具图标 各风格列", styles: ["hy", ...STYLE_COLS], icons: variants });
console.log(`图标 ${Object.keys(icons).length} 个，分类 ${categories.length} 个，风格 ${STYLE_COLS.length + 1} 套`);
