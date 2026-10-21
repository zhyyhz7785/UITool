import { Button } from "@tpl/workbench/ui";
import { useWorkbench } from "@tpl/workbench/context";
import { useState } from "react";
import { design, useDesign } from "../store";

const KEY = "uitool.hy3d-icon";

type Item = { id: string; file: string; name: string; note: string; group: string };
type Target = "hy3d" | "hymd";

const ITEMS: Item[] = [
  { id: "07", file: "07-hy-cube-above.png", group: "Hy 在方块上面", name: "hy3d · Hy 上立方", note: "白字 Hy 压在方块上。顶面是界面蓝，两侧浅灰，明暗和视口小方块一样。" },
  { id: "09", file: "09-hy-cube-corner.png", group: "Hy 在方块上面", name: "hy3d · Hy 大方块", note: "同一套三面颜色，方块再大一圈，白字 Hy 小一号，仍压在上面。" },
  { id: "08", file: "08-hy-3-above.png", group: "Hy 字，标记在上面", name: "hy3d · Hy 上3", note: "Hy 在下，数字 3 居中叠在上面。" },
  { id: "10", file: "10-hy-3-corner.png", group: "Hy 字，标记在上面", name: "hy3d · Hy 角3", note: "Hy 在下，数字 3 放在右上角。" },
  { id: "01", file: "01-letter-cube.png", group: "和 HyMd 同一块蓝玻璃", name: "hy3d · 3方", note: "大号 3，右上角一个小方块。摆法和 HyMd 的 M、加号一样。" },
  { id: "02", file: "02-letters-3d.png", group: "和 HyMd 同一块蓝玻璃", name: "hy3d · 3D", note: "两个字铺在同一块蓝玻璃上。" },
  { id: "03", file: "03-white-cube.png", group: "和 HyMd 同一块蓝玻璃", name: "hy3d · 方块", note: "只有一个白色等轴方块。" },
  { id: "04", file: "04-letter-h.png", group: "和 HyMd 同一块蓝玻璃", name: "hy3d · H3", note: "大号 H，右上角小 3。" },
  { id: "05", file: "05-dark-cube.png", group: "hy3d 深色底", name: "hy3d · 蓝顶", note: "深色圆角方块，顶面是界面里的强调蓝。和 HyMd 并排时底色不同。" },
  { id: "06", file: "06-dark-axes.png", group: "hy3d 深色底", name: "hy3d · 三轴", note: "红、绿、蓝三条轴，颜色和视口坐标轴一致。" }
];

const PROGRAM: Record<Target, string> = { hy3d: "hy3d", hymd: "HyMd" };

const src = (file: string, v = 1) => `/hy3d-icons/${file}?v=${v}`;

function IconImg({ file, className, width, height }: { file: string; className?: string; width?: number; height?: number }) {
  const [v, setV] = useState(7);
  return (
    <img
      className={className}
      width={width}
      height={height}
      alt=""
      src={src(file, v)}
      onError={() => {
        if (v < 8) window.setTimeout(() => setV((n) => n + 1), 300);
      }}
    />
  );
}

function targetOf(workType?: string): Target | null {
  if (workType === "cad2d") return "hy3d";
  if (workType === "writing") return "hymd";
  return null;
}

export function Hy3dIconsView() {
  const wb = useWorkbench();
  const workType = useDesign((s) => s.doc.config.workType);
  const target = targetOf(workType);
  const [pick, setPick] = useState(() => localStorage.getItem(KEY) ?? "");
  const [busy, setBusy] = useState(false);
  const chosen = ITEMS.find((it) => it.id === pick);
  const choose = (id: string) => {
    localStorage.setItem(KEY, id);
    setPick(id);
  };
  const replace = async () => {
    if (!chosen || !target) return;
    setBusy(true);
    try {
      const res = await fetch(src(chosen.file, 1));
      if (!res.ok) throw new Error("读不到这张图标");
      const bytes = new Uint8Array(await res.arrayBuffer());
      let bin = "";
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      const png = btoa(bin);
      const put = await fetch("/__uitool/fs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "install-icon", target, png })
      });
      const body = (await put.json()) as { error?: string };
      if (!put.ok) throw new Error(body.error || "替换失败");
      const image = src(chosen.file, Date.now());
      design.setConfig((c) => ({ ...c, app: { ...c.app, iconImage: image } }));
      wb.notify("success", `已换成 ${chosen.name}`, `${PROGRAM[target]} 的图标已写入。正在运行的窗口要重新打开才看得到任务栏图标。`);
    } catch (e) {
      wb.notify("error", "没有换上", e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  let group = "";
  return (
    <div className="ut-view ut-appicon-view">
      <div className="ut-pad ut-appicon-ref">
        <IconImg file="00-hymd.png" />
        <div className="ut-note">左边是现在的 HyMd。先点一枚 hy3d 图标，再在底部替换到当前预览的程序上。</div>
      </div>
      {ITEMS.map((it) => {
        const head = it.group !== group;
        group = it.group;
        return (
          <div key={it.id}>
            {head && <div className="ut-appicon-group">{it.group}</div>}
            <div className="ut-appicon-list">
              <button type="button" className={"ut-appicon-row" + (pick === it.id ? " on" : "")} onClick={() => choose(it.id)}>
                <IconImg className="shot" file={it.file} />
                <span>
                  <span className="ut-appicon-name">{it.name}</span>
                  <span className="ut-appicon-note">{it.note}</span>
                  <span className="ut-appicon-minis">
                    <span className="ut-appicon-chip dark"><IconImg file={it.file} width={28} height={28} /></span>
                    <span className="ut-appicon-chip light"><IconImg file={it.file} width={16} height={16} /></span>
                  </span>
                </span>
              </button>
            </div>
          </div>
        );
      })}
      <div className="ut-appicon-foot">
        <div className="ut-note">{target ? `当前预览是 ${PROGRAM[target]}` : "当前预览不是 hy3d 或 HyMd"}</div>
        <Button primary disabled={!chosen || !target || busy} onClick={() => void replace()}>
          {busy ? "正在替换…" : target ? `替换到 ${PROGRAM[target]} 的图标` : "先打开 hy3d 或 HyMd 的预览"}
        </Button>
      </div>
    </div>
  );
}
