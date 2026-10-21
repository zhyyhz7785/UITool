import { IconScope } from "../../icons/Icon";
import { useWorkbench } from "../context";
import { currentActivity } from "./ActivityBar";
import { ItemBar } from "./ItemBar";
import { ViewHost } from "./ViewHost";

/** 底部（或右侧）面板：页签 + 视图。标题栏右侧按钮来自配置。 */
export function Panel() {
  const wb = useWorkbench();
  const list = wb.config.panel;
  const activeId = currentActivity(list, wb.state.activePanel);
  const active = list.find((p) => p.id === activeId);
  const bottom = wb.config.layout.panel.position === "bottom";
  const actions = wb.config.layout.panel.actions.map((it) =>
    it.id === "panel-move" ? { ...it, icon: bottom ? "sideright" : "bottom", tooltip: bottom ? "移到右侧" : "移到底部" } : it
  );
  return (
    <IconScope area="panel">
      <div className={"wb-panel " + (bottom ? "bottom" : "right")} data-part="panel">
        <div className="wb-panel-header">
          <div className="wb-panel-tabs" role="tablist" data-zone="panel-tabs">
            {list.map((p) => (
              <button key={p.id} type="button" role="tab" className={"wb-panel-tab" + (p.id === activeId ? " active" : "")} data-item={p.id} onClick={() => wb.setActivePanel(p.id)}>
                <span data-sub="text">{p.title}</span>
                {p.badge ? <span className="wb-count">{p.badge}</span> : null}
              </button>
            ))}
          </div>
          <span className="wb-sp" />
          <div data-zone="panel-actions">
            <ItemBar items={actions} zone="panel-actions" area="panel" />
          </div>
        </div>
        <div className="wb-panel-body" key={active?.id}>
          {active && <ViewHost view={active.view} id={active.id} />}
        </div>
      </div>
    </IconScope>
  );
}
