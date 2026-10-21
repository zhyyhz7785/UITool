import { isTauri } from "@tpl/core/tauri";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

/** 保存文件：桌面版弹系统「另存为」并由 Rust 写盘，浏览器里直接下载。返回保存路径（浏览器为文件名），取消返回 null。 */
export async function saveFile(name: string, data: Uint8Array | string, filter: { name: string; extensions: string[] }): Promise<string | null> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  if (isTauri()) {
    const path = await save({ defaultPath: name, filters: [filter] });
    if (!path) return null;
    await invoke("write_file", { path, data: Array.from(bytes) });
    return path;
  }
  const url = URL.createObjectURL(new Blob([bytes as BlobPart]));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return name;
}

/** 选一个文本文件读进来。 */
export function openTextFile(accept: string): Promise<{ name: string; text: string } | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = async () => {
      const f = input.files?.[0];
      resolve(f ? { name: f.name, text: await f.text() } : null);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}
