/** 工作台内部用的小控件。颜色全部来自主题变量。 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "../icons/Icon";

export function IconButton({ icon, title, active, size = 16, className, ...rest }: { icon: string; title?: string; active?: boolean; size?: number } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={"wb-iconbtn" + (active ? " active" : "") + (className ? " " + className : "")} title={title} aria-label={title} {...rest}>
      <Icon name={icon} size={size} />
    </button>
  );
}

export function Kbd({ keys }: { keys?: string }) {
  if (!keys) return null;
  return (
    <span className="wb-kbd">
      {keys.split("+").map((k, i) => (
        <kbd key={i}>{k}</kbd>
      ))}
    </span>
  );
}

export function Button({ primary, children, ...rest }: { primary?: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={"wb-btn" + (primary ? " primary" : "")} {...rest}>
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="wb-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="wb-toggle-track" />
      {label && <span>{label}</span>}
    </label>
  );
}

export function Select<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <select className="wb-select" value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
