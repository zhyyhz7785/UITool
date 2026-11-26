import type { PartId } from "@tpl/workbench/types";
import { Button } from "@tpl/workbench/ui";
import { useEffect, useRef, useState } from "react";
import { Segmented } from "../controls";
import { design, useDesign } from "../store";

type ProductId = "hy3d" | "hymd" | "general";

const PAGES: Record<ProductId, { src: string; origin: string; name: string; kind: "hy3d" | "hymd" }> = {
  hy3d: { src: "http://127.0.0.1:1450/index.html?uitool=1", origin: "http://127.0.0.1:1450", name: "HY3D", kind: "hy3d" },
  hymd: { src: "http://127.0.0.1:1460/?uitool=1", origin: "http://127.0.0.1:1460", name: "HyMdTauri", kind: "hymd" },
  general: { src: "http://127.0.0.1:1460/?uitool=1&general=1", origin: "http://127.0.0.1:1460", name: "通用模板", kind: "hymd" }
};

const NATIVE = { w: 1440, h: 900 };

const PART: Record<string, PartId> = {
  titlebar: "titlebar",
  menubar: "titlebar",
  ribbon: "toolbar",
  sidebar: "sidebar",
  auxiliary: "auxiliarybar",
  editor: "editor",
  statusbar: "statusbar",
  command: "panel"
};

type Named = { id: string; label: string };
type Region = { id: string; label: string; x: number; y: number; w: number; h: number };
type Status = { up?: boolean; preview?: boolean; page?: boolean; commit?: string };
type UiState = {
  skin?: string;
  theme?: string;
  density?: string;
  windowWidth?: number;
  windowHeight?: number;
  devicePixelRatio?: number;
  sidebarWidth?: number;
  auxiliaryWidth?: number;
  sidebarVisible?: boolean;
  auxiliaryVisible?: boolean;
  ribbonMinimized?: boolean;
  ribbonTab?: string;
};

/** 嵌入产品自己的开发页。连不上就停在断开，不画设计器里的另一套壳。 */
export function ProductPreview({ product }: { product: ProductId }) {
  const page = PAGES[product];
  const frameRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const selecting = useDesign((s) => s.selecting);
  const selected = useDesign((s) => s.selected);
  const [up, setUp] = useState<boolean | null>(null);
  const [preview, setPreview] = useState(false);
  const [commit, setCommit] = useState("");
  const seenCommit = useRef("");
  const [stale, setStale] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [skins, setSkins] = useState<Named[]>([]);
  const [schemes, setSchemes] = useState<Named[]>([]);
  const [skin, setSkin] = useState("");
  const [scheme, setScheme] = useState("");
  const [quiet, setQuiet] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [ui, setUi] = useState<UiState | null>(null);
  const [fit, setFit] = useState(false);
  const [stage, setStage] = useState({ w: 800, h: 600 });
  const [reloadKey, setReloadKey] = useState(0);
  const [explorerScene, setExplorerScene] = useState<"sample" | "empty">("sample");
  const [previewStyle, setPreviewStyle] = useState<"layer" | "a5" | "original">("layer");
  const frameSrc = product === "hy3d" ? `${page.src}&explorer=${explorerScene}&style=${previewStyle}` : page.src;

  const show = product === "hy3d" ? up === true : preview;
  const scale = fit ? Math.min(1, stage.w / NATIVE.w, stage.h / NATIVE.h) : 1;
  const box = fit ? NATIVE : stage;

  const ask = (op: "skins" | "regions" | "state") => {
    frameRef.current?.contentWindow?.postMessage({ source: "uitool-host", op }, page.origin);
  };

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: Math.max(320, el.clientWidth), h: Math.max(240, el.clientHeight) });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [show]);

  useEffect(() => {
    let gone = false;
    const read = () => {
      void fetch(`/__uitool/preview/status?product=${page.kind}`)
        .then((res) => res.json())
        .then((body: Status) => {
          if (gone) return;
          setUp(!!body.up);
          setPreview(!!body.preview);
          const next = body.commit || "";
          setCommit(next);
          if (seenCommit.current && next && seenCommit.current !== next) setStale(true);
          else if (next) seenCommit.current = next;
        })
        .catch(() => {
          if (!gone) {
            setUp(false);
            setError("设计器的开发服务没有预览接口。重新运行 npm run tauri dev 后再试。");
          }
        });
    };
    read();
    const timer = window.setInterval(read, 15000);
    return () => {
      gone = true;
      window.clearInterval(timer);
    };
  }, [page.kind]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== page.origin) return;
      const data = event.data as {
        source?: string;
        product?: string;
        op?: string;
        skins?: Named[];
        schemes?: Named[];
        skin?: string;
        scheme?: string;
        regions?: Region[];
        state?: UiState;
      } | null;
      if (!data || data.source !== "uitool-product" || data.product !== page.kind) return;
      if (data.op === "skins") {
        setSkins(Array.isArray(data.skins) ? data.skins : []);
        setSchemes(Array.isArray(data.schemes) ? data.schemes : []);
        setSkin(data.skin || "");
        setScheme(data.scheme || "");
      }
      if (data.op === "regions") setRegions(Array.isArray(data.regions) ? data.regions : []);
      if (data.op === "state" && data.state) setUi(data.state);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [page.origin, page.kind]);

  useEffect(() => {
    if (!show || !selecting) return;
    ask("regions");
  }, [show, selecting, fit, stage.w, stage.h, reloadKey, skin, scheme, previewStyle, explorerScene]);

  const start = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/__uitool/preview/start?product=${page.kind}`, { method: "POST" });
      const body = (await res.json()) as Status;
      setUp(!!body.up);
      setPreview(!!body.preview);
      setCommit(body.commit || "");
      if (page.kind === "hymd" && body.up && !body.preview) setError(`${page.origin} 上已有别的开发服务。不会嵌入它，以免碰到正在运行的软件。先停掉那个前端，再拉起工作树里的页面。`);
      else if (!body.up) setError(`${page.name} 的前端没有起来。只拉前端，不编译 Rust。`);
    } catch {
      setUp(false);
      setError("设计器的开发服务没有预览接口。重新运行 npm run tauri dev 后再试。");
    } finally {
      setBusy(false);
    }
  };

  const resync = () => {
    if (design.dirty()) return;
    setStale(false);
    seenCommit.current = commit;
    setReloadKey((n) => n + 1);
  };

  return (
    <div className="ut-preview">
      <div className="ut-preview-bar">
        <span className="ut-dim">{page.name}</span>
        <Segmented
          value={selecting ? "select" : "use"}
          options={[
            { value: "select", label: "设计" },
            { value: "use", label: "试用" }
          ]}
          onChange={(v) => design.setSelecting(v === "select")}
        />
        <Segmented
          value={fit ? "fit" : "real"}
          options={[
            { value: "real", label: "100%" },
            { value: "fit", label: "适应窗口" }
          ]}
          onChange={(v) => setFit(v === "fit")}
        />
        <span className="ut-dim">
          {Math.round(box.w)} × {Math.round(box.h)}
          {fit ? ` · ${Math.round(scale * 100)}%` : ""}
        </span>
        {product === "hy3d" && (
          <Segmented
            value={previewStyle}
            options={[
              { value: "layer", label: "图层设计" },
              { value: "a5", label: "HY Ribbon / A5" },
              { value: "original", label: "原始界面" }
            ]}
            onChange={(v) => {
              setRegions([]);
              setUi(null);
              setPreviewStyle(v === "original" ? "original" : v === "a5" ? "a5" : "layer");
            }}
          />
        )}
        {product === "hy3d" && (
          <select
            className="wb-select"
            aria-label="资源管理器预览场景"
            title="仅 UITool 预览：示例目录在内存中，切换时重置示例"
            value={explorerScene}
            onChange={(e) => setExplorerScene(e.target.value === "empty" ? "empty" : "sample")}
          >
            <option value="sample">资源：示例文件与工程</option>
            <option value="empty">资源：未打开目录</option>
          </select>
        )}
        {skins.length > 0 && !(product === "hy3d" && previewStyle !== "original") && (
          <select
            className="wb-select"
            value={skin}
            aria-label="皮肤"
            onChange={(e) => {
              const id = e.target.value;
              setSkin(id);
              frameRef.current?.contentWindow?.postMessage({ source: "uitool-host", op: "setSkin", id }, page.origin);
            }}
          >
            {skins.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        )}
        {schemes.length > 0 && (
          <select
            className="wb-select"
            value={scheme}
            aria-label="配色"
            onChange={(e) => {
              const id = e.target.value;
              setScheme(id);
              frameRef.current?.contentWindow?.postMessage({ source: "uitool-host", op: "setScheme", id }, page.origin);
            }}
          >
            {schemes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        )}
        <span className="wb-sp" />
        {commit && <span className="ut-dim">来源 {commit}</span>}
        {ui && (
          <span className="ut-dim">
            主题 {ui.theme || "未报"} · 密度 {ui.density || "未报"} · {ui.windowWidth || 0}×{ui.windowHeight || 0} · {ui.devicePixelRatio || 1}x · 侧栏
            {ui.sidebarVisible ? ` ${ui.sidebarWidth || 0}` : " 关"}
            {page.kind === "hy3d" ? ` · 功能区 ${ui.ribbonMinimized ? "收起" : "展开"}${ui.ribbonTab ? ` ${ui.ribbonTab}` : ""}` : ""}
          </span>
        )}
        {show && !preview && product === "hy3d" && <span className="ut-dim">来源是正在运行的页面。</span>}
        {stale && <span className="ut-dim">页面有更新。</span>}
        {stale && (
          <Button onClick={resync}>{design.dirty() ? "有未保存设计，没有刷新" : "重新同步"}</Button>
        )}
        {selecting && <span className="ut-dim">字号、间距和颜色若只改在设计器里，写回链路没有对应字段，不能写回产品。</span>}
        {preview && quiet && skins.length === 0 && <span className="ut-dim">这一页还没有回报皮肤。</span>}
      </div>
      <div className="ut-stage ut-product-stage" ref={stageRef}>
        {show && (
          <div className="ut-product-fit" style={{ width: box.w * scale, height: box.h * scale }}>
            <div className="ut-product-scale" style={{ width: box.w, height: box.h, transform: scale === 1 ? undefined : `scale(${scale})` }}>
              <iframe
                key={reloadKey}
                ref={frameRef}
                className="ut-product-frame"
                title={page.name}
                src={frameSrc}
                style={{ pointerEvents: selecting ? "none" : "auto" }}
                onLoad={() => {
                  ask("skins");
                  ask("regions");
                  ask("state");
                  window.setTimeout(() => setQuiet(true), 1500);
                }}
              />
              {selecting && (
                <div className="ut-product-overlay">
                  {regions.map((region) => {
                    const part = PART[region.id];
                    const on = !!part && selected?.part === part;
                    return (
                      <button
                        key={region.id}
                        type="button"
                        className={"ut-product-hit" + (on ? " on" : "")}
                        style={{ left: region.x, top: region.y, width: region.w, height: region.h }}
                        onClick={() => part && design.select({ part })}
                      >
                        <span>{region.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        {up !== null && !show && (
          <div className="ut-product-off">
            <div className="ut-note">
              {up
                ? `预览断开。${page.origin} 上的页面不是工作树里的预览入口。这里不会改用设计器里的仿制界面，也不会嵌进正在运行的软件。`
                : `预览断开。${page.name} 的开发页没有在 ${page.origin} 上。这里不会改用设计器里的仿制界面。`}
            </div>
            {error && <div className="ut-note">{error}</div>}
            {!up && <Button onClick={() => void start()}>{busy ? "正在拉起前端…" : "拉起前端"}</Button>}
          </div>
        )}
        {up === null && !show && (
          <div className="ut-product-off">
            <div className="ut-note">正在查看预览服务…</div>
          </div>
        )}
      </div>
    </div>
  );
}
