import { useMemo, useState } from "react";
import pack from "@tpl/icons/hy3d-cad-pack.json";
import ribbonDesign from "../../../scripts/hy3d-ribbon-design.json";

type Row = { name: string; label: string; category: string; legacy: string; src: string; body: string };
const ribbonArt = { ...ribbonDesign.art, ...ribbonDesign.tabArt } as Record<string, string>;
const rows = Object.entries(pack.commands as Record<string, Row>).map(([id,row]): [string,Row] => [id, ribbonArt[id] ? { ...row, body:ribbonArt[id], src:"ribbon-design" } : row]);
const categories = [...new Set(rows.map(([, row]) => row.category))];
const sizes = [16, 20, 24, 32];

function Glyph({ row, size }: { row: Row; size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: row.body }} />;
}

export function CadCommandIconsView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [kind, setKind] = useState("");
  const [size, setSize] = useState(24);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState("");
  const visible = useMemo(() => rows.filter(([id, row]) =>
    (!category || row.category === category) && (!kind || row.src === kind) &&
    (id + " " + row.label + " " + row.legacy).toLowerCase().includes(query.trim().toLowerCase())
  ), [query, category, kind]);
  const active = rows.find(([id]) => id === selected);
  const maxPage = Math.max(0, Math.ceil(visible.length / 72) - 1);
  const at = Math.min(page, maxPage);
  return (
    <div className="ut-view ut-cad-command-icons">
      <div className="ut-pad">
        <div className="ut-card-title">HY CAD 统一命令图标</div>
        <div className="ut-note">当前设计包 {pack.counts.total} 条命令 · 重绘 {pack.counts.redesigned} · 统一原图 {pack.counts.retained}。另有 {Object.keys(ribbonArt).length} 条 Ribbon 候选图稿覆盖（设计模式），不改变产品源码。</div>
        <div className="ut-note">来源 {pack.sourceCommit.slice(0, 8)} · 24 单位矢量图，几何主体 + 蓝色操作提示。</div>
        <input className="wb-input ut-full" value={query} placeholder="搜索命令：中文 / 英文 ID / 旧图标" onChange={e => { setQuery(e.target.value); setPage(0); }} />
        <select className="wb-select ut-full" value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}>
          <option value="">全部命令分类</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="wb-select ut-full" value={kind} onChange={e => { setKind(e.target.value); setPage(0); }}>
          <option value="">全部设计状态</option><option value="ribbon-design">Ribbon 候选</option><option value="redesigned">重绘图稿</option><option value="normalized-existing">统一原图</option>
        </select>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {sizes.map(n => <button key={n} type="button" className={"ut-link" + (size === n ? " on" : "")} aria-pressed={size === n} onClick={() => setSize(n)}>{n}px</button>)}
          <span className="ut-dim">{visible.length} 条</span>
        </div>
      </div>
      {active && <div className="ut-pad" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="ut-card-title">{active[1].label}</div>
        <div className="ut-dim">{active[0]} · {active[1].src === "ribbon-design" ? "Ribbon 候选" : active[1].src === "redesigned" ? "重绘" : "统一原图"}</div>
        {["#20242a", "#f4f6fa"].map((bg, i) => <div key={bg} style={{ display: "flex", alignItems: "center", gap: 16, background: bg, color: i ? "#252c38" : "#e4e9f1", padding: 8 }}>
          {sizes.map(n => <span key={n} style={{ display: "grid", justifyItems: "center", gap: 4 }}><Glyph row={active[1]} size={n} /><small>{n}</small></span>)}
        </div>)}
      </div>}
      <div className="ut-pad">
        <div className="ut-icon-grid big">
          {visible.slice(at * 72, at * 72 + 72).map(([id, row]) =>
            <button type="button" key={id} title={id + " · " + row.label} className={"ut-icon-cell" + (selected === id ? " on" : "")} onClick={() => setSelected(id)}>
              <Glyph row={row} size={size} /><span>{row.label}</span>
            </button>
          )}
        </div>
        {visible.length === 0 && <div className="ut-note">没有符合条件的命令。</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button type="button" className="ut-link" disabled={at === 0} onClick={() => setPage(at - 1)}>上一页</button>
          <span>{at + 1} / {maxPage + 1}</span>
          <button type="button" className="ut-link" disabled={at === maxPage} onClick={() => setPage(at + 1)}>下一页</button>
        </div>
      </div>
    </div>
  );
}
