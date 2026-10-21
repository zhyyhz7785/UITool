import type { ViewProps } from "../workbench/types";

/** 图层：对应 hy3d 左侧图层选项板。 */
export function LayersView(_: ViewProps) {
  const rows = [
    ["0", "开", "白"],
    ["轴线", "开", "红"],
    ["标注", "开", "绿"]
  ];
  return (
    <div className="v-mono">
      {rows.map(([name, on, color]) => (
        <div key={name}>
          {name}　色{color}　{on}
        </div>
      ))}
    </div>
  );
}

/** 命令栏：只演示提示行。开关由用户点，不随方案自动弹出。 */
export function CommandLineView(_: ViewProps) {
  return (
    <div className="v-terminal v-mono">
      <div>命令: _line</div>
      <div>
        指定第一点: <span className="v-caret" />
      </div>
    </div>
  );
}
