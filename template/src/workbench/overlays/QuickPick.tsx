import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../../icons/Icon";
import { useWorkbench, type QuickPickItem } from "../context";
import { Kbd } from "../ui";

function match(label: string, q: string): boolean {
  if (!q) return true;
  const s = label.toLowerCase();
  let i = 0;
  for (const ch of q.toLowerCase()) {
    i = s.indexOf(ch, i);
    if (i < 0) return false;
    i++;
  }
  return true;
}

/** 命令面板 / 快速选择（Ctrl+Shift+P）。上下键移动，回车确认，Esc 取消。 */
export function QuickPick() {
  const wb = useWorkbench();
  const req = wb.state.quickPick!;
  const [q, setQ] = useState("");
  const items = useMemo(() => req.items.filter((it) => match(it.label + " " + (it.description ?? ""), q)), [req.items, q]);
  const [idx, setIdx] = useState(() => Math.max(0, req.items.findIndex((i) => i.id === req.activeId)));
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => {
    const it = items[idx];
    if (it) req.onFocus?.(it);
    listRef.current?.querySelector(`[data-idx="${idx}"]`)?.scrollIntoView({ block: "nearest" });
    return undefined;
  }, [idx, items]);

  const finish = (item: QuickPickItem | undefined) => wb.resolveQuickPick(item);

  return (
    <div className="wb-overlay-top" onPointerDown={(e) => e.target === e.currentTarget && finish(undefined)}>
      <div className="wb-quickpick" role="dialog">
        <input
          ref={inputRef}
          className="wb-quickpick-input"
          placeholder={req.placeholder}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setIdx(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setIdx((i) => Math.min(items.length - 1, i + 1));
            else if (e.key === "ArrowUp") setIdx((i) => Math.max(0, i - 1));
            else if (e.key === "Enter") finish(items[idx]);
            else if (e.key === "Escape") finish(undefined);
            else return;
            e.preventDefault();
            e.stopPropagation();
          }}
        />
        <div className="wb-quickpick-list" ref={listRef}>
          {items.length === 0 && <div className="wb-quickpick-empty">没有匹配项</div>}
          {items.map((it, i) => (
            <div key={it.id}>
              {it.group && it.group !== items[i - 1]?.group && <div className="wb-quickpick-group">{it.group}</div>}
              <div className={"wb-quickpick-item" + (i === idx ? " focused" : "")} data-idx={i} onMouseMove={() => i !== idx && setIdx(i)} onClick={() => finish(it)}>
                <span className="wb-quickpick-icon">{it.icon && <Icon name={it.icon} size={14} />}</span>
                <span className="wb-quickpick-label">{it.label}</span>
                {it.description && <span className="wb-quickpick-desc">{it.description}</span>}
                <span className="wb-sp" />
                <Kbd keys={it.keybinding} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
