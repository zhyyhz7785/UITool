import { useEffect, useRef, useState } from "react";
import { core } from "../core";
import type { CoreEvents } from "../core/contract";
import { useWorkbench } from "../workbench/context";
import type { ViewProps } from "../workbench/types";
import { Button } from "../workbench/ui";

type Line = CoreEvents["log"];

/** 输出：订阅内核 log 和 task.progress 事件；进度同时写到状态栏。 */
export function Output(_: ViewProps) {
  const wb = useWorkbench();
  const [lines, setLines] = useState<Line[]>([{ level: "info", message: `界面已启动，内核传输：${core.kind}`, time: Date.now() }]);
  const end = useRef<HTMLDivElement>(null);
  const wbRef = useRef(wb);
  wbRef.current = wb;

  useEffect(() => {
    const offLog = core.on("log", (l) => setLines((s) => [...s.slice(-500), l]));
    const offTask = core.on("task.progress", (p) => {
      setLines((s) => [...s, { level: "info", message: `${p.name} ${p.done}/${p.total}`, time: Date.now() }]);
      wbRef.current.setStatus("core", p.finished ? null : { text: `${p.name} ${Math.round((p.done / p.total) * 100)}%`, icon: "loading" });
    });
    return () => {
      offLog();
      offTask();
    };
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  return (
    <div className="v-output">
      <div className="v-output-bar">
        <Button onClick={() => void wb.execute("task.run")}>运行示例任务</Button>
        <Button onClick={() => setLines([])}>清空</Button>
      </div>
      <div className="v-mono">
        {lines.map((l, i) => (
          <div key={i} className={"v-line " + l.level}>
            <span className="v-time">{new Date(l.time).toLocaleTimeString()}</span> {l.message}
          </div>
        ))}
        <div ref={end} />
      </div>
    </div>
  );
}
