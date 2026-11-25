import { isTauri } from "@tpl/core/tauri";
import { invoke } from "@tauri-apps/api/core";
import { assertReadable, assertWritable, rememberPaths, textHash, type ProductPaths } from "./paths";

const seen = new Map<string, string>();

function keyOf(file: string) {
  return file.replace(/\\/g, "/");
}

async function post(body: unknown): Promise<{ text?: string; error?: string; products?: ProductPaths[] }> {
  const res = await fetch("/__uitool/fs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = (await res.json()) as { text?: string; error?: string; products?: ProductPaths[] };
  if (!res.ok) throw new Error(data.error || "读写失败");
  return data;
}

export async function publishPaths(products: ProductPaths[]) {
  rememberPaths(products);
  if (isTauri()) {
    await invoke("set_path_policy", { products: JSON.stringify(products) });
    return;
  }
  await post({ op: "set-policy", products });
}

export async function readText(file: string): Promise<string> {
  assertReadable(file);
  const text = isTauri() ? await invoke<string>("read_file", { path: file }) : (await post({ op: "read", path: file })).text ?? "";
  seen.set(keyOf(file), textHash(text));
  return text;
}

export async function writeText(file: string, text: string) {
  assertWritable(file);
  const expect = seen.get(keyOf(file));
  if (isTauri()) {
    const data = Array.from(new TextEncoder().encode(text));
    await invoke("write_product", { path: file, data, expect });
  } else {
    await post({ op: "write", path: file, text, expect });
  }
  seen.set(keyOf(file), textHash(text));
}

export const jsonText = (data: unknown) => JSON.stringify(data, null, 2) + "\n";

export function rememberedHash(file: string) {
  return seen.get(keyOf(file));
}
