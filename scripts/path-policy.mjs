// 主仓只读，开发工作树在授权后才可写。前端、Rust 和这里用同一份约定。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

export function policyFile() {
  if (process.env.UITOOL_POLICY) return path.resolve(process.env.UITOOL_POLICY);
  const home = os.homedir();
  return path.join(home, ".config", "uitool", "paths.json");
}

export function readPolicy() {
  try {
    const data = JSON.parse(fs.readFileSync(policyFile(), "utf8"));
    return Array.isArray(data.products) ? data.products : [];
  } catch {
    return [];
  }
}

export function writePolicy(products) {
  const file = policyFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const text = JSON.stringify({ products }, null, 2) + "\n";
  atomicWrite(file, text);
}

export function normalize(file) {
  return path.resolve(String(file ?? "")).replace(/\\/g, "/");
}

function hasDotDot(file) {
  return String(file ?? "").replace(/\\/g, "/").split("/").includes("..");
}

function under(file, root) {
  if (!root) return false;
  const n = normalize(file);
  const r = normalize(root);
  return n === r || n.startsWith(r.endsWith("/") ? r : r + "/");
}

/** 链接的开发工作树：git-dir 和 git-common-dir 不是同一个目录。主仓返回 false。 */
export function isLinkedWorktree(dir) {
  if (!dir || !fs.existsSync(dir)) return false;
  const run = (args) => spawnSync("git", ["-C", dir, ...args], { encoding: "utf8" });
  const gitDir = run(["rev-parse", "--git-dir"]);
  const common = run(["rev-parse", "--git-common-dir"]);
  if (gitDir.status !== 0 || common.status !== 0) return false;
  const a = path.resolve(dir, gitDir.stdout.trim());
  const b = path.resolve(dir, common.stdout.trim());
  return normalize(a) !== normalize(b);
}

export function findProduct(products, file) {
  const list = products ?? readPolicy();
  return list.find((p) => under(file, p.main) || under(file, p.worktree)) ?? null;
}

export function canRead(file, products) {
  if (hasDotDot(file)) return false;
  const hit = findProduct(products, file);
  return !!hit;
}

export function canWriteProduct(file, products) {
  if (hasDotDot(file)) return false;
  const hit = findProduct(products, file);
  if (!hit?.authorized || !hit.worktree) return false;
  if (!under(file, hit.worktree)) return false;
  if (hit.main && normalize(hit.worktree) === normalize(hit.main)) return false;
  if (hit.main && under(file, hit.main) && !under(hit.worktree, hit.main)) return false;
  return isLinkedWorktree(hit.worktree);
}

/** 用户另存设计、导出 zip。不能写进已登记的主仓；工作树里可以。 */
export function canWriteUserFile(file, products) {
  if (hasDotDot(file)) return false;
  const list = products ?? readPolicy();
  for (const item of list) {
    if (!item.main || !under(file, item.main)) continue;
    const inWorktree = item.worktree && under(file, item.worktree) && normalize(item.worktree) !== normalize(item.main);
    if (!inWorktree) return false;
  }
  return true;
}

export function atomicWrite(file, text) {
  const dest = path.resolve(file);
  const tmp = dest + ".uitool-tmp";
  const bak = dest + ".uitool-bak";
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(tmp, text);
  if (fs.existsSync(dest)) fs.renameSync(dest, bak);
  try {
    fs.renameSync(tmp, dest);
  } catch (error) {
    if (fs.existsSync(bak) && !fs.existsSync(dest)) fs.renameSync(bak, dest);
    throw error;
  }
  if (fs.existsSync(bak)) fs.rmSync(bak, { force: true });
}

export function hy3dReadRoot() {
  if (process.env.HY3D_ROOT) return path.resolve(process.env.HY3D_ROOT);
  const hit = readPolicy().find((p) => p.id === "hy3d");
  const dir = hit?.worktree || hit?.main || "";
  if (!dir) throw new Error("没有 hy3d 主仓。在连接里填写，或设置 HY3D_ROOT。");
  return path.resolve(dir);
}

export function hy3dWriteRoot() {
  if (process.env.HY3D_WORKTREE) {
    const dir = path.resolve(process.env.HY3D_WORKTREE);
    if (!isLinkedWorktree(dir)) throw new Error("HY3D_WORKTREE 不是已授权的开发工作树：" + dir);
    return dir;
  }
  const hit = readPolicy().find((p) => p.id === "hy3d");
  if (!hit?.worktree || !canWriteProduct(path.join(hit.worktree, "ui"), [hit])) throw new Error("没有可写的 hy3d 开发工作树");
  return path.resolve(hit.worktree);
}

export function hymdReadRoot() {
  if (process.env.HYMD_ROOT) return path.resolve(process.env.HYMD_ROOT);
  const hit = readPolicy().find((p) => p.id === "hymd");
  const dir = hit?.worktree || hit?.main || "";
  if (!dir) throw new Error("没有 HyMd 主仓。在连接里填写，或设置 HYMD_ROOT。");
  return path.resolve(dir);
}

export function hymdWriteRoot() {
  if (process.env.HYMD_WORKTREE) {
    const dir = path.resolve(process.env.HYMD_WORKTREE);
    if (!isLinkedWorktree(dir)) throw new Error("HYMD_WORKTREE 不是已授权的开发工作树：" + dir);
    return dir;
  }
  const hit = readPolicy().find((p) => p.id === "hymd");
  if (!hit?.worktree || !canWriteProduct(path.join(hit.worktree, "src"), [hit])) throw new Error("没有可写的 HyMd 开发工作树");
  return path.resolve(hit.worktree);
}
