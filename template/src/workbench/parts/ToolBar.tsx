import { useEffect, useState } from "react";
import { Icon } from "../../icons/Icon";
import { IconScope } from "../../icons/Icon";
import { useWorkbench } from "../context";
import type { ToolGroup, ToolRow, ToolSlot } from "../types";
import { visibleParts } from "./display";
import { Flyout } from "./Flyout";
import { ZoneBar } from "./ItemBar";

/** 面板名 → 名称旁的启动命令。和 hy3d 的 RIBBON_LAUNCHERS 同一张表。 */
const LAUNCHERS: Record<string, string> = { 绘图: "cad.hatch", 图层: "cad.layer", 标注: "cad.dimstyle", 荷载: "hy.combo" };

/** 主工具栏。上侧、侧面各管各的，可以同时开；每排分左 / 中 / 右。style 决定只有图标、带文字，或功能区页签。 */
export function ToolBar({ which }: { which: "top" | "side" }) {
  const wb = useWorkbench();
  const bar = wb.config.layout.toolbars[which];
  const orientation = which === "top" ? "h" : "v";
  const style = bar.style ?? "icon";
  const [tab, setTab] = useState(bar.rows[0]?.id ?? "");
  if (!bar.visible || !bar.rows.length) return null;

  if (style === "ribbon" && orientation === "h") {
    const active = bar.rows.find((r) => r.id === tab) ?? bar.rows[0];
    return (
      <IconScope area="toolbar">
        <div className="wb-toolbar wb-toolbar-h wb-ribbon" data-part="toolbar" data-toolbar={which} role="toolbar">
          <div className="wb-ribbon-tabs">
            {bar.rows.map((row) => (
              <button key={row.id} type="button" className={row.id === active.id ? "on" : ""} data-row={`tb:${which}:${row.id}`} onClick={() => setTab(row.id)}>
                {row.title || row.id}
              </button>
            ))}
          </div>
          <RibbonRow which={which} row={active} />
        </div>
      </IconScope>
    );
  }

  const labeled = style === "labeled" || style === "ribbon";
  return (
    <IconScope area="toolbar">
      <div className={"wb-toolbar wb-toolbar-" + orientation + (labeled ? " wb-toolbar-labeled" : "")} data-part="toolbar" data-toolbar={which} role="toolbar">
        {bar.rows.map((row) => (
          <div key={row.id} className="wb-toolbar-row" data-zone={`tb:${which}:${row.id}`} data-row={`tb:${which}:${row.id}`}>
            <ZoneBar zones={row} orientation={orientation} zonePrefix={`tb:${which}:${row.id}`} area="toolbar" showLabel={labeled} />
          </div>
        ))}
      </div>
    </IconScope>
  );
}

function faceSlots(group: ToolGroup): ToolSlot[] {
  if (group.slots?.length) return group.slots;
  return group.commands.filter(Boolean).map((command, i) => ({ command, size: i === 0 ? "big" : "small" }));
}

/** 大按钮单独一列，小按钮三粒叠成一列。和 hy3d 的 buildRibbonTopPanels 同一套。 */
function packSlots(slots: ToolSlot[]): { big: boolean; slots: ToolSlot[] }[] {
  const columns: { big: boolean; slots: ToolSlot[] }[] = [];
  let stack: ToolSlot[] | null = null;
  for (const slot of slots) {
    if (slot.size === "big" || !stack || stack.length >= 3) {
      stack = [];
      columns.push({ big: slot.size === "big", slots: stack });
      if (slot.size === "big") {
        stack.push(slot);
        stack = null;
        continue;
      }
    }
    stack.push(slot);
  }
  return columns;
}

function RibbonRow({ which, row }: { which: "top" | "side"; row: ToolRow }) {
  if (row.groups) {
    const zone = `tbg:${which}:${row.id}`;
    return (
      <div className="wb-toolbar-row wb-ribbon-body grouped" data-zone={zone} data-row={`tb:${which}:${row.id}`}>
        <div className="wb-ribbon-groups">
          {row.groups.map((g) => (
            <RibbonGroup key={g.id} group={g} zone={zone} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="wb-toolbar-row wb-ribbon-body" data-zone={`tb:${which}:${row.id}`} data-row={`tb:${which}:${row.id}`}>
      <ZoneBar zones={row} orientation="h" zonePrefix={`tb:${which}:${row.id}`} area="toolbar" showLabel />
    </div>
  );
}

function RibbonGroup({ group, zone }: { group: ToolGroup; zone: string }) {
  const wb = useWorkbench();
  const slots = faceSlots(group);
  const used = new Set(slots.flatMap((slot) => [slot.command, ...(slot.menu || [])]));
  const overflow = group.commands.filter((id) => id && !used.has(id));
  const launcher = group.launcher || LAUNCHERS[group.title];
  const [menu, setMenu] = useState<{ key: string; anchor: HTMLButtonElement; ids: string[] } | null>(null);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [menu]);
  const open = (key: string, anchor: HTMLButtonElement, ids: string[]) => setMenu((cur) => (cur?.key === key ? null : { key, anchor, ids }));
  const show = (key: string, anchor: HTMLButtonElement, ids: string[]) => setMenu({ key, anchor, ids });
  return (
    <div className="wb-ribbon-group" data-zone={zone} data-item={group.id}>
      <div className="wb-ribbon-btns">
        {packSlots(slots).map((col) =>
          col.big ? (
            <RibbonSlot key={col.slots[0].command} slot={col.slots[0]} groupId={group.id} zone={zone} onOpen={open} onContext={show} />
          ) : (
            <div key={col.slots.map((s) => s.command).join("-")} className="wb-ribbon-stack">
              {col.slots.map((slot) => (
                <RibbonSlot key={slot.command} slot={slot} groupId={group.id} zone={zone} onOpen={open} onContext={show} />
              ))}
            </div>
          )
        )}
      </div>
      <div className="wb-ribbon-group-title">
        <span className="wb-ribbon-group-label">{group.title || group.id}</span>
        {overflow.length > 0 && (
          <button
            type="button"
            className="wb-ribbon-more"
            title="面板下拉"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => open("overflow", e.currentTarget, overflow)}
          >
            ▾
          </button>
        )}
        {launcher && (
          <button type="button" className="wb-ribbon-launch" title={"启动 " + launcher} onClick={() => void wb.execute(launcher)}>
            ↘
          </button>
        )}
      </div>
      {menu && <Flyout anchor={menu.anchor} ids={menu.ids} onPick={() => setMenu(null)} />}
    </div>
  );
}

function RibbonSlot({
  slot,
  groupId,
  zone,
  onOpen,
  onContext
}: {
  slot: ToolSlot;
  groupId: string;
  zone: string;
  onOpen: (key: string, anchor: HTMLButtonElement, ids: string[]) => void;
  onContext: (key: string, anchor: HTMLButtonElement, ids: string[]) => void;
}) {
  const wb = useWorkbench();
  const cmd = wb.findCommand(slot.command);
  const label = slot.text || cmd?.title || slot.command;
  const icon = slot.icon || cmd?.icon;
  const menu = slot.menu || [];
  const right = (slot.menuOn ?? "arrow") === "right" && menu.length > 0;
  const vis = visibleParts(slot.display, !!icon, !!label);
  const key = "slot:" + groupId + "/" + slot.command;
  const item = groupId + "/" + slot.command;
  return (
    <div className={"wb-ribbon-split" + (slot.size === "big" ? " big" : "") + (right ? " has-menu" : "")} data-zone={zone} data-item={item}>
      <button
        type="button"
        className={"wb-ribbon-slot " + (slot.size === "big" ? "big" : "small")}
        title={label}
        data-zone={zone}
        data-item={item}
        onClick={() => void wb.execute(slot.command)}
        onContextMenu={(e) => {
          if (!right) return;
          e.preventDefault();
          e.stopPropagation();
          onContext(key, e.currentTarget, menu);
        }}
      >
        {vis.icon && (
          <span className="wb-ribbon-glyph" data-sub="icon">
            {icon ? <Icon name={icon} size={slot.size === "big" ? 24 : 14} /> : label.slice(0, 1)}
          </span>
        )}
        {vis.text && (
          <span className="wb-ribbon-label" data-sub="text">
            {label}
          </span>
        )}
        {right && <i className="wb-menu-mark" />}
      </button>
      {menu.length > 0 && !right && (
        <button
          type="button"
          className={"wb-ribbon-arrow" + (slot.size === "big" ? " big" : "")}
          title={label + " 的其它画法"}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => onOpen(key, e.currentTarget, menu)}
        >
          ▾
        </button>
      )}
    </div>
  );
}
