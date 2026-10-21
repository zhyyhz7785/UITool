import { isTauri } from "@tpl/core/tauri";
import { invoke } from "@tauri-apps/api/core";

/** 允许读写的根。手改文件在设计规范仓库，不在 hy3d 里面。 */
const ROOTS = ["E:/Code/hy3d", "E:/Code/HyMdTauri2", "E:/Code/UI设计规范/13-软件模板/01-AutoCAD侧"];

export const HY3D = "E:/Code/hy3d";
export const HYMD = "E:/Code/HyMdTauri2";
export const HY3D_HAND = "E:/Code/UI设计规范/13-软件模板/01-AutoCAD侧/Hy3d制图.uitool.json";

function allowed(file: string) {
  const n = file.replace(/\\/g, "/");
  if (n.split("/").includes("..")) return false;
  return ROOTS.some((root) => n === root || n.toLowerCase().startsWith(root.toLowerCase() + "/"));
}

async function callFs(op: "read" | "write", path: string, text?: string): Promise<string> {
  if (!allowed(path)) throw new Error("路径不在允许的仓库里");
  if (isTauri()) {
    if (op === "read") return invoke<string>("read_file", { path });
    const data = Array.from(new TextEncoder().encode(text ?? ""));
    await invoke("write_file", { path, data });
    return "";
  }
  const res = await fetch("/__uitool/fs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ op, path, text })
  });
  const body = (await res.json()) as { text?: string; error?: string };
  if (!res.ok) throw new Error(body.error || "读写失败");
  return body.text ?? "";
}

export const readText = (path: string) => callFs("read", path);
export const writeText = (path: string, text: string) => callFs("write", path, text);

export const jsonText = (data: unknown) => JSON.stringify(data, null, 2) + "\n";
