import { views as templateViews } from "@tpl/views";
import type { WorkbenchApi } from "@tpl/workbench/context";
import { Workbench } from "@tpl/workbench/Workbench";
import type { PartId } from "@tpl/workbench/types";
import { previewBridge } from "../previewBridge";
import { useEffect, useMemo, useRef, useState } from "react";
import { Segmented } from "../controls";
import { nextAdd, nextConfirm, nextReduce, stackOf, targetOf, type SpanBox } from "../regionSelect";
import { applyDrag } from "../zones";
import { PART_NAMES } from "../partSettings";
import { allThemes, design, moduleOf, sameModule, selKey, useDesign, type ModuleRef, type Selection } from "../store";

const FRAMES = [
  { value: "fit", label: "适应窗口" },
  { value: "1280x800", label: "1280 × 800" },
  { value: "1440x900", label: "1440 × 900" },
  { value: "1920x1080", label: "1920 × 1080" },
  { value: "1024x768", label: "1024 × 768" }
];

/** 预览：直接渲染导出工程里的 Workbench（同一份代码），所见即所得。 */
export function PreviewView() {
  const doc = useDesign((s) => s.doc);
  const selected = useDesign((s) => s.selected);
  const selecting = useDesign((s) => s.selecting);
  const frame = useDesign((s) => s.frame);
  const pageId = useDesign((s) => s.pageId);
  const stageRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<WorkbenchApi | null>(null);
  useEffect(() => {
    previewBridge.current = apiRef.current;
    if (previewBridge.pending && apiRef.current) {
      const id = previewBridge.pending;
      previewBridge.pending = null;
      apiRef.current.openDialog(id);
    }
    apiRef.current?.showSidePage(pageId);
  });
  const [box, setBox] = useState({ w: 800, h: 600 });
  const [stack, setStack] = useState<Selection[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const suppressClick = useRef(false);
  const multi = useDesign((s) => s.multi);
  const focus = useDesign((s) => s.focus);
  const lock = useDesign((s) => s.lock);
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);
  const themes = useMemo(() => allThemes(doc), [doc]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = 24;
  const fit = frame === "fit";
  const [fw, fh] = fit ? [Math.max(320, box.w - pad * 2), Math.max(240, box.h - pad * 2)] : frame.split("x").map(Number);
  const scale = fit ? 1 : Math.min(1, (box.w - pad * 2) / fw, (box.h - pad * 2) / fh);

  const chosen = multi.length >= 2 ? multi : selected ? [selected] : [];
  const onlyKey = chosen.length === 1 ? selKey(chosen[0]) : null;
  const confirm = selecting ? nextConfirm(stack, onlyKey, selKey) : null;
  const confirmKey = confirm ? selKey(confirm) : "";
  const stackKeys = new Set((selecting ? stack : []).map(selKey));
  const mark = (s: Selection | null, color: string, dashed: boolean) => {
    if (!s) return "";
    const target = targetOf(s);
    const label = s.item || s.sub ? "" : PART_NAMES[s.part];
    return (
      `.ut-frame-inner ${target}::after{content:"";position:absolute;inset:0;border:${dashed ? "1px dashed" : "2px solid"} ${color};pointer-events:none;z-index:60}` +
      (!dashed && label ? `.ut-frame-inner ${target}::before{content:"${label}";position:absolute;left:2px;top:2px;padding:0 6px;font-size:11px;line-height:16px;background:${color};color:var(--ut-hl-fg);border-radius:2px;pointer-events:none;z-index:61}` : "")
    );
  };
  const css = [
    ...(selecting ? stack : []).filter((s) => selKey(s) !== confirmKey).map((s) => mark(s, "var(--ut-stack)", true)),
    ...multi.filter((s) => !stackKeys.has(selKey(s))).map((s) => mark(s, "var(--ut-multi)", true)),
    mark(confirm, "var(--ut-hl)", false),
    mark(selected && !stackKeys.has(selKey(selected)) ? selected : null, "var(--ut-hl)", false),
    dragOver ? `.ut-frame-inner [data-item="${cssValue(dragOver)}"]{outline:1px dashed var(--ut-hl);outline-offset:-1px}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="ut-preview">
      <div className="ut-preview-bar">
        <Segmented
          value={selecting ? "select" : "use"}
          options={[
            { value: "select", label: "选择区域", icon: "pointer" },
            { value: "use", label: "试用", icon: "play" }
          ]}
          onChange={(v) => design.setSelecting(v === "select")}
        />
        <select className="wb-select" value={frame} onChange={(e) => design.setFrame(e.target.value)}>
          {FRAMES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <span className="ut-dim">
          {Math.round(fw)} × {Math.round(fh)} · {Math.round(scale * 100)}%
        </span>
        <span className="wb-sp" />
        <span className="ut-dim">{selecting ? "单击确认；Ctrl 添加；Shift 减少。拖动换顺序；分割条可直接拖动改尺寸。右键进入模块" : "试用模式：可以点菜单、切视图、按快捷键（先点一下预览）"}</span>
        {focus && <span className="ut-dim">只看：{moduleLabel(focus, doc.config.menus)}</span>}
        {lock && <span className="ut-dim">只改：{moduleLabel(lock, doc.config.menus)}</span>}
      </div>
      <div className="ut-stage" ref={stageRef}>
        <div className="ut-frame" style={{ width: fw * scale, height: fh * scale }}>
          <div
            className={"ut-frame-inner" + (selecting ? " selecting" : "")}
            style={{ width: fw, height: fh, transform: scale === 1 ? undefined : `scale(${scale})` }}
            onPointerDownCapture={(e) => {
              if (!selecting || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
              const hit = hitOf(e.target);
              if (!hit?.item) return;
              const startX = e.clientX;
              const startY = e.clientY;
              const from = hit;
              let active = false;
              const move = (ev: PointerEvent) => {
                if (!active && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 5) return;
                active = true;
                const el = document.elementFromPoint(ev.clientX, ev.clientY);
                const over = el ? hitOf(el) : null;
                setDragOver(over?.item && over.item !== from.item ? over.item : null);
              };
              const up = (ev: PointerEvent) => {
                window.removeEventListener("pointermove", move);
                window.removeEventListener("pointerup", up);
                setDragOver(null);
                if (!active) return;
                suppressClick.current = true;
                const el = document.elementFromPoint(ev.clientX, ev.clientY);
                const over = el ? hitOf(el) : null;
                if (over?.item) {
                  const live = design.get();
                  if (live.lock && (!sameModule(moduleOf(from), live.lock) || !sameModule(moduleOf(over), live.lock))) return;
                  const cur = live.doc.config;
                  const next = applyDrag(cur, from, over);
                  if (next !== cur) design.setConfig(() => next);
                }
              };
              window.addEventListener("pointermove", move);
              window.addEventListener("pointerup", up);
            }}
            onClickCapture={(e) => {
              if (!selecting) return;
              if (suppressClick.current) {
                suppressClick.current = false;
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              const el = e.target as HTMLElement;
              if (el.closest?.(".wb-ribbon-fly")) return;
              const frame = e.currentTarget as HTMLDivElement;
              const regions = stackOf(boxesAt(e.target, frame));
              if (!regions.length) return;
              const live = design.get();
              const set = live.multi.length >= 2 ? live.multi : live.selected ? [live.selected] : [];
              const keys = new Set(set.map(selKey));
              const keyOf = (box: HitBox) => selKey(box.sel);
              if (e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                const step = nextReduce(regions, keys, keyOf);
                if (!step) return;
                if (step.kind === "remove") design.removeRegion(step.item.sel);
                else {
                  for (const drop of step.drop) design.removeRegion(drop.sel);
                  design.addRegion(step.item.sel);
                }
                return;
              }
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
                const add = nextAdd(regions, keys, keyOf);
                if (add) design.addRegion(add.sel);
                return;
              }
              const menuButton = el.closest(".wb-menubar-btn, .wb-ribbon-tabs button");
              if (!menuButton) {
                e.preventDefault();
                e.stopPropagation();
              }
              const only = set.length === 1 ? selKey(set[0]) : null;
              const hit = nextConfirm(regions, only, keyOf);
              if (hit && live.lock && !sameModule(moduleOf(hit.sel), live.lock)) return;
              if (hit) design.select(hit.sel);
            }}
            onContextMenu={(e) => {
              const frame = e.currentTarget as HTMLDivElement;
              const hit = stackOf(boxesAt(e.target, frame))[0]?.sel ?? null;
              const live = design.get();
              if (!live.selected && hit && (!live.lock || sameModule(moduleOf(hit), live.lock))) design.select(hit);
              const now = design.get();
              if (!now.selected && !now.focus && !now.lock) return;
              e.preventDefault();
              setCtx({ x: e.clientX, y: e.clientY });
            }}
            onMouseOver={(e) => {
              if (!selecting) return;
              const next = stackOf(boxesAt(e.target, e.currentTarget as HTMLDivElement)).map((box) => box.sel);
              setStack((prev) => (sameList(prev, next) ? prev : next));
            }}
            onMouseLeave={() => setStack([])}
          >
            <Workbench mode="embedded" config={doc.config} onConfigChange={(c) => design.setConfig(() => c)} themes={themes} views={templateViews} scale={scale} apiRef={apiRef} onlyPart={focus?.kind === "part" ? focus.part : null} onlyMenu={focus?.kind === "menu" ? focus.id : null} />
          </div>
          <style>{css}</style>
        </div>
      </div>
      {ctx && <ModuleMenu x={ctx.x} y={ctx.y} onClose={() => setCtx(null)} />}
    </div>
  );
}

function moduleLabel(m: ModuleRef, menus: { id: string; title: string }[]): string {
  if (m.kind === "part") return PART_NAMES[m.part];
  return menus.find((x) => x.id === m.id)?.title ?? m.id;
}

function ModuleMenu({ x, y, onClose }: { x: number; y: number; onClose: () => void }) {
  const selected = useDesign((s) => s.selected);
  const focus = useDesign((s) => s.focus);
  const lock = useDesign((s) => s.lock);
  const mod = selected ? moduleOf(selected) : null;
  const inFocus = mod ? sameModule(focus, mod) : false;
  const inLock = mod ? sameModule(lock, mod) : false;
  useEffect(() => {
    const close = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.(".ut-ctx")) return;
      onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", close, true);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", close, true);
      window.removeEventListener("keydown", esc);
    };
  }, [onClose]);
  const enter = (which: "focus" | "lock") => {
    if (!mod) return;
    if (which === "focus") design.setFocus(inFocus ? null : mod);
    else design.setLock(inLock ? null : mod);
    onClose();
  };
  const leave = (which: "focus" | "lock") => {
    if (which === "focus") design.setFocus(null);
    else design.setLock(null);
    onClose();
  };
  return (
    <div className="ut-ctx" style={{ left: x, top: y }} role="menu">
      {mod && <button type="button" onClick={() => enter("focus")}>{inFocus ? "退出当前模块" : "进入当前模块"}</button>}
      {!mod && focus && <button type="button" onClick={() => leave("focus")}>退出当前模块</button>}
      {mod && <button type="button" onClick={() => enter("lock")}>{inLock ? "退出仅编辑" : "仅编辑当前模块"}</button>}
      {!mod && lock && <button type="button" onClick={() => leave("lock")}>退出仅编辑</button>}
    </div>
  );
}

function cssValue(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

interface HitBox extends SpanBox {
  sel: Selection;
}

function sameList(a: Selection[], b: Selection[]) {
  return a.length === b.length && a.every((s, i) => selKey(s) === selKey(b[i]));
}

function boxesAt(t: EventTarget | null, frame: HTMLElement): HitBox[] {
  const start = t instanceof Element ? t : null;
  if (!start || !frame.contains(start)) return [];
  const out: HitBox[] = [];
  const seen = new Set<string>();
  let node: Element | null = start;
  while (node) {
    if (node instanceof HTMLElement && isRegionNode(node)) {
      const sel = selectionFrom(node);
      if (sel) {
        const key = selKey(sel);
        const rect = node.getBoundingClientRect();
        if (!seen.has(key) && rect.width >= 1 && rect.height >= 1) {
          seen.add(key);
          out.push({ sel, x: rect.left, y: rect.top, w: rect.width, h: rect.height });
        }
      }
    }
    if (node === frame) break;
    node = node.parentElement;
  }
  return out;
}

function isRegionNode(el: HTMLElement) {
  return el.hasAttribute("data-sub") || el.hasAttribute("data-item") || el.hasAttribute("data-zone") || el.hasAttribute("data-row") || el.hasAttribute("data-part");
}

function selectionFrom(el: HTMLElement): Selection | null {
  const part = el.closest("[data-part]")?.getAttribute("data-part");
  if (!part) return null;
  const subAttr = el.getAttribute("data-sub");
  const sub = subAttr === "icon" || subAttr === "text" ? subAttr : undefined;
  if (sub) {
    const item = el.closest("[data-item]")?.getAttribute("data-item") ?? undefined;
    const zone = el.closest("[data-zone]")?.getAttribute("data-zone") ?? undefined;
    return { part: part as Selection["part"], zone, item, sub };
  }
  const item = el.getAttribute("data-item");
  if (item) {
    const zone = el.closest("[data-zone]")?.getAttribute("data-zone") ?? undefined;
    return { part: part as Selection["part"], zone, item };
  }
  const zone = el.hasAttribute("data-zone") ? (el.getAttribute("data-zone") ?? undefined) : undefined;
  const row = el.hasAttribute("data-row") ? (el.getAttribute("data-row") ?? undefined) : undefined;
  if (zone || row) return { part: part as Selection["part"], zone, row };
  if (el.hasAttribute("data-part")) return { part: part as Selection["part"] };
  return null;
}

function hitOf(t: EventTarget | null): Selection | null {
  const el = t as HTMLElement | null;
  if (!el?.closest) return null;
  const part = el.closest("[data-part]")?.getAttribute("data-part");
  if (!part) return null;
  const zone = el.closest("[data-zone]")?.getAttribute("data-zone") ?? undefined;
  const item = el.closest("[data-item]")?.getAttribute("data-item") ?? undefined;
  const subAttr = el.closest("[data-sub]")?.getAttribute("data-sub");
  const sub = subAttr === "icon" || subAttr === "text" ? subAttr : undefined;
  const row = el.closest("[data-row]")?.getAttribute("data-row") ?? undefined;
  return { part: part as PartId, zone, item, sub, row };
}

