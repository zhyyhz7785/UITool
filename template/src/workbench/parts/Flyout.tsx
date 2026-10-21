import { useEffect } from "react";
import { useWorkbench } from "../context";

/** 按钮下方拉出的命令列表。预览被缩放时，坐标要除回缩放比。 */
export function Flyout({ anchor, ids, onPick }: { anchor: HTMLElement; ids: string[]; onPick: () => void }) {
  const wb = useWorkbench();
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onPick();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onPick]);
  const root = anchor.closest(".wb-root");
  const origin = root?.getBoundingClientRect();
  const rect = anchor.getBoundingClientRect();
  const scale = wb.scale || 1;
  const scaled = scale !== 1 && origin;
  const top = scaled ? (rect.bottom - origin.top) / scale : rect.bottom;
  const left = scaled ? (rect.left - origin.left) / scale : rect.left;
  return (
    <div className="wb-ribbon-fly" style={{ top, left }} onPointerDown={(e) => e.stopPropagation()} onContextMenu={(e) => e.preventDefault()}>
      {ids.map((id, i) => {
        const cmd = wb.findCommand(id);
        return (
          <button
            key={id + ":" + i}
            type="button"
            onClick={() => {
              void wb.execute(id);
              onPick();
            }}
          >
            {cmd?.title || id}
          </button>
        );
      })}
    </div>
  );
}
