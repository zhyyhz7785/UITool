// Hy3d制图.uitool.json → hy3d ui/design 的 ribbon、workbench、menus。
// 命令 id 必须能从 ui/commands.json 的 include（或旧的 commands 数组）里找到。缺一条就中止，不写半份。
// 不写 blender.json、menus.blender.json，不改 commands.json，不改皮肤 CSS。
import fs from "node:fs";
import path from "node:path";
import { handFile, hy3dRoot, readJson } from "./hy3d-paths.mjs";
import { commitHy3dDesign, handDocument, STAMP } from "./hy3d-spec.mjs";

if (!fs.existsSync(handFile)) throw new Error("没有 Hy3d制图.uitool.json。先运行 node scripts/pull-hy3d.mjs");

const doc = readJson(handFile);
const config = doc.config;
if (doc.kind !== "uitool-design" || !config?.schemes) throw new Error("不是 UITool 设计文件");

const hy3d = hy3dRoot();
const readUiText = (rel) => fs.readFileSync(path.join(hy3d, "ui", rel), "utf8");
const writeUiText = (rel, text) => {
  const file = path.join(hy3d, "ui", rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log("写入 ui/" + rel);
};
await commitHy3dDesign(config, readUiText, writeUiText);
fs.mkdirSync(path.dirname(handFile), { recursive: true });
fs.writeFileSync(handFile, JSON.stringify(handDocument(config, doc.customThemes), null, 2) + "\n");
console.log("写入 " + handFile);
console.log(STAMP);
