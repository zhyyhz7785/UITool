import { useEffect, useRef, useState } from "react";
import { Icon } from "../../icons/Icon";
import { IconScope } from "../../icons/Icon";
import { useWorkbench } from "../context";
import type { Menu, MenuItem, MenuSwatch } from "../types";
import { Kbd } from "../ui";
import { visibleParts } from "./display";

/** 菜单栏。inline 时嵌在标题栏里；standalone 时（系统标题栏）单独占一行。隐身的菜单不排进来。 */
export function MenuBar({ standalone }: { standalone?: boolean }) {
  const wb = useWorkbench();
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const menus = wb.config.menus.filter((m) => !m.ghost);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("pointerdown", close, true);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", close, true);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <IconScope area="menu">
      <div ref={ref} className={"wb-menubar" + (standalone ? " standalone" : "")} data-part={standalone ? "titlebar" : undefined} data-zone="menus" data-row={standalone ? "menu" : undefined}>
        {menus.map((m) => (
          <div key={m.id} className="wb-menubar-item">
            <button
              type="button"
              className={"wb-menubar-btn" + (open === m.id ? " open" : "")}
              data-zone={`menu:${m.id}`}
              data-item={`menu:${m.id}`}
              onClick={() => setOpen(open === m.id ? null : m.id)}
              onMouseEnter={() => open && setOpen(m.id)}
            >
              <span data-sub="text">{m.title}</span>
            </button>
            {open === m.id && (
              <div className="wb-menu" role="menu">
                <MenuRows menu={m} items={m.items} />
              </div>
            )}
          </div>
        ))}
      </div>
    </IconScope>
  );
}

/** 进入菜单模块时，预览只画这一张菜单，子项和色块都摊开。 */
export function MenuFocus({ menuId }: { menuId: string }) {
  const wb = useWorkbench();
  const menu = wb.config.menus.find((m) => m.id === menuId);
  if (!menu) return <div className="wb-only wb-menu-focus">没有这个菜单</div>;
  return (
    <div className="wb-only wb-menu-focus" data-part="titlebar" data-zone={`menu:${menu.id}`}>
      <div className="wb-menu-focus-title">{menu.title}</div>
      <div className="wb-menu static" role="menu">
        <MenuRows menu={menu} items={menu.items} force />
      </div>
    </div>
  );
}

function MenuRows({ menu, items, force }: { menu: Menu; items: MenuItem[]; force?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      {items.map((it, i) => (
        <MenuRow key={it.id ?? i} menu={menu} item={it} index={i} open={open} setOpen={setOpen} force={force} />
      ))}
    </>
  );
}

function MenuRow({ menu, item, index, open, setOpen, force }: { menu: Menu; item: MenuItem; index: number; open: string | null; setOpen: (id: string | null) => void; force?: boolean }) {
  const wb = useWorkbench();
  const id = item.id ?? `item-${index}`;
  if (item.separator) return <div className="wb-menu-sep" data-zone={`menu:${menu.id}`} data-item={id} />;
  const cmd = item.command ? wb.findCommand(item.command) : undefined;
  const label = item.title ?? cmd?.title ?? item.command ?? "";
  const vis = visibleParts(item.display, !!cmd?.icon, !!label);
  const sub = item.items ?? [];
  const swatches = item.swatches ?? [];
  const nest = sub.length > 0 || swatches.length > 0;
  const shown = force || open === id;
  return (
    <div className={"wb-menu-branch" + (nest ? " has-sub" : "")} onMouseEnter={() => nest && setOpen(id)}>
      <button
        type="button"
        role="menuitem"
        className="wb-menu-item"
        data-zone={`menu:${menu.id}`}
        data-item={id}
        onClick={() => {
          if (nest) {
            setOpen(shown && !force ? null : id);
            return;
          }
          setOpen(null);
          if (item.command) void wb.execute(item.command);
        }}
      >
        {vis.icon && (
          <span className="wb-menu-icon" data-sub="icon">
            {cmd?.icon && <Icon name={cmd.icon} size={14} />}
          </span>
        )}
        {vis.text && <span className="wb-menu-label" data-sub="text">{label}</span>}
        <Kbd keys={cmd?.keybinding} />
        {nest && <span className="wb-menu-chevron">›</span>}
      </button>
      {shown && sub.length > 0 && (
        <div className={"wb-menu wb-menu-sub" + (force ? " static" : "")} role="menu">
          <MenuRows menu={menu} items={sub} force={force} />
        </div>
      )}
      {shown && swatches.length > 0 && <Swatches menu={menu} group={id} swatches={swatches} />}
    </div>
  );
}

function Swatches({ menu, group, swatches }: { menu: Menu; group: string; swatches: MenuSwatch[] }) {
  return (
    <div className="wb-swatch-row" data-zone={`menu:${menu.id}`} data-item={group}>
      {swatches.map((s) => (
        <i key={s.id} className={"wb-swatch" + (s.color ? "" : " is-empty")} style={s.color ? { background: s.color } : undefined} title={s.label} />
      ))}
    </div>
  );
}
