import { IconScope } from "../../icons/Icon";
import { useWorkbench } from "../context";
import type { ToolItem } from "../types";
import { ItemBar } from "./ItemBar";

/** 状态栏：左 / 中 / 右。运行时可用 wb.setStatus(id, {...}) 改文字和图标。 */
export function StatusBar() {
  const wb = useWorkbench();
  const zones = wb.config.statusBar;
  const merge = (items: ToolItem[]) => items.map((it) => ({ ...it, ...wb.state.status[it.id] }));
  return (
    <IconScope area="statusbar">
      <div className="wb-statusbar" data-part="statusbar">
        <div className="wb-zone start" data-zone="status:start">
          <ItemBar items={merge(zones.start)} zone="status:start" area="statusbar" />
        </div>
        <div className="wb-zone center" data-zone="status:center">
          <ItemBar items={merge(zones.center)} zone="status:center" area="statusbar" />
        </div>
        <div className="wb-zone end" data-zone="status:end">
          <ItemBar items={merge(zones.end)} zone="status:end" area="statusbar" />
        </div>
      </div>
    </IconScope>
  );
}
