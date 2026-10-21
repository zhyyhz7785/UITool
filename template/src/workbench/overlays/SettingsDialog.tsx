import { useState, type ReactNode } from "react";
import { themeSwatches } from "../../theme/resolve";
import { accentChoices } from "../../theme/themes";
import { useWorkbench } from "../context";
import { switchScheme, TIER_NAME } from "../schemes";
import type { LayoutConfig } from "../types";
import { Button, Select, Toggle } from "../ui";
import { Dialog } from "./Dialog";

/** 设置：外观（主题、强调色、密度）与布局开关。改动即时生效并写回配置。 */
export function SettingsDialog() {
  const wb = useWorkbench();
  const c = wb.config;
  const [tab, setTab] = useState<"look" | "layout">("look");
  const setLayout = <K extends { [P in keyof LayoutConfig]-?: LayoutConfig[P] extends object ? P : never }[keyof LayoutConfig]>(k: K, v: Partial<LayoutConfig[K]>) =>
    wb.updateConfig((x) => ({ ...x, layout: { ...x.layout, [k]: { ...x.layout[k], ...v } } }));

  return (
    <Dialog title="设置" width={640} footer={<Button primary onClick={() => wb.openDialog(null)}>完成</Button>}>
      <div className="wb-settings">
        <nav className="wb-settings-nav">
          <button type="button" className={tab === "look" ? "active" : ""} onClick={() => setTab("look")}>
            外观
          </button>
          <button type="button" className={tab === "layout" ? "active" : ""} onClick={() => setTab("layout")}>
            布局
          </button>
        </nav>
        <div className="wb-settings-body">
          {tab === "look" ? (
            <>
              <h4>颜色主题</h4>
              <div className="wb-theme-grid">
                {wb.themes.map((t) => (
                  <button key={t.id} type="button" className={"wb-theme-card" + (t.id === c.theme.id ? " active" : "")} onClick={() => wb.updateConfig((x) => ({ ...x, theme: { ...x.theme, id: t.id } }))}>
                    <span className="wb-swatches">
                      {themeSwatches(t, c.theme.accent).map((s, i) => (
                        <i key={i} style={{ background: s }} />
                      ))}
                    </span>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
              <h4>强调色</h4>
              <div className="wb-accents">
                <button type="button" className={"wb-accent none" + (!c.theme.accent ? " active" : "")} title="跟随主题" onClick={() => wb.updateConfig((x) => ({ ...x, theme: { ...x.theme, accent: null } }))} />
                {accentChoices.map((a) => (
                  <button key={a} type="button" className={"wb-accent" + (c.theme.accent === a ? " active" : "")} style={{ background: a }} title={a} onClick={() => wb.updateConfig((x) => ({ ...x, theme: { ...x.theme, accent: a } }))} />
                ))}
              </div>
              <h4>密度</h4>
              <Select
                value={c.density}
                options={[
                  { value: "compact", label: "紧凑" },
                  { value: "comfortable", label: "舒适" }
                ]}
                onChange={(density) => wb.updateConfig((x) => ({ ...x, density }))}
              />
            </>
          ) : (
            <div className="wb-settings-rows">
              <Row label="活动栏">
                <Toggle checked={c.layout.activityBar.visible} onChange={(visible) => setLayout("activityBar", { visible })} />
                <Select value={c.layout.activityBar.position} options={[{ value: "side", label: "侧边" }, { value: "top", label: "侧栏顶部" }]} onChange={(position) => setLayout("activityBar", { position })} />
              </Row>
              <Row label="主侧栏">
                <Toggle checked={c.layout.primarySideBar.visible} onChange={(visible) => setLayout("primarySideBar", { visible })} />
                <Select value={c.layout.primarySideBar.position} options={[{ value: "left", label: "左" }, { value: "right", label: "右" }]} onChange={(position) => setLayout("primarySideBar", { position })} />
              </Row>
              <Row label="辅助侧栏">
                <Toggle checked={c.layout.auxiliaryBar.visible} onChange={(visible) => setLayout("auxiliaryBar", { visible })} />
              </Row>
              <Row label="面板">
                <Toggle checked={c.layout.panel.visible} onChange={(visible) => setLayout("panel", { visible })} />
                <Select value={c.layout.panel.position} options={[{ value: "bottom", label: "底部" }, { value: "right", label: "右侧" }]} onChange={(position) => setLayout("panel", { position })} />
                <Select value={c.layout.panel.align} options={[{ value: "center", label: "居中" }, { value: "justify", label: "拉通" }, { value: "left", label: "靠左" }, { value: "right", label: "靠右" }]} onChange={(align) => setLayout("panel", { align })} />
              </Row>
              <Row label="上侧工具栏">
                <Toggle checked={c.layout.toolbars.top.visible} onChange={(visible) => wb.updateConfig((x) => ({ ...x, layout: { ...x.layout, toolbars: { ...x.layout.toolbars, top: { ...x.layout.toolbars.top, visible } } } }))} />
              </Row>
              <Row label="侧面工具栏">
                <Toggle checked={c.layout.toolbars.side.visible} onChange={(visible) => wb.updateConfig((x) => ({ ...x, layout: { ...x.layout, toolbars: { ...x.layout.toolbars, side: { ...x.layout.toolbars.side, visible } } } }))} />
                <Select value={c.layout.toolbars.side.position} options={[{ value: "left", label: "左" }, { value: "right", label: "右" }]} onChange={(position) => wb.updateConfig((x) => ({ ...x, layout: { ...x.layout, toolbars: { ...x.layout.toolbars, side: { ...x.layout.toolbars.side, position } } } }))} />
              </Row>
              <Row label="状态栏">
                <Toggle checked={c.layout.statusBar.visible} onChange={(visible) => setLayout("statusBar", { visible })} />
              </Row>
              <Row label="编辑器页签">
                <Toggle checked={c.layout.editor.tabs} onChange={(tabs) => setLayout("editor", { tabs })} />
              </Row>
              {(c.schemes?.length ?? 0) > 0 && (
                <Row label="界面方案">
                  <Select
                    value={c.scheme ?? c.schemes![0].id}
                    options={c.schemes!.map((s) => ({ value: s.id, label: `${s.name}（${TIER_NAME[s.tier]}）` }))}
                    onChange={(id) => wb.updateConfig((x) => switchScheme(x, id, "session"))}
                  />
                </Row>
              )}
              <Row label="面包屑">
                <Toggle checked={c.layout.editor.breadcrumbs} onChange={(breadcrumbs) => setLayout("editor", { breadcrumbs })} />
              </Row>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="wb-settings-row">
      <span className="wb-settings-label">{label}</span>
      <div className="wb-settings-ctl">{children}</div>
    </div>
  );
}
