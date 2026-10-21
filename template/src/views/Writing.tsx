/** 文档写作的文献与笔记视图。数据是演示，对应 HyMd 侧栏里的文献库、本文引用、反向链接等。 */
import { useEffect, useState } from "react";
import type { ViewProps } from "../workbench/types";

export interface DemoRef {
  key: string;
  authors: string;
  title: string;
  venue: string;
  year: string;
  doi: string;
  gb: string;
}

export const demoRefs: DemoRef[] = [
  {
    key: "wang2020",
    authors: "王某某",
    title: "混凝土结构基本原理",
    venue: "北京: 中国建筑工业出版社",
    year: "2020",
    doi: "10.0000/hymd.wang2020",
    gb: "王某某. 混凝土结构基本原理[M]. 北京: 中国建筑工业出版社, 2020."
  },
  {
    key: "lee2019",
    authors: "Lee A, Kim B",
    title: "Seismic design of tall buildings",
    venue: "Engineering Structures, 180: 1-12",
    year: "2019",
    doi: "10.1016/j.engstruct.2018.11.001",
    gb: "LEE A, KIM B. Seismic design of tall buildings[J]. Engineering Structures, 2019, 180: 1-12."
  },
  {
    key: "gb50010",
    authors: "住房和城乡建设部",
    title: "混凝土结构设计规范: GB 50010—2010",
    venue: "北京: 中国建筑工业出版社",
    year: "2015",
    doi: "",
    gb: "中华人民共和国住房和城乡建设部. 混凝土结构设计规范: GB 50010—2010[S]. 北京: 中国建筑工业出版社, 2015."
  }
];

let currentKey = "wang2020";
const listeners = new Set<() => void>();

export function selectDemoRef(key: string) {
  currentKey = key;
  listeners.forEach((fn) => fn());
}

function useDemoRef(): DemoRef {
  const [, bump] = useState(0);
  useEffect(() => {
    const fn = () => bump((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return demoRefs.find((r) => r.key === currentKey) ?? demoRefs[0];
}

export function RefsView(_: ViewProps) {
  const [q, setQ] = useState("");
  const selected = useDemoRef();
  const list = demoRefs.filter((r) => `${r.key} ${r.authors} ${r.title}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="v-pad">
      <input className="wb-input v-full" placeholder="检索文献库" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="v-hint">演示数据。HyMd 里这一栏接 Zotero，命令是 hymd.refs.zoteroImport。</div>
      {list.map((r) => (
        <button key={r.key} type="button" className={"v-ref-row" + (r.key === selected.key ? " on" : "")} onClick={() => selectDemoRef(r.key)}>
          <b>@{r.key}</b>
          <span>{r.authors}. {r.title}</span>
          <i>{r.year}</i>
        </button>
      ))}
      {list.length === 0 && <div className="v-hint">没有匹配的条目。</div>}
    </div>
  );
}

/** 文档属性：对应 HyMd `skins/shared/DocMeta`。 */
export function DocMetaView(_: ViewProps) {
  const r = useDemoRef();
  const rows: [string, string][] = [
    ["名称", "混凝土结构笔记.hy.md"],
    ["路径", "D:/笔记/混凝土结构笔记.hy.md"],
    ["状态", "已保存"],
    ["字数", "1 284"],
    ["参考文献样式", "GB/T 7714"],
    ["当前文献", `@${r.key}`]
  ];
  return (
    <div className="v-pad">
      {rows.map(([k, v]) => (
        <div key={k} className="v-ref-row">
          <b>{k}</b>
          <span>{v}</span>
        </div>
      ))}
    </div>
  );
}

export function BacklinksView(_: ViewProps) {
  const rows = [
    ["文献摘录.hy.md", "见 [@wang2020] 第 3 章"],
    ["开题.hy.md", "对比 [@lee2019] 的层间位移"]
  ];
  return (
    <div className="v-pad">
      <div className="v-hint">链到当前文稿的笔记。</div>
      {rows.map(([name, line]) => (
        <div key={name} className="v-ref-row">
          <b>{name}</b>
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
}

export function LocalGraphView(_: ViewProps) {
  const nodes = [
    { id: "note", x: 90, y: 28, label: "本文" },
    { id: "wang", x: 28, y: 78, label: "wang2020" },
    { id: "lee", x: 150, y: 78, label: "lee2019" },
    { id: "gb", x: 90, y: 112, label: "GB 50010" }
  ];
  return (
    <div className="v-pad v-graph">
      <svg viewBox="0 0 180 130" className="v-graph-svg">
        <line x1="90" y1="32" x2="36" y2="74" />
        <line x1="90" y1="32" x2="142" y2="74" />
        <line x1="36" y1="82" x2="90" y2="108" />
        <line x1="142" y1="82" x2="90" y2="108" />
        {nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={n.id === "note" ? 7 : 5} />
            <text x={n.x} y={n.y - 10} textAnchor="middle">{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="v-hint">局部图谱。HyMd 的全局作图工作台是命令 hymd.graph.open，这里不打开它。</div>
    </div>
  );
}

export function BookmarksView(_: ViewProps) {
  const rows = ["混凝土结构笔记.hy.md", "文献摘录.hy.md · 第 2 节", "规范对照.hy.md"];
  return (
    <div>
      {rows.map((t) => (
        <div key={t} className="wb-tree-row">
          <span className="wb-tree-label">{t}</span>
        </div>
      ))}
    </div>
  );
}

export function TagsView(_: ViewProps) {
  const tags = ["#混凝土", "#抗震", "#规范", "#笔记"];
  return (
    <div className="v-pad v-tags">
      {tags.map((t) => (
        <span key={t} className="v-tag">{t}</span>
      ))}
    </div>
  );
}

/** 源代码管理：对应 HyMd `parts/views/ScmView`。 */
export function ScmView(_: ViewProps) {
  const rows: [string, string][] = [
    ["M", "混凝土结构笔记.hy.md"],
    ["A", "文献摘录.hy.md"],
    ["U", "附图/梁截面.png"]
  ];
  return (
    <div className="v-pad">
      <input className="wb-input v-full" placeholder="提交说明（Ctrl+Enter 提交）" />
      <div className="wb-section-head">更改 · {rows.length}</div>
      {rows.map(([s, name]) => (
        <div key={name} className="v-ref-row">
          <b>{s}</b>
          <span>{name}</span>
        </div>
      ))}
    </div>
  );
}

/** 论文：对应 HyMd 侧栏的论文页（论文夹、项目、参考文献、大纲）。 */
export function PaperView(_: ViewProps) {
  const rows: [string, number][] = [
    ["硕士论文（论文夹）", 0],
    ["第1章 绪论.hy.md", 1],
    ["第2章 试验方案.hy.md", 1],
    ["参考文献.bib", 1],
    ["附录.hy.md", 1]
  ];
  return (
    <div>
      {rows.map(([name, depth]) => (
        <div key={name} className="wb-tree-row" style={{ paddingLeft: 8 + depth * 14 }}>
          <span className="wb-tree-label">{name}</span>
        </div>
      ))}
      <div className="v-hint v-pad">命令：hymd.paper.newWorkspace / openProject / addProject。</div>
    </div>
  );
}

/** 设置：对应 HyMd 底栏「设置」页签。 */
export function SettingsView(_: ViewProps) {
  const rows: [string, string][] = [
    ["editor.fontSize", "15"],
    ["files.autoSave", "afterDelay"],
    ["hymd.refs.style", "gb7714"],
    ["workbench.skin", "obsidian"]
  ];
  return (
    <div className="v-pad">
      <input className="wb-input v-full" placeholder="搜索设置" />
      {rows.map(([k, v]) => (
        <div key={k} className="v-ref-row">
          <b className="v-mono">{k}</b>
          <span>{v}</span>
        </div>
      ))}
    </div>
  );
}

/** Git 图表：对应 HyMd 底栏「Git 图表」页签。 */
export function GitGraphView(_: ViewProps) {
  const rows: [string, string, string][] = [
    ["a1c3f2e", "main", "补第 2 章引用"],
    ["9be0d47", "", "导入 Zotero 文献"],
    ["4f7a210", "", "初稿"]
  ];
  return (
    <div className="v-pad">
      {rows.map(([hash, ref, msg]) => (
        <div key={hash} className="v-ref-row">
          <b className="v-mono">{hash}</b>
          <span>{ref ? `[${ref}] ` : ""}{msg}</span>
        </div>
      ))}
    </div>
  );
}

/** 主题：对应 HyMd 辅栏的排版主题画廊。 */
export function ThemeView(_: ViewProps) {
  const rows = ["默认", "学术论文", "技术文档", "书稿"];
  return (
    <div className="v-pad">
      {rows.map((t) => (
        <div key={t} className="wb-tree-row">
          <span className="wb-tree-label">{t}</span>
        </div>
      ))}
      <div className="v-hint">只换正文排版，不换界面配色。</div>
    </div>
  );
}
