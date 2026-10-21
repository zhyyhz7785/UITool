/** 一组简单示例视图。接入真实功能时整块替换，只要保持在 views/index.ts 里的 id 不变。 */
import { useEffect, useState } from "react";
import { core } from "../core";
import { Icon } from "../icons/Icon";
import { AppMark } from "../workbench/AppMark";
import { useWorkbench } from "../workbench/context";
import type { ViewProps } from "../workbench/types";
import { Button } from "../workbench/ui";

export function Search(_: ViewProps) {
  const [q, setQ] = useState("");
  return (
    <div className="v-pad">
      <input className="wb-input v-full" placeholder="搜索" value={q} onChange={(e) => setQ(e.target.value)} />
      <input className="wb-input v-full" placeholder="替换" />
      <div className="v-hint">{q ? `在内核实现 search 方法后，这里列出「${q}」的结果。` : "输入关键字搜索。"}</div>
    </div>
  );
}

export function Outline(_: ViewProps) {
  const items = ["模型", "  构件", "  荷载", "分析", "  工况", "结果"];
  return (
    <div>
      {items.map((t, i) => (
        <div key={i} className="wb-tree-row" style={{ paddingLeft: 12 + (t.length - t.trimStart().length) * 6 }}>
          <Icon name="list-tree" size={14} />
          <span className="wb-tree-label">{t.trim()}</span>
        </div>
      ))}
    </div>
  );
}

export function Properties(_: ViewProps) {
  const rows: [string, string, boolean?][] = [
    ["名称", "构件-01"],
    ["图层", "0"],
    ["宽度", "1200", true],
    ["高度", "600"],
    ["材质", "C30"]
  ];
  return (
    <div className="v-props">
      <div className="wb-section-head">
        <Icon name="chevron-down" size={14} />
        常规
      </div>
      {rows.map(([k, v, modified]) => (
        <div key={k} className={"v-prop-row" + (modified ? " modified" : "")}>
          <span>{k}</span>
          <input className="wb-input" defaultValue={v} />
        </div>
      ))}
    </div>
  );
}

export function Problems(_: ViewProps) {
  return (
    <div className="v-pad v-hint">
      <Icon name="success" size={14} style={{ display: "inline", verticalAlign: -2 }} /> 没有问题。内核推送诊断后在这里列出。
    </div>
  );
}

export function Terminal(_: ViewProps) {
  return (
    <div className="v-mono v-terminal">
      <div>PS {">"} 终端占位。接入 PTY 后在这里显示。</div>
      <div>
        PS {">"} <span className="v-caret" />
      </div>
    </div>
  );
}

export function Welcome(_: ViewProps) {
  const wb = useWorkbench();
  const start: [string, string][] = [
    ["file.new", "新建"],
    ["file.open", "打开…"],
    ["workbench.action.showCommands", "显示所有命令"],
    ["workbench.action.selectTheme", "选择颜色主题"],
    ["workbench.action.openSettings", "设置"]
  ];
  return (
    <div className="v-welcome">
      <div className="v-welcome-head">
        <AppMark size={44} strokeWidth={1.25} />
        <div>
          <h1>{wb.config.app.title}</h1>
          <p>{wb.config.app.description}</p>
        </div>
      </div>
      <div className="v-welcome-cols">
        <section>
          <h2>开始</h2>
          {start.map(([id, title]) => {
            const c = wb.findCommand(id);
            return (
              <a key={id} className="v-link" onClick={() => void wb.execute(id)}>
                <Icon name={c?.icon ?? "chevron-right"} size={16} />
                {title}
              </a>
            );
          })}
        </section>
        <section>
          <h2>说明</h2>
          <p className="v-hint">界面由 UITool 设计，配置在 src/ui.config.json。</p>
          <p className="v-hint">界面只通过 src/core 调用内核；内核在 core/ 目录（Rust），浏览器里用模拟内核。</p>
          <p className="v-hint">视图组件在 src/views，按 id 注册在 views/index.ts。</p>
        </section>
      </div>
    </div>
  );
}

export function TextEditor({ data }: ViewProps) {
  const path = (data as { path?: string } | undefined)?.path ?? "";
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    if (path) core.call("file.read", { path }).then((r) => setText(r.text), (e) => setText(`// 读取失败：${e?.message ?? e}`));
  }, [path]);
  const lines = (text ?? "").split("\n");
  return (
    <div className="v-code">
      {lines.map((l, i) => (
        <div key={i} className="v-code-line">
          <span className="v-ln">{i + 1}</span>
          <span>{l || " "}</span>
        </div>
      ))}
    </div>
  );
}

export function Placeholder({ id, data }: ViewProps) {
  const missing = (data as { missing?: string } | undefined)?.missing;
  const wb = useWorkbench();
  return (
    <div className="v-placeholder">
      <Icon name="components" size={32} strokeWidth={1.25} />
      <div>视图占位：{id}</div>
      <div className="v-hint">{missing ? `组件「${missing}」还没注册。` : "在 src/views 里写组件，"}在 src/views/index.ts 里登记即可替换。</div>
      <Button onClick={() => wb.notify("info", `视图 ${id}`, "这里是占位视图。")}>示例按钮</Button>
    </div>
  );
}
