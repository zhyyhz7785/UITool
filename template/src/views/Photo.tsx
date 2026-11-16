import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "../icons/Icon";
import { useWorkbench } from "../workbench/context";
import type { ViewProps } from "../workbench/types";
import "./photo.css";
import { CMD, PHOTO_MODES, photoBar, subscribePhoto, type PhotoMode } from "./photoSession";

interface Shot {
  id: string;
  name: string;
  sub: string;
}

const SEED: Shot[] = [
  { id: "a", name: "附图.png", sub: "1920×1280" },
  { id: "b", name: "扫描-01.jpg", sub: "2480×3508" },
  { id: "c", name: "证件照.jpg", sub: "1200×1600" }
];

const QUEUE: { id: string; cmd: string; icon: string; label: string }[] = [
  { id: "add", cmd: CMD.open, icon: "open", label: "添加图片到队列" },
  { id: "all", cmd: CMD.selectAll, icon: "list", label: "全选 / 取消全选" },
  { id: "sel", cmd: CMD.applySel, icon: "sync", label: "应用到选中" },
  { id: "allApply", cmd: CMD.applyAll, icon: "sync", label: "应用到全部" },
  { id: "export", cmd: CMD.batch, icon: "export", label: "批量导出到文件夹…" },
  { id: "copy", cmd: CMD.copyParams, icon: "copy", label: "复制参数" },
  { id: "paste", cmd: CMD.pasteParams, icon: "paste", label: "粘贴参数" },
  { id: "params", cmd: CMD.params, icon: "adjust", label: "参数范围与预设" },
  { id: "md", cmd: CMD.replaceMd, icon: "mtext", label: "替换文稿中的图片引用" },
  { id: "clear", cmd: CMD.clearOthers, icon: "delete", label: "清空队列中其他图片" }
];

const MARKUP: { id: string; glyph: string; name: string; params: [string, number, number, number][] }[] = [
  { id: "select", glyph: "↖", name: "选择", params: [] },
  { id: "pen", glyph: "✎", name: "画笔", params: [["粗细", 1, 60, 4], ["不透明度", 5, 100, 100]] },
  { id: "hl", glyph: "▬", name: "荧光笔", params: [["粗细", 4, 80, 18], ["不透明度", 10, 90, 38]] },
  { id: "arrow", glyph: "↗", name: "箭头", params: [["线宽", 1, 40, 4], ["头部倍数", 2, 12, 5]] },
  { id: "curve", glyph: "↷", name: "曲线箭头", params: [["线宽", 1, 40, 4], ["弯曲度", -100, 100, 40]] },
  { id: "line", glyph: "╱", name: "直线", params: [["线宽", 1, 40, 4], ["长度", 0, 4000, 0]] },
  { id: "dim", glyph: "↔", name: "尺寸", params: [["线宽", 1, 12, 2], ["字高", 8, 120, 18]] },
  { id: "rect", glyph: "▭", name: "矩形", params: [["线宽", 0, 40, 4], ["圆角", 0, 300, 0]] },
  { id: "ellipse", glyph: "◯", name: "椭圆", params: [["线宽", 0, 40, 4], ["填充", 0, 100, 25]] },
  { id: "spot", glyph: "▢", name: "聚光灯", params: [["压暗", 0, 95, 60], ["圆角", 0, 300, 12]] },
  { id: "blur", glyph: "◌", name: "模糊", params: [["半径", 1, 60, 12], ["圆角", 0, 300, 8]] },
  { id: "mosaic", glyph: "▦", name: "马赛克", params: [["块大小", 2, 120, 14], ["强度", 0, 100, 100]] },
  { id: "mag", glyph: "⊕", name: "放大镜", params: [["倍率", 1, 8, 3], ["半径", 20, 500, 90]] },
  { id: "text", glyph: "T", name: "文字", params: [["字高", 8, 400, 36], ["行距", 1, 3, 1]] },
  { id: "callout", glyph: "💬", name: "标注气泡", params: [["字高", 8, 200, 22], ["内边距", 2, 80, 12]] },
  { id: "num", glyph: "①", name: "序号", params: [["直径", 12, 240, 38], ["起始号", 1, 99, 1]] }
];

const FILTERS = ["无", "黑白", "复古", "冷调", "暖调", "高对比", "褪色", "胶片", "鲜艳", "暗调", "戏剧", "粉彩"];
const INK = ["#1d1d1f", "#ffffff", "#e5484d", "#f5a524", "#30a46c", "#3e63dd"];

function Slider(props: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <label className="ph-srow">
      <span className="ph-top">
        <span>{props.label}</span>
        <span className={props.value ? "nz" : ""}>{props.value}</span>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        aria-label={props.label}
        onChange={(e) => props.onChange(Number(e.currentTarget.value))}
        onDoubleClick={() => props.onChange(props.min < 0 ? 0 : props.min)}
      />
    </label>
  );
}

function Chips(props: { items: string[]; value: string; onPick: (name: string) => void }) {
  return (
    <div className="ph-chips">
      {props.items.map((name) => (
        <button key={name} type="button" className={name === props.value ? "ph-chip on" : "ph-chip"} onClick={() => props.onPick(name)}>
          {name}
        </button>
      ))}
    </div>
  );
}

function AdjustPane() {
  const [tab, setTab] = useState<"color" | "detail" | "portrait">("color");
  const [preset, setPreset] = useState("中性");
  const [vals, setVals] = useState<Record<string, number>>({ 曝光: 0, 亮度: 0, 对比度: 0, 高光: 0, 阴影: 0, 色温: 0, 色调: 0, 饱和度: 0, 暗角: 0, 锐化: 0, 半径: 1, 降噪: 0, 磨皮: 0, 瘦脸: 0, 大眼: 0 });
  const set = (key: string, n: number) => setVals((v) => ({ ...v, [key]: n }));
  const color = ["曝光", "亮度", "对比度", "高光", "阴影", "色温", "色调", "饱和度", "暗角"];
  return (
    <div>
      <div className="ph-tabs" role="tablist" aria-label="调整">
        {(["color", "detail", "portrait"] as const).map((id) => (
          <button key={id} type="button" className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
            {id === "color" ? "照片调色" : id === "detail" ? "细节" : "人像"}
          </button>
        ))}
      </div>
      {tab === "color" ? (
        <>
          <h4 style={{ marginTop: 0 }}>预设</h4>
          <Chips items={["中性", "自然", "鲜明"]} value={preset} onPick={setPreset} />
          <div className="ph-hist" title="直方图" />
          {color.map((key) => (
            <Slider key={key} label={key} value={vals[key] ?? 0} min={-100} max={100} onChange={(n) => set(key, n)} />
          ))}
          <div className="ph-row">
            <button type="button" className="ph-text grow" onClick={() => setVals((v) => ({ ...v, 色温: 0, 色调: 0 }))}>自动白平衡</button>
            <button type="button" className="ph-text grow" onClick={() => setPreset("中性")}>重置调色</button>
          </div>
        </>
      ) : null}
      {tab === "detail" ? (
        <>
          <Slider label="锐化" value={vals.锐化 ?? 0} min={0} max={100} onChange={(n) => set("锐化", n)} />
          <Slider label="半径" value={vals.半径 ?? 1} min={1} max={20} onChange={(n) => set("半径", n)} />
          <Slider label="降噪" value={vals.降噪 ?? 0} min={0} max={100} onChange={(n) => set("降噪", n)} />
          <p className="ph-note">锐化按边缘提对比，降噪压平平涂。松手后再算全图。</p>
        </>
      ) : null}
      {tab === "portrait" ? (
        <>
          <p className="ph-note" style={{ marginTop: 0 }}>近似效果<span className="ph-tag">近似</span></p>
          <Slider label="磨皮" value={vals.磨皮 ?? 0} min={0} max={100} onChange={(n) => set("磨皮", n)} />
          {["瘦脸", "大眼", "嘟嘟唇", "去眼袋", "天鹅颈", "小蛮腰", "大长腿"].map((key) => (
            <Slider key={key} label={key} value={vals[key] ?? 0} min={0} max={100} onChange={(n) => set(key, n)} />
          ))}
          <p className="ph-note">作用区是椭圆。正式版再接人脸关键点。</p>
        </>
      ) : null}
    </div>
  );
}

function FilterPane() {
  const [name, setName] = useState("无");
  const [amt, setAmt] = useState(100);
  return (
    <div>
      <div className="ph-thumbs">
        {FILTERS.map((item) => (
          <button key={item} type="button" className={item === name ? "ph-thumb-btn on" : "ph-thumb-btn"} onClick={() => setName(item)}>
            <i />
            {item}
          </button>
        ))}
      </div>
      <Slider label="强度" value={amt} min={0} max={100} onChange={setAmt} />
    </div>
  );
}

function MarkupPane() {
  const [tool, setTool] = useState("arrow");
  const [ink, setInk] = useState(INK[2]);
  const spec = MARKUP.find((item) => item.id === tool) ?? MARKUP[0];
  const [vals, setVals] = useState<Record<string, number>>({});
  const value = (label: string, fallback: number) => vals[`${tool}.${label}`] ?? fallback;
  return (
    <div>
      <div className="ph-tools-grid">
        {MARKUP.map((item) => (
          <button key={item.id} type="button" className={item.id === tool ? "ph-tool on" : "ph-tool"} onClick={() => setTool(item.id)}>
            <b>{item.glyph}</b>
            {item.name}
          </button>
        ))}
      </div>
      <h4>颜色</h4>
      <div className="ph-swatches">
        {INK.map((color) => (
          <button key={color} type="button" className={color === ink ? "ph-sw on" : "ph-sw"} style={{ background: color }} aria-label={color} onClick={() => setInk(color)} />
        ))}
      </div>
      <h4>{spec.name}</h4>
      {spec.params.map(([label, min, max, fallback]) => (
        <Slider key={label} label={label} value={value(label, fallback)} min={min} max={max} onChange={(n) => setVals((v) => ({ ...v, [`${tool}.${label}`]: n }))} />
      ))}
      {tool === "text" ? <textarea defaultValue="这里有问题" aria-label="文字内容" style={{ width: "100%", minHeight: 52, marginTop: 8 }} /> : null}
      <div className="ph-row">
        <button type="button" className="ph-text grow">删除选中</button>
        <button type="button" className="ph-text grow">清空标记</button>
      </div>
    </div>
  );
}

function ErasePane() {
  const [brush, setBrush] = useState(40);
  return (
    <div>
      <p className="ph-note" style={{ marginTop: 0 }}>近似算法<span className="ph-tag">近似</span></p>
      <Slider label="笔刷大小" value={brush} min={8} max={200} onChange={setBrush} />
      <p className="ph-note">涂抹后用周围像素填回去。这是污点修复的近似，不是内容识别。</p>
    </div>
  );
}

function BgPane() {
  const [mode, setMode] = useState("纯色");
  const [tol, setTol] = useState(30);
  const [applied, setApplied] = useState("");
  return (
    <div>
      <p className="ph-note" style={{ marginTop: 0 }}>示意<span className="ph-tag">示意</span></p>
      <p className="ph-note" style={{ marginTop: 0 }}>在图上点一下背景，按颜色容差选出区域。</p>
      <h4>替换为</h4>
      <div className="ph-seg2">
        {["纯色", "模糊", "透明"].map((item) => (
          <button key={item} type="button" className={item === mode ? "on" : ""} onClick={() => setMode(item)}>{item}</button>
        ))}
      </div>
      <Slider label="容差" value={tol} min={1} max={100} onChange={setTol} />
      <label className="ph-chk"><input type="checkbox" defaultChecked />只选相连区域</label>
      <div className="ph-row">
        <button type="button" className="ph-text primary grow" onClick={() => setApplied(mode)}>应用</button>
        <button type="button" className="ph-text grow" onClick={() => setApplied("")}>清除选区</button>
      </div>
      {applied ? <p className="ph-note">已按「{applied}」应用（示意）</p> : null}
    </div>
  );
}

function ScanPane() {
  const [preset, setPreset] = useState("文档");
  const [shadow, setShadow] = useState(40);
  return (
    <div>
      <h4 style={{ marginTop: 0 }}>扫描预设</h4>
      <Chips items={["关闭", "文档", "增强", "黑白"]} value={preset} onPick={setPreset} />
      <label className="ph-chk"><input type="checkbox" defaultChecked />启用扫描件处理</label>
      <Slider label="背景提白" value={shadow} min={0} max={100} onChange={setShadow} />
      <label className="ph-chk"><input type="checkbox" />转灰度</label>
      <label className="ph-chk"><input type="checkbox" />自适应阈值</label>
      <h4>几何与清理</h4>
      <div className="ph-grid">
        {["自动纠偏", "去黑边", "找纸张边缘", "透视矫正"].map((label) => (
          <button key={label} type="button" className="ph-text">{label}</button>
        ))}
      </div>
    </div>
  );
}

function ExportPane(props: { run: (id: string) => void }) {
  const [fmt, setFmt] = useState("jpg");
  const [size, setSize] = useState("orig");
  const [quality, setQuality] = useState(92);
  const [compress, setCompress] = useState("q");
  const [wm, setWm] = useState(false);
  return (
    <div>
      <div className="ph-grid">
        <label className="ph-field">输出格式
          <select value={fmt} aria-label="输出格式" onChange={(e) => setFmt(e.currentTarget.value)}>
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
            <option value="same">与原图相同</option>
          </select>
        </label>
        <label className="ph-field">尺寸预设
          <select value={size} aria-label="尺寸预设" onChange={(e) => setSize(e.currentTarget.value)}>
            <option value="orig">保持原尺寸</option>
            <option value="l1920">最长边 1920</option>
            <option value="a4">A4 短边 2480</option>
            <option value="custom">自定义</option>
          </select>
        </label>
      </div>
      <Slider label="画质" value={quality} min={40} max={100} onChange={setQuality} />
      {size === "custom" ? (
        <div className="ph-grid">
          <label className="ph-field">宽<input type="number" defaultValue={1920} aria-label="宽" /></label>
          <label className="ph-field">高<input type="number" defaultValue={1280} aria-label="高" /></label>
        </div>
      ) : null}
      <h4>压缩</h4>
      <div className="ph-seg2" role="radiogroup" aria-label="压缩方式">
        <button type="button" className={compress === "q" ? "on" : ""} onClick={() => setCompress("q")}>按画质</button>
        <button type="button" className={compress === "target" ? "on" : ""} onClick={() => setCompress("target")}>目标大小</button>
      </div>
      {compress === "target" ? <Chips items={["100K", "200K", "500K", "1M", "2M"]} value="200K" onPick={() => undefined} /> : null}
      <label className="ph-chk"><input type="checkbox" defaultChecked />去掉 EXIF</label>
      <h4>文字水印</h4>
      <label className="ph-chk"><input type="checkbox" checked={wm} onChange={(e) => setWm(e.currentTarget.checked)} />启用水印</label>
      {wm ? <label className="ph-field" style={{ marginTop: 6 }}>文字<input type="text" defaultValue="© HyMd" aria-label="水印文字" /></label> : null}
      <p className="ph-note">单张用右上角「保存」。多张用「批量导出到文件夹」。</p>
      <div className="ph-row">
        <button type="button" className="ph-text grow" onClick={() => props.run(CMD.batch)}>批量导出…</button>
      </div>
    </div>
  );
}

function Pane(props: { mode: PhotoMode; run: (id: string) => void }) {
  if (props.mode === "adjust") return <AdjustPane />;
  if (props.mode === "filter") return <FilterPane />;
  if (props.mode === "markup") return <MarkupPane />;
  if (props.mode === "erase") return <ErasePane />;
  if (props.mode === "bg") return <BgPane />;
  if (props.mode === "scan") return <ScanPane />;
  if (props.mode === "export") return <ExportPane run={props.run} />;
  return <p className="ph-note">比例、旋转和拉直在底栏。</p>;
}

/** 图片编辑面：顶栏、队列、画布、参数、裁剪底栏。data.bar 决定模式条在顶上、左侧，或收进右栏。 */
export function PhotoView(props: ViewProps) {
  const wb = useWorkbench();
  const bar = photoBar(props.data);
  const [mode, setMode] = useState<PhotoMode>("crop");
  const [queueOpen, setQueueOpen] = useState(bar !== "stack");
  const [items, setItems] = useState<Shot[]>(SEED);
  const [current, setCurrent] = useState("a");
  const [checked, setChecked] = useState<Set<string>>(() => new Set(["a"]));
  const [hint, setHint] = useState("裁剪");
  const [zoom, setZoom] = useState(1);
  const [compare, setCompare] = useState("处理后");
  const [spin, setSpin] = useState(0);
  const [flip, setFlip] = useState({ h: false, v: false });
  const [ratio, setRatio] = useState("free");
  const [straight, setStraight] = useState(0);
  const [step, setStep] = useState(1);
  const [ortho, setOrtho] = useState(false);
  const [deg, setDeg] = useState(45);
  const [saveOpen, setSaveOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [degOpen, setDegOpen] = useState(false);
  const [overflow, setOverflow] = useState<string[]>([]);
  const toolsRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef(items);
  const currentRef = useRef(current);
  itemsRef.current = items;
  currentRef.current = current;

  const run = (id: string) => {
    setSaveOpen(false);
    setMoreOpen(false);
    setDegOpen(false);
    void wb.execute(id);
  };

  useEffect(() => setQueueOpen(bar !== "stack"), [bar]);

  useEffect(() => subscribePhoto((cmd) => {
    if (cmd.t === "mode") {
      setMode(cmd.mode);
      setHint(PHOTO_MODES.find((item) => item.id === cmd.mode)?.name ?? "");
    } else if (cmd.t === "queue") setQueueOpen((v) => !v);
    else if (cmd.t === "hint") setHint(cmd.text);
    else if (cmd.t === "open") {
      setItems((list) => [...list, { id: `n${list.length}`, name: `新图片-${list.length + 1}.png`, sub: "1600×1200" }]);
      setHint("已加入队列（示意）");
    } else if (cmd.t === "selectAll") {
      setChecked(() => {
        const list = itemsRef.current;
        const all = list.every((item) => checkedHas(item.id));
        return all ? new Set() : new Set(list.map((item) => item.id));
      });
    } else if (cmd.t === "clear") {
      const keep = currentRef.current;
      setItems((list) => list.filter((item) => item.id === keep));
      setHint("已清空其他图片（示意）");
    } else if (cmd.t === "rot") {
      setSpin((n) => n + cmd.dir * 90);
      setHint(cmd.dir < 0 ? "已向左旋转 90°（示意）" : "已向右旋转 90°（示意）");
    } else if (cmd.t === "flip") {
      setFlip((f) => ({ ...f, [cmd.axis]: !f[cmd.axis] }));
      setHint(cmd.axis === "h" ? "已水平翻转（示意）" : "已垂直翻转（示意）");
    } else if (cmd.t === "swap") {
      setRatio((r) => (r === "16:9" ? "9:16" : r === "9:16" ? "16:9" : r === "4:3" ? "3:4" : r === "3:4" ? "4:3" : r));
      setHint("已横竖互换（示意）");
    } else if (cmd.t === "crop") {
      setStraight(0);
      setHint(cmd.done ? "已完成裁剪（示意）" : "已取消裁剪（示意）");
    }
  }), []);

  const checkedRef = useRef(checked);
  checkedRef.current = checked;
  function checkedHas(id: string) {
    return checkedRef.current.has(id);
  }

  useLayoutEffect(() => {
    const host = toolsRef.current;
    if (!host) return;
    const measure = () => {
      const buttons = [...host.querySelectorAll<HTMLElement>(".ph-qt")];
      const box = host.getBoundingClientRect();
      const vertical = bar === "side";
      const hidden: string[] = [];
      for (const button of buttons) {
        const rect = button.getBoundingClientRect();
        const over = vertical ? rect.bottom > box.bottom + 0.5 : rect.right > box.right + 0.5;
        if (over && button.dataset.qid) hidden.push(button.dataset.qid);
      }
      setOverflow((prev) => (prev.join() === hidden.join() ? prev : hidden));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [bar, queueOpen, mode]);

  const showPanel = bar === "stack" || mode !== "crop";
  const showCrop = mode === "crop";
  const modeName = PHOTO_MODES.find((item) => item.id === mode)?.name ?? "";
  const hiddenTools = QUEUE.filter((item) => overflow.includes(item.id));
  const scaleX = (flip.h ? -1 : 1) * zoom;
  const scaleY = (flip.v ? -1 : 1) * zoom;

  return (
    <div className="photo" data-bar={bar} data-mode={mode} data-crop={showCrop ? "1" : "0"} data-panel={showPanel ? "1" : "0"}>
      <header className="ph-tb">
        <div className="ph-grp">
          <button type="button" className="ph-icon" title="撤销" aria-label="撤销" onClick={() => run(CMD.undo)}><Icon name="undo" size={16} /></button>
          <button type="button" className="ph-icon" title="重做" aria-label="重做" onClick={() => run(CMD.redo)}><Icon name="redo" size={16} /></button>
          <span className="ph-sep" />
        </div>
        <div className="ph-tools" ref={toolsRef} data-dir={bar === "side" ? "col" : "row"}>
          {QUEUE.map((item) => (
            <button key={item.id} type="button" className="ph-icon ph-qt" data-qid={item.id} title={item.label} aria-label={item.label} onClick={() => run(item.cmd)}>
              <Icon name={item.icon} size={16} />
            </button>
          ))}
        </div>
        {bar !== "stack" ? (
          <div className="ph-modes" role="tablist" aria-label="模式">
            {PHOTO_MODES.map((item) => (
              <button key={item.id} type="button" role="tab" className={mode === item.id ? "ph-mode on" : "ph-mode"} aria-selected={mode === item.id} onClick={() => run(item.cmd)}>
                <Icon name={item.icon} size={16} />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        ) : null}
        {mode === "markup" ? (
          <div className="ph-ortho">
            <button type="button" className={ortho ? "ph-text on" : "ph-text"} aria-pressed={ortho} title="正交 / 仅直线（F8）" onClick={() => setOrtho((v) => !v)}>正交</button>
            <div className="ph-pop" onPointerDown={(e) => e.stopPropagation()}>
              <button type="button" className="ph-icon sm" title="吸附角度步长" aria-label="吸附角度步长" onClick={() => setDegOpen((v) => !v)}><Icon name="chevron-down" size={16} /></button>
              {degOpen ? (
                <div className="ph-menu" role="menu">
                  <div className="ph-label">吸附角度步长</div>
                  {[15, 30, 45, 90].map((n) => (
                    <button key={n} type="button" onClick={() => { setDeg(n); setDegOpen(false); }}><span>{n}°{n === deg ? "（当前）" : ""}</span></button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        <span className="ph-sp" />
        <div className="ph-grp">
          <div className="ph-pop" onPointerDown={(e) => e.stopPropagation()}>
            <button type="button" className="ph-text primary" aria-expanded={saveOpen} onClick={() => { setMoreOpen(false); setSaveOpen((v) => !v); }}>
              保存
              <Icon name="chevron-down" size={16} />
            </button>
            {saveOpen ? (
              <div className="ph-menu" role="menu">
                <button type="button" onClick={() => run(CMD.save)}><span>保存</span></button>
                <button type="button" onClick={() => run(CMD.saveCopy)}><span>另存副本</span></button>
                <button type="button" onClick={() => run(CMD.copyClip)}><span>复制到剪贴板</span></button>
              </div>
            ) : null}
          </div>
          <div className="ph-pop" onPointerDown={(e) => e.stopPropagation()}>
            <button type="button" className="ph-icon" title="更多操作" aria-label="更多操作" onClick={() => { setSaveOpen(false); setMoreOpen((v) => !v); }}>
              <Icon name="more" size={16} />
            </button>
            {moreOpen ? (
              <div className="ph-menu" role="menu">
                {hiddenTools.length > 0 ? <div className="ph-label">更多操作</div> : null}
                {hiddenTools.map((item) => (
                  <button key={item.id} type="button" onClick={() => run(item.cmd)}><span>{item.label}</span></button>
                ))}
                {hiddenTools.length > 0 ? <div className="ph-line" /> : null}
                <button type="button" onClick={() => run(CMD.toggleQueue)}><span>{queueOpen ? "收起队列" : "显示队列"}</span></button>
                <button type="button" onClick={() => run(CMD.help)}><span>快捷键</span></button>
                <button type="button" onClick={() => { setHint("已放弃全部编辑（示意）"); setMoreOpen(false); }}><span>放弃全部编辑</span></button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="ph-main">
        {queueOpen ? (
          <aside className="ph-queue">
            <div className="ph-qhead">
              队列 <span className="cnt">{items.length}</span>
              <span className="ph-sp" />
              <button type="button" className="ph-icon sm" aria-label="收起队列" onClick={() => run(CMD.toggleQueue)}>
                <Icon name="chevron-right" size={16} style={{ transform: "scaleX(-1)" }} />
              </button>
            </div>
            <div className="ph-qlist">
              {items.map((item) => (
                <div key={item.id} className={item.id === current ? "ph-qi cur" : "ph-qi"}>
                  <input
                    type="checkbox"
                    checked={checked.has(item.id)}
                    aria-label={`选中 ${item.name}`}
                    onChange={() => setChecked((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    })}
                  />
                  <span className="ph-thumb" />
                  <button type="button" className="ph-nm" onClick={() => setCurrent(item.id)}>
                    <b>{item.name}</b>
                    <small>{item.sub}</small>
                  </button>
                  <button
                    type="button"
                    className="ph-icon sm"
                    aria-label={`移出 ${item.name}`}
                    disabled={items.length < 2}
                    onClick={() => {
                      setItems((list) => list.filter((shot) => shot.id !== item.id));
                      if (current === item.id) setCurrent(items.find((shot) => shot.id !== item.id)?.id ?? item.id);
                    }}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="ph-qdrop">拖入多张图片即可加入队列</div>
          </aside>
        ) : null}
        <div className="ph-stage">
          <div className="ph-art" style={{ transform: `translate(-50%, -50%) rotate(${spin}deg) scale(${scaleX}, ${scaleY})` }} />
          {showCrop ? (
            <div className="ph-frame" aria-hidden>
              <i /><i /><i /><i />
            </div>
          ) : (
            <div className="ph-float ph-compare">
              <div className="ph-seg" role="radiogroup" aria-label="对比">
                {["处理后", "左右对比", "拖动对比"].map((item) => (
                  <button key={item} type="button" className={compare === item ? "on" : ""} onClick={() => setCompare(item)}>{item}</button>
                ))}
              </div>
            </div>
          )}
          {compare !== "处理后" && !showCrop ? <div className="ph-frame" style={{ width: "40%", borderStyle: compare === "拖动对比" ? "dashed" : "solid" }} /> : null}
          <div className="ph-float ph-zoom" title="视图缩放">
            <button type="button" className="ph-icon sm" aria-label="缩小" onClick={() => setZoom((z) => Math.max(0.25, Math.round(z * 80) / 100))}><Icon name="zoomout" size={16} /></button>
            <button type="button" className="ph-text" title="适应窗口" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
            <button type="button" className="ph-icon sm" aria-label="放大" onClick={() => setZoom((z) => Math.min(4, Math.round(z * 125) / 100))}><Icon name="zoomin" size={16} /></button>
            <button type="button" className="ph-text" title="1:1 实际像素" onClick={() => setZoom(1)}>1:1</button>
          </div>
        </div>
        {showPanel ? (
          <aside className="ph-panel">
            {bar === "stack" ? (
              <div className="ph-modes-stack" role="tablist" aria-label="模式">
                {PHOTO_MODES.map((item) => (
                  <button key={item.id} type="button" className={mode === item.id ? "ph-text on" : "ph-text"} aria-selected={mode === item.id} onClick={() => run(item.cmd)}>
                    {item.name}
                  </button>
                ))}
              </div>
            ) : null}
            <h3>{modeName}</h3>
            <Pane mode={mode} run={run} />
          </aside>
        ) : null}
      </div>

      {showCrop ? (
        <footer className="ph-crop">
          <button type="button" className="ph-icon" title="向左旋转 90°" aria-label="向左旋转 90°" onClick={() => run(CMD.rotL)}>
            <Icon name="rotate" size={16} style={{ transform: "scaleX(-1)" }} />
          </button>
          <button type="button" className="ph-icon" title="向右旋转 90°" aria-label="向右旋转 90°" onClick={() => run(CMD.rotR)}><Icon name="rotate" size={16} /></button>
          <span className="ph-sep" />
          <select aria-label="比例" value={ratio} onChange={(e) => setRatio(e.currentTarget.value)}>
            {["free", "orig", "1:1", "4:3", "3:2", "16:9", "9:16"].map((item) => (
              <option key={item} value={item}>{item === "free" ? "自由" : item === "orig" ? "原始" : item}</option>
            ))}
          </select>
          <button type="button" className="ph-icon" title="横竖互换" aria-label="横竖互换" onClick={() => run(CMD.swap)}><Icon name="sync" size={16} /></button>
          <button type="button" className="ph-icon" title="水平翻转" aria-label="水平翻转" onClick={() => run(CMD.flipH)}><Icon name="rotate" size={16} style={{ transform: "rotate(90deg)" }} /></button>
          <button type="button" className="ph-icon" title="垂直翻转" aria-label="垂直翻转" onClick={() => run(CMD.flipV)}><Icon name="rotate" size={16} style={{ transform: "rotate(0deg) scaleY(-1)" }} /></button>
          <span className="ph-sep" />
          <label className="ph-straight">
            拉直
            <input type="range" min={-45} max={45} step={step} value={straight} aria-label="拉直" onChange={(e) => setStraight(Number(e.currentTarget.value))} />
            <input type="number" min={-45} max={45} step={step} value={straight} aria-label="拉直角度" onChange={(e) => setStraight(Number(e.currentTarget.value) || 0)} />
            °
            <span>步长</span>
            <select aria-label="拉直步长" value={step} onChange={(e) => setStep(Number(e.currentTarget.value))}>
              {[0.1, 0.5, 1, 5, 15, 45].map((n) => <option key={n} value={n}>{n}°</option>)}
            </select>
          </label>
          <button type="button" className="ph-text" onClick={() => run(CMD.cropCancel)}>取消</button>
          <button type="button" className="ph-text primary" onClick={() => run(CMD.cropDone)}>完成</button>
        </footer>
      ) : null}

      <div className="ph-status">
        <span>{hint}</span>
        <span className="ph-sp" />
        <span>尺寸 <b>1920 × 1280</b></span>
        <span>缩放 <b>{Math.round(zoom * 100)}%</b></span>
        <span>模式 <b>{modeName}</b></span>
      </div>
    </div>
  );
}
