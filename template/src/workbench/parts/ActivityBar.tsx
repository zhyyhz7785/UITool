import { Icon } from "../../icons/Icon";
import { IconScope } from "../../icons/Icon";
import { useWorkbench } from "../context";
import { ItemBar } from "./ItemBar";

/** 活动栏：竖排图标，点击切换主侧栏视图；再点当前项收起侧栏。底部按钮来自配置。 */
export function ActivityBar({ side }: { side: "left" | "right" }) {
  const wb = useWorkbench();
  const active = wb.config.layout.primarySideBar.visible ? currentActivity(wb.config.activity, wb.state.activeActivity) : null;
  const letters = wb.config.workType === "cad2d" && wb.config.layout.toolbars.top.visible && wb.config.layout.toolbars.top.style === "ribbon";
  return (
    <IconScope area="activitybar">
      <div className={"wb-activitybar " + side} data-part="activitybar">
        <div className="wb-activitybar-items" data-zone="activity-items">
          {wb.config.activity.map((a) => (
            <button key={a.id} type="button" className={"wb-activity-item" + (a.id === active ? " active" : "")} title={a.title} data-item={a.id} onClick={() => wb.showActivity(a.id)}>
              {letters ? <span className="wb-activity-letter" data-sub="text">{a.title.slice(0, 1) || "·"}</span> : <span data-sub="icon"><Icon name={a.icon} size={22} strokeWidth={1.5} /></span>}
              {a.badge ? <span className="wb-activity-badge">{a.badge}</span> : null}
            </button>
          ))}
        </div>
        <div className="wb-activitybar-items">
          <ItemBar items={wb.config.layout.activityBar.bottom} orientation="v" zone="activity-bottom" area="activitybar" />
        </div>
      </div>
    </IconScope>
  );
}

export function currentActivity<T extends { id: string }>(list: T[], id: string | null): string | null {
  return list.find((a) => a.id === id)?.id ?? list[0]?.id ?? null;
}
