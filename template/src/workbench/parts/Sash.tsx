import { useRef } from "react";

interface SashProps {
  /** x：左右拖动改宽度；y：上下拖动改高度 */
  axis: "x" | "y";
  /** 往正方向拖时尺寸变大为 1，变小为 -1 */
  sign: 1 | -1;
  value: number;
  min: number;
  max: number;
  scale?: number;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
}

/** 分割条：不占布局宽度，命中区 var(--sash-size)，悬停 / 拖动时显示 sash.hoverBorder。 */
export function Sash({ axis, sign, value, min, max, scale = 1, onChange, onCommit }: SashProps) {
  const drag = useRef<{ start: number; base: number; last: number } | null>(null);
  const clamp = (v: number) => Math.round(Math.max(min, Math.min(max, v)));
  return (
    <div className={"wb-sash wb-sash-" + axis}>
      <div
        className="wb-sash-hit"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { start: axis === "x" ? e.clientX : e.clientY, base: value, last: value };
          e.currentTarget.classList.add("active");
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const delta = ((axis === "x" ? e.clientX : e.clientY) - d.start) / scale;
          d.last = clamp(d.base + sign * delta);
          onChange(d.last);
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          e.currentTarget.classList.remove("active");
          if (d && d.last !== d.base) onCommit(d.last);
          else if (d) onCommit(d.base);
        }}
      />
    </div>
  );
}
