import { useEffect, useState } from "react";
import { core } from "../../core";
import type { AppInfo } from "../../core/contract";
import { AppMark } from "../AppMark";
import { useWorkbench } from "../context";
import { Button } from "../ui";
import { Dialog } from "./Dialog";

export function AboutDialog() {
  const wb = useWorkbench();
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    core.call("app.info").then(setInfo, (e) => setErr(e?.message ?? String(e)));
  }, []);
  return (
    <Dialog title={`关于 ${wb.config.app.title}`} width={420} footer={<Button primary onClick={() => wb.openDialog(null)}>好</Button>}>
      <div className="wb-about">
        <AppMark size={48} strokeWidth={1.25} />
        <div>
          <div className="wb-about-name">{wb.config.app.title}</div>
          <div className="wb-about-line">版本 {wb.config.app.version}</div>
          <div className="wb-about-line">{wb.config.app.description}</div>
          <div className="wb-about-line">
            内核：{info ? `${info.core} · ${info.platform} · ${info.version}` : err || "连接中…"}（传输 {core.kind}）
          </div>
        </div>
      </div>
    </Dialog>
  );
}
