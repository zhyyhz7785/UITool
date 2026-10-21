import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { core } from "../core";
import type { OcrDocument, OcrGlyph } from "../core/contract";
import { ocrSession } from "../core/ocrSession";
import type { ViewProps } from "../workbench/types";
import { Button } from "../workbench/ui";

interface Glyph extends OcrGlyph {
  edited?: boolean;
}

interface Line {
  glyphs: Glyph[];
}

function band(g: Glyph): "ok" | "mid" | "bad" {
  if (g.edited || !g.ch.trim()) return "ok";
  if (g.conf < 0.7) return "bad";
  if (g.conf < 0.9) return "mid";
  return "ok";
}

function ink(g: Glyph) {
  return g.ch.trim().length > 0;
}

function openDoc(source: "image" | "pdf", path: string) {
  void core.call("ocr.open", { source, path });
}

/** 图片和 PDF 共用的识别页。结果来自 ocr.open，别的模块调同一个方法即可。 */
export function OcrView(_: ViewProps) {
  const [rev, setRev] = useState(0);
  const [pages, setPages] = useState<Line[][]>([]);
  const [page, setPage] = useState(0);
  const [lo, setLo] = useState(-1);
  const [hi, setHi] = useState(-1);
  const [boxes, setBoxes] = useState(true);
  const [doubtOnly, setDoubtOnly] = useState(false);
  const [query, setQuery] = useState("");
  const anchor = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const doc = ocrSession.get();
  const progress = ocrSession.getProgress();
  const notice = ocrSession.getNotice();

  useEffect(() => {
    const off = ocrSession.subscribe(() => setRev((n) => n + 1));
    return () => { off(); };
  }, []);
  useEffect(() => core.on("ocr.result", (result) => ocrSession.set(result)), []);
  useEffect(() => core.on("ocr.progress", (item) => ocrSession.setProgress(item.page, item.pageCount)), []);

  const docKey = doc ? `${doc.status}|${doc.source}|${doc.path}|${doc.pages.length}` : "";
  useEffect(() => {
    if (!doc || doc.status !== "ready") {
      setPages([]);
      setPage(0);
      setLo(-1);
      setHi(-1);
      return;
    }
    setPages(doc.pages.map((lines) => lines.map((line) => ({ glyphs: line.glyphs.map((g) => ({ ...g })) }))));
    setPage(doc.page || 0);
    setLo(-1);
    setHi(-1);
  }, [docKey]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => ocrSession.notify(""), 1600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const lines = pages[page] ?? [];
  const flat = useMemo(() => {
    const list: { g: Glyph; at: number }[] = [];
    lines.forEach((line) => line.glyphs.forEach((g) => list.push({ g, at: list.length })));
    return list;
  }, [lines]);

  const hits = useMemo(() => {
    const found = new Set<number>();
    const q = query.trim();
    if (!q) return found;
    const text = flat.map((item) => item.g.ch).join("");
    let from = 0;
    while (from < text.length) {
      const at = text.indexOf(q, from);
      if (at < 0) break;
      for (let i = 0; i < q.length; i += 1) found.add(at + i);
      from = at + q.length;
    }
    return found;
  }, [flat, query]);

  const doubts = flat.filter((item) => ink(item.g) && band(item.g) !== "ok").map((item) => item.at);
  const chars = flat.reduce((n, item) => n + [...item.g.ch].length, 0);

  const select = (a: number, b: number) => {
    setLo(Math.min(a, b));
    setHi(Math.max(a, b));
  };

  const jump = (dir: number) => {
    if (!doubts.length) {
      ocrSession.notify("没有存疑字");
      return;
    }
    const cur = lo;
    const next = dir > 0 ? doubts.find((i) => i > cur) : [...doubts].reverse().find((i) => i < cur);
    const pick = next == null ? (dir > 0 ? doubts[0] : doubts[doubts.length - 1]) : next;
    anchor.current = pick;
    select(pick, pick + 1);
  };

  const onSheetDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const hit = (event.target as HTMLElement).closest("[data-i]");
    const start = hit ? Number((hit as HTMLElement).dataset.i) : -1;
    const shift = event.shiftKey;
    sheet.setPointerCapture(event.pointerId);
    let moved = false;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && dx * dx + dy * dy < 16) return;
      moved = true;
      const rect = { left: Math.min(startX, ev.clientX), top: Math.min(startY, ev.clientY), right: Math.max(startX, ev.clientX), bottom: Math.max(startY, ev.clientY) };
      const ids: number[] = [];
      sheet.querySelectorAll("[data-i]").forEach((node) => {
        const box = node.getBoundingClientRect();
        const overlap = box.left < rect.right && box.right > rect.left && box.top < rect.bottom && box.bottom > rect.top;
        if (overlap && ink(flat[Number((node as HTMLElement).dataset.i)]?.g ?? { ch: "", conf: 1 })) ids.push(Number((node as HTMLElement).dataset.i));
      });
      if (ids.length) select(Math.min(...ids), Math.max(...ids) + 1);
    };
    const up = (ev: PointerEvent) => {
      sheet.removeEventListener("pointermove", move);
      sheet.removeEventListener("pointerup", up);
      if (!moved && start >= 0) {
        if (shift) select(Math.min(anchor.current, start), Math.max(anchor.current, start) + 1);
        else {
          anchor.current = start;
          select(start, start + 1);
        }
      }
      ev.preventDefault();
    };
    sheet.addEventListener("pointermove", move);
    sheet.addEventListener("pointerup", up);
  };

  const editGlyph = (at: number, text: string) => {
    const next = text.replace(/\n/g, "");
    setPages((prev) => prev.map((pg, pi) => {
      if (pi !== page) return pg;
      let seen = 0;
      return pg.map((line) => ({
        glyphs: line.glyphs.map((g) => {
          const mine = seen === at;
          seen += 1;
          if (!mine) return g;
          if (!next || next === g.ch) return g;
          return { ...g, ch: next, conf: 1, edited: true };
        })
      }));
    }));
  };

  const pageText = () => lines.map((line) => line.glyphs.map((g) => g.ch).join("")).join("\n");

  return (
    <div className={"v-ocr" + (boxes ? " show-boxes" : "") + (doubtOnly ? " doubt-only" : "")} data-rev={rev}>
      <div className="v-ocr-bar">
        <Button onClick={() => openDoc("image", "附图.jpg")}>图片</Button>
        <Button onClick={() => openDoc("pdf", "扫描件.pdf")}>PDF</Button>
        <Button onClick={() => openDoc("image", "empty")}>无字</Button>
        <Button onClick={() => openDoc("image", "nomodel")}>无模型</Button>
        <label className="v-ocr-check"><input type="checkbox" checked={boxes} onChange={(e) => setBoxes(e.target.checked)} />文字框</label>
        <label className="v-ocr-check"><input type="checkbox" checked={doubtOnly} onChange={(e) => setDoubtOnly(e.target.checked)} />只看存疑</label>
        <span className="v-ocr-sp" />
        <Button primary onClick={() => { void navigator.clipboard?.writeText(pageText()); ocrSession.notify("已复制"); }}>复制全部</Button>
        <Button onClick={() => void core.call("ocr.save", { format: "md" })}>保存</Button>
      </div>
      <div className="v-ocr-body">
        <div className="v-ocr-stage">
          {doc?.status === "ready" && lines.length > 0 ? (
            <div className="v-ocr-sheet" ref={sheetRef} onPointerDown={onSheetDown}>
              {doc.pageCount > 1 && (
                <div className="v-ocr-pages">
                  {Array.from({ length: doc.pageCount }, (_, i) => (
                    <button key={i} type="button" className={i === page ? "on" : ""} onClick={() => { setPage(i); setLo(-1); setHi(-1); }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
              {lines.map((line, li) => (
                <div key={li} className={"v-ocr-line" + (page === 0 && li === 0 ? " head" : "") + (page === 0 && li === 1 ? " title" : "")}>
                  {line.glyphs.map((g, gi) => {
                    const at = lines.slice(0, li).reduce((n, item) => n + item.glyphs.length, 0) + gi;
                    const kind = band(g);
                    const on = at >= lo && at < hi;
                    return (
                      <span
                        key={gi}
                        data-i={ink(g) ? at : undefined}
                        className={"v-ocr-g " + kind + (ink(g) ? " ink" : " gap") + (on ? " on" : "") + (hits.has(at) ? " find" : "")}
                        title={g.edited ? "已校对" : ink(g) ? `置信度 ${g.conf.toFixed(2)}` : undefined}
                      >
                        {g.ch}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="v-ocr-mask">
              <strong>{maskTitle(doc, progress)}</strong>
              <p>{maskBody(doc)}</p>
              {doc?.status === "busy" && <div className="v-ocr-barline"><i /></div>}
            </div>
          )}
        </div>
        <aside className="v-ocr-rail">
          <div className="v-ocr-hd"><b>识别文字</b><span>{doc?.status === "ready" ? `${chars} 字` : ""}</span></div>
          <p className="v-ocr-legend"><i className="ok" />较准<i className="mid" />可能有误<i className="bad" />可能错误或漏掉<span>{doc?.engine || "ppocrv6-small"}</span></p>
          <div className="v-ocr-find">
            <input className="wb-input" placeholder="在识别结果里查找" aria-label="在识别结果里查找" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button onClick={() => jump(-1)}>上一处</Button>
            <Button onClick={() => jump(1)}>下一处</Button>
          </div>
          <p className="v-ocr-note">改过的字不再着警告色。「只看存疑」会藏起较准的字。</p>
          <div className="v-ocr-text">
            {doc?.status === "ready" ? lines.map((line, li) => {
              const visible = line.glyphs.filter((g) => !doubtOnly || !ink(g) || band(g) !== "ok");
              if (doubtOnly && !visible.some(ink)) return null;
              return (
                <div key={li}>
                  {visible.map((g, gi) => {
                    const at = line.glyphs.indexOf(g);
                    const abs = lines.slice(0, li).reduce((n, item) => n + item.glyphs.length, 0) + (at < 0 ? gi : at);
                    if (!ink(g)) return <span key={gi}>{g.ch}</span>;
                    const kind = band(g);
                    return (
                      <span
                        key={gi}
                        className={"v-ocr-ch " + kind + (abs >= lo && abs < hi ? " on" : "") + (hits.has(abs) ? " find" : "")}
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                        onClick={() => { anchor.current = abs; select(abs, abs + 1); }}
                        onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                        onBlur={(e) => {
                          const next = (e.currentTarget.textContent ?? "").replace(/\n/g, "");
                          if (!next || next === g.ch) {
                            e.currentTarget.textContent = g.ch;
                            return;
                          }
                          editGlyph(abs, next);
                        }}
                      >
                        {g.ch}
                      </span>
                    );
                  })}
                </div>
              );
            }) : <p className="v-ocr-note">{maskBody(doc)}</p>}
          </div>
          <div className="v-ocr-status">
            {doc?.status === "ready" ? `${doc.engine} · ${chars} 字 · ${doubts.length} 个存疑` : maskTitle(doc, progress)}
            {doc?.path ? ` · ${doc.path}` : ""}
          </div>
        </aside>
      </div>
      {notice ? <div className="v-ocr-toast" role="status">{notice}</div> : null}
    </div>
  );
}

function maskTitle(doc: OcrDocument | null, progress: { page: number; pageCount: number } | null) {
  if (!doc) return "打开图片或 PDF";
  if (doc.status === "busy") return progress && progress.page > 0 ? `正在识别第 ${progress.page} / ${progress.pageCount} 页…` : "正在识别…";
  if (doc.status === "empty") return "没有识别到文字";
  if (doc.status === "nomodel") return "未找到 OCR 模型";
  return doc.path;
}

function maskBody(doc: OcrDocument | null) {
  if (!doc) return "图片和 PDF 都走 ocr.open。这是样例，不写文件。";
  if (doc.status === "busy") return "在本机读取，原来的文件不会被修改。";
  if (doc.status === "empty") return "这页上没有可用的文字，没有写入文件。";
  if (doc.status === "nomodel") return "未找到 OCR 模型（det.onnx / rec.onnx）。";
  return "";
}
