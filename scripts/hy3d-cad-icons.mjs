// Shared by preview server and explicit, authorized product export.
import { readFileSync } from "node:fs";
export function loadCadPack() {
  const pack = JSON.parse(readFileSync(new URL("../template/src/icons/hy3d-cad-pack.json", import.meta.url), "utf8"));
  const names = new Set();
  for (const [id, row] of Object.entries(pack.commands)) {
    if (!/^hycad-[A-Za-z0-9-]+$/.test(row.name) || names.has(row.name) || !row.body)
      throw new Error("无效或重复 CAD 图标：" + id);
    names.add(row.name);
  }
  return pack;
}
export function applyCommandIcons(doc, pack, { strict = false } = {}) {
  const rows = Array.isArray(doc) ? doc : doc.commands || [];
  for (const c of rows) {
    const row = Object.hasOwn(pack.commands, c.id) ? pack.commands[c.id] : null;
    if (row) c.icon = row.name;
    else if (strict) throw new Error("图标包缺少命令：" + c.id);
    // New commands on a newer preview mirror keep their native icon.
  }
  return doc;
}
export function appendCadSymbols(svg, pack) {
  if (!/<\/svg>\s*$/.test(svg)) throw new Error("无效的原生 icons.svg");
  // Idempotent. Only names owned by this pack are replaced, no removal of native symbols.
  const names = new Set(Object.values(pack.commands).map(row => "i-" + row.name));
  const kept = svg.replace(/<symbol\b[^>]*\bid="([^"]+)"[^>]*>[\s\S]*?<\/symbol>/g,
    (tag, id) => names.has(id) ? "" : tag);
  const added = Object.values(pack.commands).map(row =>
    '<symbol id="i-' + row.name + '" viewBox="0 0 24 24">' + row.body + '</symbol>').join("\n");
  return kept.replace(/<\/svg>\s*$/, () => "\n" + added + "\n</svg>\n");
}
