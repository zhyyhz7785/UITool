// 节点脚本用的路径。设计器不引用这个文件。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hy3dReadRoot as hy3dRoot, hy3dWriteRoot } from "./path-policy.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const uitoolRoot = root;
export { hy3dRoot, hy3dWriteRoot };
/** 手改设计放在本机配置目录，不写进产品主仓。HY3D_HAND 可以改位置。 */
export const handFile = process.env.HY3D_HAND
  ? path.resolve(process.env.HY3D_HAND)
  : path.join(os.homedir(), ".config", "uitool", "Hy3d制图.uitool.json");
export const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
