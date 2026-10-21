import { Icon } from "../../icons/Icon";
import { IconScope } from "../../icons/Icon";
import { useWorkbench } from "../context";
import type { SideContainer, ViewSection } from "../types";
import { IconButton } from "../ui";
import { currentActivity } from "./ActivityBar";
import { ItemBar } from "./ItemBar";
import { Sash } from "./Sash";
import { ViewHost } from "./ViewHost";

/** 主侧栏 / 辅助侧栏。一个视图容器里可以上下堆叠多个分区，上组从上往下，下组可从下往上。 */
export function SideBar({ part }: { part: "sidebar" | "auxiliarybar" }) {
  const wb = useWorkbench();
  const primary = part === "sidebar";
  const list = primary ? wb.config.activity : wb.config.auxiliary;
  const activeId = currentActivity(list, primary ? wb.state.activeActivity : wb.state.activeAux);
  const active = list.find((c) => c.id === activeId);
  const iconsOnTop = primary && wb.config.layout.activityBar.visible && wb.config.layout.activityBar.position === "top";
  const side = primary ? wb.config.layout.primarySideBar.position : wb.config.layout.primarySideBar.position === "left" ? "right" : "left";
  const showTabs = list.length > 1 && (!primary || !wb.config.layout.activityBar.visible);

  const setContainer = (next: SideContainer) =>
    wb.updateConfig((c) => ({ ...c, [primary ? "activity" : "auxiliary"]: list.map((x) => (x.id === next.id ? next : x)) }));

  return (
    <IconScope area="sidebar">
      <div className={"wb-sidebar " + side} data-part={part}>
        {iconsOnTop ? (
          <div className="wb-sidebar-iconrow" data-zone="activity-top">
            {list.map((c) => (
              <IconButton key={c.id} icon={c.icon} title={c.title} active={c.id === activeId} onClick={() => wb.showActivity(c.id)} />
            ))}
          </div>
        ) : null}
        {active && active.header !== "hidden" && (
          <div className={"wb-pane-header" + (active.ghost ? " ghost" : "")} data-zone={`side:${active.id}:header`}>
            {showTabs ? (
              <div className="wb-pane-tabs">
                {list.map((c) => (
                  <button key={c.id} type="button" className={"wb-pane-tab" + (c.id === activeId ? " active" : "")} data-item={c.id} onClick={() => (primary ? wb.showActivity(c.id) : wb.setActiveAux(c.id))}>
                    {active.header === "icon" ? <Icon name={c.icon} size={14} /> : c.title}
                  </button>
                ))}
              </div>
            ) : (
              <span className="wb-pane-title" data-item={active.id}>
                <span data-sub="icon">
                  <Icon name={active.icon} size={14} />
                </span>
                {active.header === "show" && <span data-sub="text">{active.title}</span>}
              </span>
            )}
            <span className="wb-sp" />
            <ItemBar items={active.headerActions} zone={`side:${active.id}:header`} area="sidebar" />
          </div>
        )}
        {active && <Sections key={active.id} container={active} onChange={setContainer} scale={wb.scale} />}
      </div>
    </IconScope>
  );
}

function Sections({ container, onChange, scale }: { container: SideContainer; onChange: (c: SideContainer) => void; scale: number }) {
  const top = container.sections.filter((s) => s.anchor !== "bottom");
  const bottom = container.sections.filter((s) => s.anchor === "bottom");
  const patch = (id: string, p: Partial<ViewSection>) => onChange({ ...container, sections: container.sections.map((s) => (s.id === id ? { ...s, ...p } : s)) });
  const render = (list: ViewSection[], reverse: boolean) => (
    <div className={"wb-section-stack" + (reverse ? " reverse" : "")}>
      {list.map((s, i) => (
        <div key={s.id} className="wb-section-slot" style={s.size ? { flex: `0 0 ${s.size}px` } : { flex: "1 1 0" }}>
          {i > 0 && (
            <Sash
              axis="y"
              sign={reverse ? -1 : 1}
              value={s.size ?? 120}
              min={48}
              max={800}
              scale={scale}
              onChange={() => {}}
              onCommit={(v) => patch(s.id, { size: v })}
            />
          )}
          <SectionView section={s} onPatch={(p) => patch(s.id, p)} />
        </div>
      ))}
    </div>
  );
  return (
    <div className="wb-pane-body wb-sections">
      {top.length > 0 && render(top, false)}
      {bottom.length > 0 && render(bottom, container.bottomOrder === "up")}
    </div>
  );
}

function SectionView({ section, onPatch }: { section: ViewSection; onPatch: (p: Partial<ViewSection>) => void }) {
  return (
    <div className={"wb-viewsection" + (section.collapsed ? " collapsed" : "")} data-zone={`sec:${section.id}`} data-section={section.id}>
      {section.header && (
        <div className="wb-section-head" onClick={() => onPatch({ collapsed: !section.collapsed })}>
          <Icon name={section.collapsed ? "chevron-right" : "chevron-down"} size={14} />
          <span className="wb-section-title" data-item={`${section.id}#head`}>
            {section.icon && (
              <span data-sub="icon">
                <Icon name={section.icon} size={14} />
              </span>
            )}
            <span data-sub="text">{section.title}</span>
          </span>
          <span className="wb-sp" />
          <span onClick={(e) => e.stopPropagation()}>
            <ItemBar items={section.actions} zone={`sec:${section.id}`} area="sidebar" />
          </span>
        </div>
      )}
      {!section.collapsed && (
        <div className="wb-viewsection-body">
          <ViewHost view={section.view} id={section.id} />
        </div>
      )}
    </div>
  );
}
