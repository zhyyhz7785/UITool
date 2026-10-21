// 按 scripts/hy3d-icons.json 把图标名写进 commands.json，缺的符号补进 icons.svg。
import fs from "node:fs";

const mapPath = new URL("./hy3d-icons.json", import.meta.url);
const cmdPath = process.env.HY3D_COMMANDS ?? "E:/Code/hy3d/ui/commands.json";
const svgPath = process.env.HY3D_ICONS ?? "E:/Code/hy3d/ui/icons.svg";
const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const doc = JSON.parse(fs.readFileSync(cmdPath, "utf8"));
const ids = doc.commands.map((c) => c.id);
if (Object.keys(map).length !== ids.length) throw new Error("对照表 " + Object.keys(map).length + " != " + ids.length);
for (const c of doc.commands) {
  const row = map[c.id];
  if (!row || !row.name) throw new Error("缺图标 " + c.id);
  c.icon = row.name;
}
fs.writeFileSync(cmdPath, JSON.stringify(doc, null, 2) + "\n");

let svg = fs.readFileSync(svgPath, "utf8");
const have = new Set([...svg.matchAll(/id="i-([^"]+)"/g)].map((m) => m[1]));
const seen = new Set();
let extra = "";
for (const row of Object.values(map)) {
  if (have.has(row.name) || seen.has(row.name)) continue;
  if (!row.body) throw new Error("没有符号也没有图形 " + row.name);
  seen.add(row.name);
  extra += `<symbol id="i-${row.name}" viewBox="0 0 24 24">${row.body}</symbol>\n`;
}
if (extra) {
  if (!svg.includes("</svg>")) throw new Error("icons.svg 没有结尾");
  svg = svg.replace("</svg>", extra + "</svg>");
  fs.writeFileSync(svgPath, svg);
}
const after = new Set([...svg.matchAll(/id="i-([^"]+)"/g)].map((m) => m[1]));
for (const c of doc.commands) if (!after.has(c.icon)) throw new Error("符号缺失 " + c.icon);
console.log("icons", ids.length, "added", seen.size);
