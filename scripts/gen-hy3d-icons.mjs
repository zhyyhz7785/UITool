// Explicit write-back only, to the authorized HY3D linked worktree.
// Handles commands.json includes as well as the old single-file schema.
import fs from "node:fs";
import path from "node:path";
import { canWriteProduct, hy3dWriteRoot, atomicWrite } from "./path-policy.mjs";
import { applyCommandIcons, appendCadSymbols, loadCadPack } from "./hy3d-cad-icons.mjs";

const root = path.join(hy3dWriteRoot(), "ui");
const pack = loadCadPack();
const seen = new Set(), ids = new Set(), writes = [];
function visit(rel) {
  const file = path.resolve(root, rel);
  const sub = path.relative(root, file);
  if (!sub || sub.startsWith("..") || path.isAbsolute(sub) || !canWriteProduct(file))
    throw new Error("拒绝写入未授权路径：" + file);
  if (seen.has(file)) throw new Error("命令 include 重复：" + rel);
  seen.add(file);
  const doc = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const child of doc.include || []) visit(child);
  const rows = Array.isArray(doc) ? doc : doc.commands || [];
  for (const c of rows) {
    if (ids.has(c.id)) throw new Error("命令重复：" + c.id);
    ids.add(c.id);
  }
  applyCommandIcons(doc, pack, { strict: true });
  if (rows.length) writes.push([file, JSON.stringify(doc, null, 2) + "\n"]);
}
visit("commands.json");
const stale = Object.keys(pack.commands).filter(id => !ids.has(id));
if (stale.length) throw new Error("命令版本与图标包不一致：" + stale.join(", "));
const svgFile = path.join(root, "icons.svg");
if (!canWriteProduct(svgFile)) throw new Error("未授权写入 " + svgFile);
writes.push([svgFile, appendCadSymbols(fs.readFileSync(svgFile, "utf8"), pack)]);
// Full preflight before the first write; individual file replacements are atomicWrite.
if (!process.argv.includes("--apply")) {
  console.log("仅预检：", ids.size, "命令", writes.length, "文件；加 --apply 才写入");
} else {
  for (const [file, content] of writes) atomicWrite(file, content);
  console.log("已写入授权工作树：", ids.size, "命令", writes.length, "文件");
}
