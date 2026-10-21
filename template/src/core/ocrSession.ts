import type { OcrDocument } from "./contract";

/** 最近一次识别。页还没挂上时先写这里，挂上后再读。 */
type Listener = () => void;

let doc: OcrDocument | null = null;
let progress: { page: number; pageCount: number } | null = null;
let notice = "";
const listeners = new Set<Listener>();

function poke() {
  listeners.forEach((fn) => fn());
}

export const ocrSession = {
  get: () => doc,
  getProgress: () => progress,
  getNotice: () => notice,
  set: (next: OcrDocument | null) => {
    doc = next;
    if (next?.status !== "busy") progress = null;
    poke();
  },
  setProgress: (page: number, pageCount: number) => {
    progress = { page, pageCount };
    poke();
  },
  notify: (message: string) => {
    notice = message;
    poke();
  },
  subscribe: (fn: Listener) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};
