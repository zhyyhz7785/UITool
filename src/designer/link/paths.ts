export interface ProductPaths {
  id: "hy3d" | "hymd";
  main: string;
  worktree: string;
  authorized: boolean;
}

const KEY = "uitool.paths.v1";

export const EMPTY_PATHS: ProductPaths[] = [
  { id: "hy3d", main: "", worktree: "", authorized: false },
  { id: "hymd", main: "", worktree: "", authorized: false }
];

export function loadPaths(): ProductPaths[] {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? "null") as ProductPaths[] | null;
    if (!Array.isArray(data)) return EMPTY_PATHS.map((item) => ({ ...item }));
    return EMPTY_PATHS.map((item) => ({ ...item, ...data.find((row) => row.id === item.id) }));
  } catch {
    return EMPTY_PATHS.map((item) => ({ ...item }));
  }
}

export function rememberPaths(products: ProductPaths[]) {
  localStorage.setItem(KEY, JSON.stringify(products));
}

export function textHash(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = Math.imul(h, 33) ^ text.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function norm(file: string) {
  return file.replace(/\\/g, "/").replace(/\/+$/, "");
}

function under(file: string, root: string) {
  if (!root.trim()) return false;
  const n = norm(file);
  const r = norm(root);
  return n === r || n.toLowerCase().startsWith(r.toLowerCase() + "/");
}

export function productOf(file: string, products = loadPaths()): ProductPaths | null {
  if (file.replace(/\\/g, "/").split("/").includes("..")) return null;
  return products.find((item) => under(file, item.main) || under(file, item.worktree)) ?? null;
}

export function assertReadable(file: string) {
  if (!productOf(file)) throw new Error("路径不在已登记的产品目录里");
}

export function assertWritable(file: string) {
  const hit = productOf(file);
  if (!hit?.authorized || !hit.worktree || !under(file, hit.worktree)) throw new Error("只能写入已授权的开发工作树，主仓不能直接改");
  if (hit.main && norm(hit.worktree).toLowerCase() === norm(hit.main).toLowerCase()) throw new Error("工作树不能就是主仓");
}

export function readRoot(id: ProductPaths["id"]): string {
  const hit = loadPaths().find((item) => item.id === id);
  const root = (hit?.worktree || hit?.main || "").trim();
  if (!root) throw new Error(id === "hy3d" ? "先填写 hy3d 的主仓或开发工作树" : "先填写 HyMd 的主仓或开发工作树");
  return root;
}

export function writeRoot(id: ProductPaths["id"]): string {
  const hit = loadPaths().find((item) => item.id === id);
  if (!hit?.authorized || !hit.worktree.trim()) throw new Error(id === "hy3d" ? "先选择并授权 hy3d 的开发工作树" : "先选择并授权 HyMd 的开发工作树");
  if (hit.main && norm(hit.worktree).toLowerCase() === norm(hit.main).toLowerCase()) throw new Error("工作树不能就是主仓");
  return hit.worktree.trim();
}
