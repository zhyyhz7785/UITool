import { Button } from "@tpl/workbench/ui";
import { useWorkbench } from "@tpl/workbench/context";
import { useEffect, useState } from "react";
import { Section, TextField } from "../controls";
import { allowInstance, inspect, listInstances, patch, publishLive, revertLive, type LiveInstance } from "../live/client";
import { design, useDesign } from "../store";
import { linkFrom, previewHymd, previewHy3d, readHymd, readHy3d, writeHymd, writeHy3d, type LinkFrom, type WritePreview } from "./exchange";
import { publishPaths } from "./io";
import { loadPaths, type ProductPaths } from "./paths";

const NAME: Record<LinkFrom, string> = { hy3d: "HY3D", hymd: "HyMdTauri" };
const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

function changed(files: WritePreview[]) {
  return files.filter((file) => file.before !== file.after);
}

/** 活动栏「连接」：登记路径、读规格、预览差异后写回工作树，或连接正在运行的开发窗口。 */
export function LinkView() {
  const wb = useWorkbench();
  const workType = useDesign((s) => s.doc.config.workType);
  const phase = useDesign((s) => s.phase);
  const tokens = useDesign((s) => s.doc.config.tokens);
  const [from, setFrom] = useState<LinkFrom | null>(() => linkFrom());
  const [paths, setPaths] = useState<ProductPaths[]>(() => loadPaths());
  const [preview, setPreview] = useState<WritePreview[] | null>(null);
  const [instances, setInstances] = useState<LiveInstance[]>([]);
  const [live, setLive] = useState<LiveInstance | null>(null);
  const [inspected, setInspected] = useState("");
  const run = async (ok: string, fn: () => Promise<void>) => {
    try {
      await fn();
      setFrom(linkFrom());
      wb.notify("success", ok);
    } catch (e) {
      wb.notify("error", "没有完成", errMsg(e));
    }
  };
  const edit = (id: ProductPaths["id"], patch: Partial<ProductPaths>) => {
    setPaths((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };
  useEffect(() => {
    const timer = window.setInterval(() => {
      listInstances().then(setInstances).catch(() => setInstances([]));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const savePaths = () => run("已记住路径", () => publishPaths(paths));
  const showPreview = async (files: WritePreview[]) => {
    setPreview(files);
    const n = changed(files).length;
    wb.notify("info", n ? `有 ${n} 个文件会变化` : "没有需要写回的差异");
  };
  return (
    <div className="ut-view">
      <div className="ut-note">主仓只读。写回只落到勾选授权的开发工作树，并且先看差异。状态：{phase === "baseline" ? "原始设计" : phase === "draft" ? "实时草稿" : phase === "published" ? "正式设计" : "本地设计"}{from ? ` · 来自 ${NAME[from]}` : ""}{workType ? ` · ${workType}` : ""}</div>
      <Section title="产品路径">
        {paths.map((item) => (
          <div key={item.id}>
            <div className="ut-group-title">{item.id === "hy3d" ? "HY3D" : "HyMdTauri"}</div>
            <TextField value={item.main} placeholder="主仓，只读" onChange={(main) => edit(item.id, { main })} />
            <TextField value={item.worktree} placeholder="开发工作树，授权后可写" onChange={(worktree) => edit(item.id, { worktree })} />
            <label className="ut-note">
              <input type="checkbox" checked={item.authorized} onChange={(e) => edit(item.id, { authorized: e.target.checked })} /> 授权写入这个工作树
            </label>
          </div>
        ))}
        <Button onClick={() => void savePaths()}>记住路径</Button>
      </Section>
      <Section title="HY3D 规格">
        <div className="ut-row">
          <Button onClick={() => void run("已读取 HY3D", readHy3d)}>读取</Button>
          <Button onClick={() => void run("已放弃未保存修改", async () => design.revertUnsaved())}>放弃修改</Button>
          <Button
            onClick={() =>
              void run("差异已列出", async () => {
                await showPreview(await previewHy3d());
              })
            }
          >
            预览写回
          </Button>
          <Button
            onClick={() =>
              void run("已写入开发工作树", async () => {
                await writeHy3d();
                setPreview(null);
              })
            }
          >
            确认写回
          </Button>
        </div>
      </Section>
      <Section title="HyMdTauri 规格">
        <div className="ut-row">
          <Button onClick={() => void run("已读取 HyMdTauri", readHymd)}>读取</Button>
          <Button
            onClick={() =>
              void run("差异已列出", async () => {
                await showPreview(await previewHymd());
              })
            }
          >
            预览写回
          </Button>
          <Button
            onClick={() =>
              void run("已写入开发工作树", async () => {
                await writeHymd();
                setPreview(null);
              })
            }
          >
            确认写回
          </Button>
        </div>
      </Section>
      {preview && (
        <Section title="写回差异">
          {changed(preview).length === 0 && <div className="ut-note">和目标文件一致。</div>}
          {changed(preview).map((file) => (
            <div key={file.file} className="ut-note">
              {file.file} · 原文 {file.before.length} 字，将写成 {file.after.length} 字
            </div>
          ))}
        </Section>
      )}
      <Section title="开发窗口">
        <div className="ut-note">产品以开发态打开后会出现在这里。允许之后才能读尺寸、改变量和恢复。不会重载图纸，也不编译 Rust。</div>
        {instances.length === 0 && <div className="ut-note">还没有开发窗口。把 adapters/uitool-live.js 放进本机的 HY3D 或 HyMdTauri 开发页。</div>}
        {instances.map((inst) => (
          <div key={inst.id} className="ut-snap">
            <span className="ut-grow">
              {inst.product === "hy3d" ? "HY3D" : "HyMdTauri"} · {inst.label}
              {inst.skin ? ` · ${inst.skin}` : ""} · {inst.status === "allowed" ? "已允许" : "等待允许"}
            </span>
            {inst.status !== "allowed" && (
              <Button
                onClick={() =>
                  void run("已允许连接", async () => {
                    const token = await allowInstance(inst.id);
                    const next = { ...inst, status: "allowed" as const, token };
                    setLive(next);
                    setInstances((list) => list.map((item) => (item.id === inst.id ? next : item)));
                  })
                }
              >
                允许
              </Button>
            )}
            {inst.status === "allowed" && (
              <Button
                onClick={() =>
                  void run("已读到元素", async () => {
                    const info = await inspect({ ...inst, token: inst.token || live?.token || "" });
                    setLive({ ...inst, token: inst.token || live?.token || "" });
                    setInspected(`${info.label} ${info.width}×${info.height}`);
                    if (info.tokens) {
                      design.setConfig((c) => ({ ...c, tokens: { ...info.tokens, ...c.tokens } }));
                    }
                  })
                }
              >
                读取选中
              </Button>
            )}
          </div>
        ))}
        {inspected && <div className="ut-note">选中：{inspected}</div>}
        {live?.token && (
          <div className="ut-row">
            <Button
              onClick={() =>
                void run("已改到开发窗口", async () => {
                  const scheme = design.get().doc.config.schemes?.find((item) => item.id === design.get().doc.config.scheme);
                  await patch(live, { tokens, hyRibbon: scheme?.chrome?.hyRibbon, sidebar: sidebarOf() });
                })
              }
            >
              应用到窗口
            </Button>
            <Button onClick={() => void run("已恢复连接前的界面", async () => { await revertLive(live); })}>恢复</Button>
            <Button
              onClick={() =>
                void run("已取回窗口参数", async () => {
                  const published = await publishLive(live);
                  design.setConfig((c) => ({
                    ...c,
                    tokens: published.tokens ?? c.tokens,
                    schemes: c.schemes?.map((item) => (item.id === c.scheme && published.hyRibbon ? { ...item, chrome: { ...item.chrome, hyRibbon: published.hyRibbon as NonNullable<typeof item.chrome>["hyRibbon"] } } : item))
                  }));
                  design.noteDraft();
                })
              }
            >
              取回窗口参数
            </Button>
          </div>
        )}
      </Section>
    </div>
  );
}

function sidebarOf() {
  const layout = design.get().doc.config.layout;
  return {
    leftWidth: layout.primarySideBar.visible ? layout.primarySideBar.width : 0,
    rightWidth: layout.auxiliaryBar.visible ? layout.auxiliaryBar.width : 0
  };
}
