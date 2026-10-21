import { useEffect, useState } from "react";
import { Icon } from "../../icons/Icon";
import { IconScope } from "../../icons/Icon";
import { useWorkbench } from "../context";
import type { IconArea, ItemZones, ToolItem } from "../types";
import { visibleParts } from "./display";
import { Flyout } from "./Flyout";

interface ItemBarProps {
  items: ToolItem[];
  orientation?: "h" | "v";
  /** 写到每个按钮的 data-zone 上，供设计器点选 */
  zone: string;
  area: IconArea;
  className?: string;
  /** 没有文字时用命令名补上 */
  showLabel?: boolean;
}

/** 一排按钮：命令按钮、文字、分隔线。图标按所在区域的风格解析。带 menu 的按钮右键拉出。 */
export function ItemBar({ items, orientation = "h", zone, area, className, showLabel }: ItemBarProps) {
  const wb = useWorkbench();
  const [menu, setMenu] = useState<{ id: string; anchor: HTMLElement; ids: string[] } | null>(null);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [menu]);
  if (!items.length) return null;
  return (
    <IconScope area={area}>
      <span className={"wb-itembar " + orientation + (className ? " " + className : "")}>
        {items.map((item) => (
          <ItemButton key={item.id} item={item} zone={zone} showLabel={showLabel} onMenu={(anchor, ids) => setMenu({ id: item.id, anchor, ids })} />
        ))}
      </span>
      {menu && <Flyout anchor={menu.anchor} ids={menu.ids} onPick={() => setMenu(null)} />}
    </IconScope>
  );
  function ItemButton({ item, zone, showLabel, onMenu }: { item: ToolItem; zone: string; showLabel?: boolean; onMenu: (anchor: HTMLElement, ids: string[]) => void }) {
    if (item.separator) return <i className="wb-item-sep" data-zone={zone} data-item={item.id} />;
    const cmd = item.command ? wb.findCommand(item.command) : undefined;
    const icon = item.icon || cmd?.icon;
    const text = item.text || (showLabel ? cmd?.title : undefined);
    const tip = item.tooltip || (cmd ? cmd.title + (cmd.keybinding ? ` (${cmd.keybinding})` : "") : undefined);
    const vis = visibleParts(item.display, !!icon, !!text);
    const menuIds = item.menu ?? [];
    const L = wb.config.layout;
    const active =
      item.command === "workbench.action.toggleSidebarVisibility" ? L.primarySideBar.visible :
      item.command === "workbench.action.togglePanel" ? L.panel.visible :
      item.command === "workbench.action.toggleAuxiliaryBar" ? L.auxiliaryBar.visible :
      item.command === "workbench.action.toggleActivityBarVisibility" ? L.activityBar.visible :
      false;
    return (
      <button
        type="button"
        className={"wb-item" + (item.kind === "accent" ? " accent" : "") + (active ? " active" : "") + (vis.text && !vis.icon ? " text" : "") + (showLabel && vis.text ? " labeled" : "") + (menuIds.length ? " has-menu" : "")}
        title={tip}
        data-zone={zone}
        data-item={item.id}
        onClick={() => item.command && void wb.execute(item.command)}
        onContextMenu={(e) => {
          if (!menuIds.length) return;
          e.preventDefault();
          e.stopPropagation();
          onMenu(e.currentTarget, menuIds);
        }}
      >
        {vis.icon && icon && (
          <span className="wb-item-icon" data-sub="icon">
            <Icon name={icon} size={orientation === "v" ? 18 : 16} />
          </span>
        )}
        {vis.text && text ? (
          <span className="wb-item-text" data-sub="text">
            {text}
          </span>
        ) : null}
        {menuIds.length > 0 && <i className="wb-menu-mark" />}
      </button>
    );
  }
}

/** 左 / 中 / 右（竖向时为上 / 中 / 下）三个区。 */
export function ZoneBar({ zones, orientation = "h", zonePrefix, area, showLabel }: { zones: ItemZones; orientation?: "h" | "v"; zonePrefix: string; area: IconArea; showLabel?: boolean }) {
  const names = ["start", "center", "end"] as const;
  return (
    <div className={"wb-zones " + orientation}>
      {names.map((name) => (
        <div key={name} className={"wb-zone " + name} data-zone={`${zonePrefix}:${name}`}>
          <ItemBar items={zones[name]} orientation={orientation} zone={`${zonePrefix}:${name}`} area={area} showLabel={showLabel} />
        </div>
      ))}
    </div>
  );
}
