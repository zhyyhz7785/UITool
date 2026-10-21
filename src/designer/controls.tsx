import { formatColor, parseColor } from "@tpl/theme/color";
import { Icon, iconCategories, icons } from "@tpl/icons/Icon";
import { IconButton, Toggle } from "@tpl/workbench/ui";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export function Section({ title, children, actions, defaultOpen = true }: { title: string; children: ReactNode; actions?: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="ut-section">
      <div className="wb-section-head" onClick={() => setOpen(!open)}>
        <Icon name={open ? "chevron-down" : "chevron-right"} size={14} />
        <span className="ut-grow">{title}</span>
        {actions && <span onClick={(e) => e.stopPropagation()}>{actions}</span>}
      </div>
      {open && <div className="ut-section-body">{children}</div>}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="ut-field" title={hint}>
      <span className="ut-field-label">{label}</span>
      <span className="ut-field-ctl">{children}</span>
    </div>
  );
}

export function TextField({ value, onChange, placeholder, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return <input className={"wb-input ut-full" + (mono ? " ut-mono" : "")} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}

export function NumberField({ value, onChange, min, max, step = 1, unit = "px" }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string }) {
  return (
    <span className="ut-number">
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <input className="wb-input" type="number" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))} />
      <span className="ut-unit">{unit}</span>
    </span>
  );
}

export function ToggleField({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="ut-field" title={hint}>
      <span className="ut-field-label">{label}</span>
      <span className="ut-field-ctl">
        <Toggle checked={checked} onChange={onChange} />
      </span>
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string; icon?: string }[]; onChange: (v: T) => void }) {
  return (
    <span className="ut-seg">
      {options.map((o) => (
        <button key={o.value} type="button" className={o.value === value ? "on" : ""} onClick={() => onChange(o.value)} title={o.label}>
          {o.icon && <Icon name={o.icon} size={14} />}
          {o.label}
        </button>
      ))}
    </span>
  );
}

/** 颜色：取色器 + 文本（支持 #RRGGBBAA / rgba）。 */
export function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  const c = parseColor(value);
  const hex6 = c ? formatColor([c[0], c[1], c[2], 1]) : "#000000";
  return (
    <span className="ut-color">
      <span className="ut-color-swatch" style={{ background: value }}>
        <input
          type="color"
          value={hex6}
          onChange={(e) => {
            const n = parseColor(e.target.value)!;
            onChange(formatColor([n[0], n[1], n[2], c?.[3] ?? 1]));
          }}
        />
      </span>
      <input
        className="wb-input ut-mono"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (parseColor(e.target.value)) onChange(e.target.value);
        }}
        onBlur={() => setText(value)}
      />
    </span>
  );
}

/** 图标选择：按钮 + 弹出网格，可搜索中英文名 / id。 */
export function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("pointerdown", close, true);
    return () => window.removeEventListener("pointerdown", close, true);
  }, [open]);
  const groups = useMemo(() => filterIcons(q), [q]);
  return (
    <span className="ut-iconpick" ref={ref}>
      <button type="button" className="ut-iconpick-btn" title={value} onClick={() => setOpen(!open)}>
        <Icon name={value} size={16} />
      </button>
      {open && (
        <div className="ut-iconpick-pop">
          <input className="wb-input ut-full" autoFocus placeholder="搜索图标（中文 / 英文 / id）" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="ut-iconpick-grid">
            {groups.map((g) => (
              <div key={g.id}>
                <div className="ut-iconpick-cat">{g.name}</div>
                <div className="ut-icon-grid">
                  {g.icons.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={"ut-icon-cell" + (id === value ? " on" : "")}
                      title={`${icons[id].n}${icons[id].e ? " " + icons[id].e : ""} · ${id}`}
                      onClick={() => {
                        onChange(id);
                        setOpen(false);
                      }}
                    >
                      <Icon name={id} size={18} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </span>
  );
}

export function filterIcons(q: string) {
  const s = q.trim().toLowerCase();
  return iconCategories
    .map((c) => ({ ...c, icons: c.icons.filter((id) => !s || id.toLowerCase().includes(s) || icons[id].n.includes(q.trim()) || (icons[id].e ?? "").toLowerCase().includes(s)) }))
    .filter((c) => c.icons.length > 0);
}

export interface Column<T> {
  key: keyof T & string;
  label: string;
  type?: "text" | "icon" | "select" | "number" | "check";
  options?: { value: string; label: string }[];
  width?: number | string;
  placeholder?: string;
}

/** 一排可拖动换顺序的标签。 */
export function ChipList({ items, selectedId, onSelect, onReorder }: { items: { id: string; label: string }[]; selectedId?: string; onSelect?: (id: string) => void; onReorder: (ids: string[]) => void }) {
  const drag = useRef<string | null>(null);
  return (
    <div className="ut-chips">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          draggable
          className={"ut-chip" + (it.id === selectedId ? " on" : "")}
          onClick={() => onSelect?.(it.id)}
          onDragStart={(e) => {
            drag.current = it.id;
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", it.id);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("over");
          }}
          onDragLeave={(e) => e.currentTarget.classList.remove("over")}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("over");
            const from = drag.current;
            if (!from || from === it.id) return;
            const ids = items.map((x) => x.id);
            const a = ids.indexOf(from);
            const b = ids.indexOf(it.id);
            if (a < 0 || b < 0) return;
            ids.splice(a, 1);
            ids.splice(b, 0, from);
            onReorder(ids);
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/** 列表编辑：每行一组输入，可拖动 / 上移 / 下移 / 删除 / 添加。 */
export function ListEditor<T extends object>({ items, columns, onChange, create, addLabel = "添加" }: { items: T[]; columns: Column<T>[]; onChange: (items: T[]) => void; create: () => T; addLabel?: string }) {
  const set = (i: number, patch: Partial<T>) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="ut-list">
      {items.map((it, i) => (
        <div
          key={i}
          className="ut-list-row"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const from = Number(e.dataTransfer.getData("text/plain"));
            if (!Number.isInteger(from) || from === i || from < 0 || from >= items.length) return;
            const next = [...items];
            const [row] = next.splice(from, 1);
            next.splice(i, 0, row);
            onChange(next);
          }}
        >
          <span
            className="ut-drag"
            draggable
            title="拖动排序"
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", String(i));
            }}
          >
            ⋮⋮
          </span>
          {columns.map((col) => {
            const v = it[col.key] as unknown;
            const style = { width: col.width, flex: col.width ? "none" : 1 };
            if (col.type === "icon") return <IconPicker key={col.key} value={String(v ?? "")} onChange={(x) => set(i, { [col.key]: x } as Partial<T>)} />;
            if (col.type === "check") return <Toggle key={col.key} checked={v === true} onChange={(x) => set(i, { [col.key]: x } as Partial<T>)} />;
            if (col.type === "select")
              return (
                <select key={col.key} className="wb-select" style={style} value={String(v ?? "")} onChange={(e) => set(i, { [col.key]: e.target.value } as Partial<T>)}>
                  {col.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              );
            return (
              <input
                key={col.key}
                className="wb-input"
                style={style}
                title={col.label}
                placeholder={col.placeholder ?? col.label}
                type={col.type === "number" ? "number" : "text"}
                value={v == null ? "" : String(v)}
                onChange={(e) => set(i, { [col.key]: col.type === "number" ? (e.target.value === "" ? undefined : Number(e.target.value)) : e.target.value } as Partial<T>)}
              />
            );
          })}
          <span className="ut-list-ops">
            <IconButton icon="arrow-up" title="上移" size={13} onClick={() => move(i, -1)} />
            <IconButton icon="arrow-down" title="下移" size={13} onClick={() => move(i, 1)} />
            <IconButton icon="x" title="删除" size={13} onClick={() => onChange(items.filter((_, j) => j !== i))} />
          </span>
        </div>
      ))}
      <button type="button" className="ut-add" onClick={() => onChange([...items, create()])}>
        <Icon name="plus" size={13} /> {addLabel}
      </button>
    </div>
  );
}
