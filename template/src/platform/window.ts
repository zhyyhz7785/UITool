/** 窗口控制（最小化 / 最大化 / 关闭）。属于外壳，不经过内核；浏览器里为空操作。 */
import { isTauri } from "../core/tauri";

async function win() {
  if (!isTauri()) return null;
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  return getCurrentWindow();
}

export const appWindow = {
  available: isTauri(),
  minimize: async () => (await win())?.minimize(),
  toggleMaximize: async () => (await win())?.toggleMaximize(),
  close: async () => {
    const w = await win();
    if (w) await w.close();
    else window.close();
  },
  setTitle: async (title: string) => {
    document.title = title;
    await (await win())?.setTitle(title);
  },
  async onMaximizedChange(cb: (maximized: boolean) => void): Promise<() => void> {
    const w = await win();
    if (!w) return () => {};
    cb(await w.isMaximized());
    return w.onResized(async () => cb(await w.isMaximized()));
  }
};
