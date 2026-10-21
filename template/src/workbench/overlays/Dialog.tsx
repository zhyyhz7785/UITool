import { useEffect, type ReactNode } from "react";
import { useWorkbench } from "../context";
import { IconButton } from "../ui";

/** 模态对话框外框：遮罩 + 标题 + 内容 + 底部按钮。Esc 关闭。 */
export function Dialog({ title, width = 520, children, footer }: { title: string; width?: number; children: ReactNode; footer?: ReactNode }) {
  const wb = useWorkbench();
  const close = () => wb.openDialog(null);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  });
  return (
    <div className="wb-scrim" onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div className="wb-dialog" role="dialog" aria-label={title} style={{ width }}>
        <div className="wb-dialog-head">
          <span>{title}</span>
          <span className="wb-sp" />
          <IconButton icon="x" title="关闭" onClick={close} />
        </div>
        <div className="wb-dialog-body">{children}</div>
        {footer && <div className="wb-dialog-foot">{footer}</div>}
      </div>
    </div>
  );
}
