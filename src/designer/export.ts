import { zipSync } from "fflate";
import type { IconStyleId, ToolItem, UiConfig } from "@tpl/workbench/types";
import type { DesignDoc } from "./store";

/** 构建时把 template/ 整个打进 UITool。改了模板，重新构建 UITool 就会导出新模板。 */
const textFiles = import.meta.glob<string>(
  [
    "/template/**/*",
    "!/template/**/node_modules/**",
    "!/template/**/target/**",
    "!/template/dist/**",
    "!/template/src-tauri/gen/**",
    "!/template/**/*.{png,ico,icns}",
    "!/template/package-lock.json"
  ],
  { query: "?raw", import: "default", eager: true }
);
const binaryFiles = import.meta.glob<string>("/template/src-tauri/icons/*.{png,ico}", { query: "?inline", import: "default", eager: true });

const enc = new TextEncoder();

function dataUrlToBytes(url: string): Uint8Array {
  const b64 = url.slice(url.indexOf(",") + 1);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function packageName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "app"
  );
}

export function validateDoc(doc: DesignDoc): string[] {
  const a = doc.config.app;
  const errs: string[] = [];
  if (!/^[a-z0-9][a-z0-9-]*$/.test(a.name)) errs.push("工程名只能用小写字母、数字和短横线，例如 my-app");
  if (!/^[a-zA-Z][\w-]*(\.[a-zA-Z][\w-]*)+$/.test(a.identifier)) errs.push("应用标识需为反向域名，例如 com.company.app");
  if (!/^\d+\.\d+\.\d+/.test(a.version)) errs.push("版本号需为 x.y.z");
  if (!a.title.trim()) errs.push("窗口标题不能为空");
  return errs;
}

/** 生成导出工程的全部文件：相对路径 → 内容。 */
export function buildProjectFiles(doc: DesignDoc): Record<string, Uint8Array> {
  const c = doc.config;
  const a = c.app;
  const files: Record<string, Uint8Array> = {};
  const put = (p: string, s: string) => (files[p] = enc.encode(s));
  const json = (v: unknown) => JSON.stringify(v, null, 2) + "\n";

  const usage = iconUsage(c);
  for (const [abs, content] of Object.entries(textFiles)) {
    let rel = abs.replace(/^\/template\//, "");
    let text = content;
    if (rel === "gitignore" || rel === "npmrc" || rel === "node-version") rel = "." + rel;
    if (rel === "package.json") {
      const pkg = JSON.parse(text);
      Object.assign(pkg, { name: a.name, version: a.version, description: a.description });
      text = json(pkg);
    } else if (rel === "index.html") {
      text = text.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(a.title)}</title>`);
    } else if (rel === "src-tauri/tauri.conf.json") {
      const conf = JSON.parse(text);
      conf.productName = a.title;
      conf.version = a.version;
      conf.identifier = a.identifier;
      conf.app.windows[0].title = a.title;
      conf.app.windows[0].decorations = c.layout.titleBar.style === "native";
      text = json(conf);
    } else if (rel === "README.md") {
      text = text.replaceAll("{{APP_TITLE}}", a.title);
    } else if (rel === "src/ui.config.json") {
      text = json(c);
    } else if (rel === "src/icons/icon-variants.json") {
      text = json(slimVariants(JSON.parse(text), usage));
    }
    put(rel, text);
  }
  for (const [abs, url] of Object.entries(binaryFiles)) files[abs.replace(/^\/template\//, "")] = dataUrlToBytes(url);
  for (const t of doc.customThemes) put(`src/theme/themes/${t.id}.json`, json({ name: t.name, type: t.type, source: t.source, colors: t.colors }));
  if (usage.styles.has("codicons")) {
    put("NOTICE-codicons.txt", "本工程使用了 Codicons 图标（Microsoft，CC-BY-4.0）。\nhttps://github.com/microsoft/vscode-codicons\n使用时请保留本声明。\n");
  }
  return files;
}

function walkIcon(ids: Set<string>, icon?: string) {
  if (!icon || icon.startsWith("lu:") || icon.startsWith("ta:")) return;
  const cut = icon.indexOf(":");
  ids.add(cut > 0 ? icon.slice(cut + 1) : icon);
}
function walkItems(ids: Set<string>, items?: ToolItem[]) {
  items?.forEach((it) => walkIcon(ids, it.icon));
}

function iconUsage(c: UiConfig): { styles: Set<IconStyleId>; ids: Set<string> } {
  const styles = new Set<IconStyleId>(["hy", c.icons.style, ...Object.values(c.icons.areas)]);
  const ids = new Set<string>();
  walkIcon(ids, c.app.icon);
  for (const ref of Object.values(c.icons.overrides)) {
    if (ref.startsWith("lu:") || ref.startsWith("ta:")) continue;
    const cut = ref.indexOf(":");
    if (cut > 0) styles.add(ref.slice(0, cut) as IconStyleId);
    walkIcon(ids, ref);
  }
  for (const cmd of c.commands) walkIcon(ids, cmd.icon);
  walkItems(ids, c.layout.titleBar.left);
  walkItems(ids, c.layout.titleBar.right);
  walkItems(ids, c.layout.activityBar.bottom);
  walkItems(ids, c.layout.panel.actions);
  walkItems(ids, c.layout.editor.tabActions);
  walkItems(ids, c.layout.editor.breadcrumbActions);
  for (const bar of [c.layout.toolbars.top, c.layout.toolbars.side]) for (const row of bar.rows) walkItems(ids, [...row.start, ...row.center, ...row.end]);
  for (const zone of [c.statusBar.start, c.statusBar.center, c.statusBar.end]) walkItems(ids, zone);
  for (const box of [...c.activity, ...c.auxiliary]) {
    walkIcon(ids, box.icon);
    walkItems(ids, box.headerActions);
    for (const s of box.sections) {
      walkIcon(ids, s.icon);
      walkItems(ids, s.actions);
    }
  }
  for (const p of c.panel) walkIcon(ids, p.icon);
  for (const e of c.editors) walkIcon(ids, e.icon);
  return { styles, ids };
}

function slimVariants(full: { source?: string; icons: Record<string, Record<string, unknown>> }, usage: { styles: Set<IconStyleId>; ids: Set<string> }) {
  const icons: Record<string, Record<string, unknown>> = {};
  for (const id of usage.ids) {
    const row = full.icons[id];
    if (!row) continue;
    const slim: Record<string, unknown> = { n: row.n, e: row.e, c: row.c };
    for (const style of usage.styles) if (row[style]) slim[style] = row[style];
    if (!slim.hy && row.hy) slim.hy = row.hy;
    icons[id] = slim;
  }
  return { source: full.source, styles: [...usage.styles], icons };
}

export function zipProject(doc: DesignDoc): Uint8Array {
  const root = doc.config.app.name;
  const tree: Record<string, Uint8Array> = {};
  for (const [p, data] of Object.entries(buildProjectFiles(doc))) tree[`${root}/${p}`] = data;
  return zipSync(tree, { level: 6 });
}

export function projectSummary(doc: DesignDoc) {
  const files = Object.keys(textFiles).length + Object.keys(binaryFiles).length + doc.customThemes.length;
  return { files };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
}
