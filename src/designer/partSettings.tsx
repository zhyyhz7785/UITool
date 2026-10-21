import { colorRegistry, partColorPrefixes } from "@tpl/theme/registry";
import { resolveColors } from "@tpl/theme/resolve";
import { findTheme } from "@tpl/theme/themes";
import { IconButton } from "@tpl/workbench/ui";
import type { LayoutConfig, PartId } from "@tpl/workbench/types";
import { newRow } from "@tpl/workbench/migrate";
import { useMemo, useState } from "react";
import { ColorInput, Field, NumberField, Section, Segmented, ToggleField } from "./controls";
import { allThemes, design, useDesign } from "./store";

export const PART_NAMES: Record<PartId, string> = {
  titlebar: "标题栏",
  toolbar: "主工具栏",
  activitybar: "活动栏",
  sidebar: "主侧栏",
  editor: "编辑区",
  panel: "面板",
  auxiliarybar: "辅助侧栏",
  statusbar: "状态栏"
};

export const PART_ORDER: PartId[] = ["titlebar", "toolbar", "activitybar", "sidebar", "editor", "panel", "auxiliarybar", "statusbar"];

type ObjectLayoutKey = { [K in keyof LayoutConfig]-?: LayoutConfig[K] extends object ? K : never }[keyof LayoutConfig];

function setLayout<K extends ObjectLayoutKey>(k: K, v: Partial<LayoutConfig[K]>, coalesce?: string) {
  design.setConfig((c) => ({ ...c, layout: { ...c.layout, [k]: { ...c.layout[k], ...v } } }), coalesce);
}
function setRows(which: "top" | "side", count: number) {
  design.setConfig((c) => {
    const bar = c.layout.toolbars[which];
    const rows = [...bar.rows];
    while (rows.length < count) rows.push(newRow(`row-${rows.length + 1}`));
    return { ...c, layout: { ...c.layout, toolbars: { ...c.layout.toolbars, [which]: { ...bar, rows: rows.slice(0, count) } } } };
  });
}

/** 某个部件的布局。只放显隐、位置、尺寸、排数、对齐，不放按钮和菜单。 */
export function PartLayout({ part }: { part: PartId }) {
  const c = useDesign((s) => s.doc.config);
  const L = c.layout;
  switch (part) {
    case "titlebar":
      return (
        <>
          <Field label="样式">
            <Segmented value={L.titleBar.style} options={[{ value: "custom", label: "自绘" }, { value: "native", label: "系统" }]} onChange={(style) => setLayout("titleBar", { style })} />
          </Field>
          <Field label="菜单">
            <Segmented value={L.titleBar.menu} options={[{ value: "inline", label: "内嵌" }, { value: "ownrow", label: "单独一行" }, { value: "hidden", label: "隐藏" }]} onChange={(menu) => setLayout("titleBar", { menu })} />
          </Field>
          <ToggleField label="应用图标" checked={L.titleBar.appIcon} onChange={(appIcon) => setLayout("titleBar", { appIcon })} />
          <ToggleField label="命令中心" checked={L.titleBar.commandCenter} onChange={(commandCenter) => setLayout("titleBar", { commandCenter })} hint="标题栏中间的搜索框，点开命令面板" />
          <div className="ut-note">高度固定 28px（hy 硬规则 HR3）。左右按钮在预览里点选后，于属性栏编辑。</div>
        </>
      );
    case "toolbar":
      return (
        <>
          <ToggleField label="上侧" checked={L.toolbars.top.visible} onChange={(visible) => design.setConfig((x) => ({ ...x, layout: { ...x.layout, toolbars: { ...x.layout.toolbars, top: { ...x.layout.toolbars.top, visible } } } }))} />
          <Field label="上侧排数">
            <NumberField value={L.toolbars.top.rows.length} min={0} max={6} onChange={(n) => setRows("top", n)} />
          </Field>
          <Field label="上侧样式">
            <Segmented
              value={L.toolbars.top.style ?? "icon"}
              options={[{ value: "icon", label: "图标" }, { value: "labeled", label: "带文字" }, { value: "ribbon", label: "功能区" }]}
              onChange={(style) => design.setConfig((x) => ({ ...x, layout: { ...x.layout, toolbars: { ...x.layout.toolbars, top: { ...x.layout.toolbars.top, style } } } }))}
            />
          </Field>
          <ToggleField label="侧面" checked={L.toolbars.side.visible} onChange={(visible) => design.setConfig((x) => ({ ...x, layout: { ...x.layout, toolbars: { ...x.layout.toolbars, side: { ...x.layout.toolbars.side, visible } } } }))} />
          <Field label="侧面位置">
            <Segmented value={L.toolbars.side.position} options={[{ value: "left", label: "左" }, { value: "right", label: "右" }]} onChange={(position) => design.setConfig((x) => ({ ...x, layout: { ...x.layout, toolbars: { ...x.layout.toolbars, side: { ...x.layout.toolbars.side, position } } } }))} />
          </Field>
          <Field label="侧面排数">
            <NumberField value={L.toolbars.side.rows.length} min={0} max={6} onChange={(n) => setRows("side", n)} />
          </Field>
          <div className="ut-note">上侧和侧面可以同时开。只开一处时，Ctrl+Shift+T 把整条移到另一侧（HR1）。每排的按钮在预览里点选后编辑。</div>
        </>
      );
    case "activitybar":
      return (
        <>
          <ToggleField label="显示" checked={L.activityBar.visible} onChange={(visible) => setLayout("activityBar", { visible })} />
          <Field label="位置">
            <Segmented value={L.activityBar.position} options={[{ value: "side", label: "侧边" }, { value: "top", label: "侧栏顶部" }]} onChange={(position) => setLayout("activityBar", { position })} />
          </Field>
          <div className="ut-note">条目、底部按钮在预览里点活动栏后，于属性栏编辑。</div>
        </>
      );
    case "sidebar":
      return (
        <>
          <ToggleField label="显示" checked={L.primarySideBar.visible} onChange={(visible) => setLayout("primarySideBar", { visible })} />
          <Field label="位置">
            <Segmented value={L.primarySideBar.position} options={[{ value: "left", label: "左" }, { value: "right", label: "右" }]} onChange={(position) => setLayout("primarySideBar", { position })} />
          </Field>
          <Field label="宽度">
            <NumberField value={L.primarySideBar.width} min={160} max={640} onChange={(width) => setLayout("primarySideBar", { width }, "sidebar.width")} />
          </Field>
          <div className="ut-note">宽度也可以直接拖预览里的分割条。分区在属性栏编辑。</div>
        </>
      );
    case "auxiliarybar":
      return (
        <>
          <ToggleField label="显示" checked={L.auxiliaryBar.visible} onChange={(visible) => setLayout("auxiliaryBar", { visible })} />
          <Field label="宽度">
            <NumberField value={L.auxiliaryBar.width} min={160} max={640} onChange={(width) => setLayout("auxiliaryBar", { width }, "aux.width")} />
          </Field>
          <div className="ut-note">页签和分区在属性栏编辑。</div>
        </>
      );
    case "editor":
      return (
        <>
          <ToggleField label="页签" checked={L.editor.tabs} onChange={(tabs) => setLayout("editor", { tabs })} />
          <ToggleField label="面包屑" checked={L.editor.breadcrumbs} onChange={(breadcrumbs) => setLayout("editor", { breadcrumbs })} />
          <div className="ut-note">页签右侧、面包屑右侧的按钮，在预览里点选后于属性栏编辑。</div>
        </>
      );
    case "panel":
      return (
        <>
          <ToggleField label="显示" checked={L.panel.visible} onChange={(visible) => setLayout("panel", { visible })} />
          <Field label="位置">
            <Segmented value={L.panel.position} options={[{ value: "bottom", label: "底部" }, { value: "right", label: "右侧" }]} onChange={(position) => setLayout("panel", { position })} />
          </Field>
          <Field label={L.panel.position === "bottom" ? "高度" : "宽度"}>
            <NumberField value={L.panel.size} min={80} max={900} onChange={(size) => setLayout("panel", { size }, "panel.size")} />
          </Field>
          {L.panel.position === "bottom" && (
            <Field label="对齐">
              <Segmented value={L.panel.align} options={[{ value: "center", label: "居中" }, { value: "justify", label: "拉通" }, { value: "left", label: "靠左" }, { value: "right", label: "靠右" }]} onChange={(align) => setLayout("panel", { align })} />
            </Field>
          )}
          <div className="ut-note">拉通时面板铺满整窗宽度。页签和按钮在属性栏编辑。</div>
        </>
      );
    case "statusbar":
      return (
        <>
          <ToggleField label="显示" checked={L.statusBar.visible} onChange={(visible) => setLayout("statusBar", { visible })} />
          <div className="ut-note">左、中、右三个区的按钮，在预览里点选后于属性栏编辑。</div>
        </>
      );
  }
}

/** 某个部件相关的颜色键（等同 VSCode 的 workbench.colorCustomizations）。 */
export function PartColors({ part, filter }: { part?: PartId; filter?: string }) {
  const doc = useDesign((s) => s.doc);
  const sel = doc.config.theme;
  const theme = findTheme(allThemes(doc), sel.id);
  const resolved = useMemo(() => resolveColors(theme, sel), [theme, sel]);
  const [onlyChanged, setOnlyChanged] = useState(false);
  const prefixes = part ? partColorPrefixes[part] : null;
  const q = (filter ?? "").trim().toLowerCase();
  const keys = colorRegistry.filter(
    (k) =>
      (!prefixes || prefixes.some((p) => k.id.startsWith(p))) &&
      (!q || k.id.toLowerCase().includes(q) || k.desc.includes(filter!.trim())) &&
      (!onlyChanged || k.id in sel.overrides)
  );
  const setOverride = (key: string, value: string | null) =>
    design.setConfig((c) => {
      const overrides = { ...c.theme.overrides };
      if (value == null) delete overrides[key];
      else overrides[key] = value;
      return { ...c, theme: { ...c.theme, overrides } };
    }, value == null ? undefined : "color:" + key);

  let group = "";
  return (
    <div className="ut-colors">
      {!part && (
        <label className="ut-check">
          <input type="checkbox" checked={onlyChanged} onChange={(e) => setOnlyChanged(e.target.checked)} /> 只看已改（{Object.keys(sel.overrides).length}）
        </label>
      )}
      {keys.map((k) => {
        const head = !part && k.group !== group ? ((group = k.group), <div key={"g" + k.group} className="ut-color-group">{k.group}</div>) : null;
        const changed = k.id in sel.overrides;
        return (
          <div key={k.id}>
            {head}
            <div className={"ut-color-row" + (changed ? " changed" : "")}>
              <div className="ut-color-name" title={k.id}>
                <span>{k.desc}</span>
                <code>{k.id}</code>
              </div>
              <ColorInput value={resolved[k.id]} onChange={(v) => setOverride(k.id, v)} />
              <IconButton icon="undo2" title="恢复主题值" size={13} disabled={!changed} style={{ visibility: changed ? "visible" : "hidden" }} onClick={() => setOverride(k.id, null)} />
            </div>
          </div>
        );
      })}
      {keys.length === 0 && <div className="ut-note">没有匹配的颜色键。</div>}
    </div>
  );
}

export function PartPanel({ part }: { part: PartId }) {
  return (
    <>
      <Section title="布局与内容">
        <PartLayout part={part} />
      </Section>
      <Section title="颜色" defaultOpen>
        <PartColors part={part} />
      </Section>
    </>
  );
}
