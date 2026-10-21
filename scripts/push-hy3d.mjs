// Hy3d制图.uitool.json → hy3d ui/design 的五份规格。
// 命令 id 必须在 ui/commands.json 里，缺一条就中止，不写半份。不改 commands.json，不改皮肤 CSS。
import fs from "node:fs";
import path from "node:path";
import { handFile, hy3dRoot, readJson } from "./hy3d-paths.mjs";
import { menuSpec, referencedIds, SCHEMES, specFromScheme, STAMP } from "./hy3d-spec.mjs";

if (!fs.existsSync(handFile)) throw new Error("没有 Hy3d制图.uitool.json。先运行 node scripts/pull-hy3d.mjs");

const doc = readJson(handFile);
const config = doc.config;
if (doc.kind !== "uitool-design" || !config?.schemes) throw new Error("不是 UITool 设计文件");

const hy3d = hy3dRoot();
const commands = readJson(path.join(hy3d, "ui/commands.json")).commands;
const known = new Set(commands.map((c) => c.id));

const specs = [];
for (const s of SCHEMES) {
  const scheme = config.schemes.find((x) => x.id === s.scheme);
  if (!scheme?.ui) throw new Error("设计里没有方案 " + s.scheme);
  const menus = scheme.menus ?? (config.scheme === scheme.id ? config.menus : []);
  specs.push({ ...s, spec: specFromScheme(scheme, s.skin), menus: menuSpec(menus) });
}

const mainMenus = specs.find((s) => s.scheme === "cad2d-best").menus;
const blenderMenus = specs.find((s) => s.scheme === "cad2d-good").menus;
const missing = [...referencedIds(specs.map((s) => s.spec), [mainMenus, blenderMenus])].filter((id) => !known.has(id));
if (missing.length) throw new Error("缺少 hy3d 命令：" + missing.join(", "));

const designOut = path.join(hy3d, "ui/design");
fs.mkdirSync(designOut, { recursive: true });
const write = (name, data) => {
  fs.writeFileSync(path.join(designOut, name), JSON.stringify(data, null, 2) + "\n");
  console.log("写入 ui/design/" + name);
};
for (const s of specs) write(s.file, s.spec);
write("menus.json", mainMenus);
write("menus.blender.json", blenderMenus);
console.log(STAMP);
