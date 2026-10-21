import { Button } from "@tpl/workbench/ui";
import { useWorkbench } from "@tpl/workbench/context";
import { useState } from "react";
import { Section } from "../controls";
import { useDesign } from "../store";
import { linkFrom, readHymd, readHy3d, writeHymd, writeHy3d, type LinkFrom } from "./exchange";

const NAME: Record<LinkFrom, string> = { hy3d: "hy3d", hymd: "HyMd" };
const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** 活动栏「连接」：读取 hy3d / HyMd 的界面，改完后替换原设计。 */
export function LinkView() {
  const wb = useWorkbench();
  const workType = useDesign((s) => s.doc.config.workType);
  const [from, setFrom] = useState<LinkFrom | null>(() => linkFrom());
  const run = async (ok: string, fn: () => Promise<void>) => {
    try {
      await fn();
      setFrom(linkFrom());
      wb.notify("success", ok);
    } catch (e) {
      wb.notify("error", "没有完成", errMsg(e));
    }
  };
  return (
    <div className="ut-view">
      <div className="ut-note">读取后在预览里改布局、菜单、功能区和副页面。替换会盖掉对方仓库里的界面规格，不改副页面源码。</div>
      <div className="ut-note">{from ? `这次读取的是 ${NAME[from]}` : "还没有读取"}{workType ? ` · 当前 ${workType}` : ""}</div>
      <Section title="hy3d">
        <div className="ut-note">E:/Code/hy3d/ui/design</div>
        <div className="ut-row">
          <Button onClick={() => void run("已读取 hy3d", readHy3d)}>读取</Button>
          <Button onClick={() => void run("已替换 hy3d 的设计", writeHy3d)}>替换原设计</Button>
        </div>
      </Section>
      <Section title="HyMd">
        <div className="ut-note">E:/Code/HyMdTauri2/src/skins/design</div>
        <div className="ut-row">
          <Button onClick={() => void run("已读取 HyMd", readHymd)}>读取</Button>
          <Button onClick={() => void run("已替换 HyMd 的设计", writeHymd)}>替换原设计</Button>
        </div>
      </Section>
    </div>
  );
}
