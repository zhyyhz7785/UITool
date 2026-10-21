import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { Transport } from "./index";

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

type Handler = (data: unknown) => void;

/** 所有内核事件走一个通道 core://event，载荷 { event, data }，这里再按名字分发。 */
export function createTauriTransport(): Transport {
  const handlers = new Map<string, Set<Handler>>();
  let listening: Promise<unknown> | null = null;
  const ensure = () => {
    listening ??= listen<{ event: string; data: unknown }>("core://event", (e) => {
      handlers.get(e.payload.event)?.forEach((h) => h(e.payload.data));
      handlers.get("*")?.forEach((h) => h(e.payload));
    });
  };
  return {
    kind: "tauri",
    call: (method, params) => invoke("core_call", { method, params: params ?? null }),
    on(event, handler) {
      ensure();
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(handler);
      return () => handlers.get(event)?.delete(handler);
    }
  };
}
