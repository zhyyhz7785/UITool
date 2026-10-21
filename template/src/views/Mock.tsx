import type { ViewProps } from "../workbench/types";

/** 各工作类型的主工作区示意。接上真实视图时按同名 id 换掉即可。 */

export function Viewport2d(_: ViewProps) {
  return (
    <div className="v-mock v-vp2d">
      <svg viewBox="0 0 200 120" className="v-mock-svg">
        <line x1="20" y1="90" x2="160" y2="30" />
        <rect x="70" y="40" width="50" height="36" />
        <circle cx="40" cy="40" r="14" />
      </svg>
      <span className="v-mock-tag">二维视口</span>
    </div>
  );
}

export function Viewport3d(_: ViewProps) {
  return (
    <div className="v-mock v-vp3d">
      <div className="v-box" />
      <span className="v-cube">透视</span>
      <span className="v-mock-tag">三维视口</span>
    </div>
  );
}

export function CanvasView(_: ViewProps) {
  return (
    <div className="v-mock v-canvas">
      <div className="v-artboard">画布</div>
    </div>
  );
}

export function TimelineView(_: ViewProps) {
  return (
    <div className="v-mock v-timeline">
      <div className="v-ruler" />
      {[0, 12, 28, 8, 40].map((left, i) => (
        <div key={i} className="v-track">
          <i style={{ left: `${left}%`, width: `${24 + ((i * 7) % 20)}%` }} />
        </div>
      ))}
    </div>
  );
}

export function MonitorView(_: ViewProps) {
  return (
    <div className="v-mock v-monitor">
      <div className="v-screen">监视器</div>
    </div>
  );
}

export function SheetView(_: ViewProps) {
  const cols = ["A", "B", "C", "D"];
  const rows = [
    ["项目", "数量", "单价", "合计"],
    ["钢筋", "12", "4.5", "54"],
    ["混凝土", "30", "450", "13500"]
  ];
  return (
    <div className="v-mock v-sheet">
      <div className="v-formula">
        <b>B2</b>
        <span>=SUM(B2:B9)</span>
      </div>
      <div className="v-sheet-grid">
        <table>
          <thead>
            <tr>
              <th />
              {cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <th>{i + 1}</th>
                {r.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="v-sheets">
        <b>Sheet1</b>
        <span>Sheet2</span>
      </div>
    </div>
  );
}

export function DocumentView(_: ViewProps) {
  return (
    <div className="v-mock v-doc">
      <article>
        <p className="v-doc-cover">笔记</p>
        <h2>混凝土结构笔记</h2>
        <p className="v-doc-meta">状态 草稿 · 文献样式 GB/T 7714</p>
        <h3>1 受弯承载力</h3>
        <p>
          正截面受弯按平截面假定计算，材料本构取自 <span className="v-cite">[@wang2020]</span>。高层结构的层间位移角限值对照 <span className="v-cite">[@lee2019]</span>。
        </p>
        <h3>2 规范</h3>
        <p>设计表达式与构造要求见 GB 50010，条目在文献库中，正文尚未引用。</p>
        <h3>参考文献</h3>
        <ol className="v-bib">
          <li>王某某. 混凝土结构基本原理[M]. 北京: 中国建筑工业出版社, 2020.</li>
          <li>LEE A, KIM B. Seismic design of tall buildings[J]. Engineering Structures, 2019, 180: 1-12.</li>
        </ol>
      </article>
    </div>
  );
}

export function ResultTable(_: ViewProps) {
  const rows = [
    ["1", "KZ1", "1280", "0.82", "满足"],
    ["2", "KL3", "860", "0.91", "满足"],
    ["3", "W1", "210", "1.04", "超限"]
  ];
  return (
    <div className="v-mock v-result">
      <table>
        <thead>
          <tr>
            {["编号", "构件", "内力", "比值", "结论"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) => (
                <td key={i}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
