import { Icon } from "../../icons/Icon";
import { useWorkbench } from "../context";
import { IconButton } from "../ui";

const ICON = { info: "info", success: "success", warning: "warn", error: "error" } as const;

/** 右下角通知。信息 / 成功 5 秒后自动消失，警告 / 错误需手动关闭。 */
export function Notifications() {
  const wb = useWorkbench();
  if (!wb.state.notices.length) return null;
  return (
    <div className="wb-notices">
      {wb.state.notices.map((n) => (
        <div key={n.id} className={"wb-notice " + n.kind} role="status">
          <Icon name={ICON[n.kind]} size={16} className="wb-notice-icon" />
          <div className="wb-notice-text">
            <div>{n.message}</div>
            {n.detail && <div className="wb-notice-detail">{n.detail}</div>}
          </div>
          <IconButton icon="x" title="关闭" onClick={() => wb.dismissNotice(n.id)} />
        </div>
      ))}
    </div>
  );
}
