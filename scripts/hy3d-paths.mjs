// 节点脚本用的路径。设计器不引用这个文件。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const uitoolRoot = root;
export const hy3dRoot = () => process.env.HY3D_ROOT ?? "E:/Code/hy3d";
export const handFile = path.resolve(root, "../13-软件模板/01-AutoCAD侧/Hy3d制图.uitool.json");
export const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
