import { Icon } from "@tpl/icons/Icon";
import { builtinCommands } from "@tpl/workbench/commands";
import type { CommandDef, DialogAction, DialogDef, DialogField, DialogKind, DialogStyle, MenuItem, MenuSwatch, PaneTab, SideContainer, SidePageDef, SidePageItem, SidePageRegion, ToolGroup, ToolItem, ToolSlot, ViewSection } from "@tpl/workbench/types";
import { ICON_AREAS, ICON_STYLES } from "@tpl/workbench/types";
import { Button, Select } from "@tpl/workbench/ui";
import { useState } from "react";
import { commandCatalog } from "./commandCatalog";
import { ChipList, Field, IconPicker, ListEditor, Section, Segmented, TextField, ToggleField, type Column } from "./controls";
import { AppIconEditor, ContainerHeadEditor, ItemDetail, MultiPanel, Split, WinEditor, ZoneChips } from "./editDetail";
import { describe } from "./merge";
import { PART_NAMES, PartColors, PartLayout } from "./partSettings";
import { design, useDesign, type Selection } from "./store";
import { viewOptions } from "./viewOptions";
import { containersOf, findMenu, findSection, locateSlot, mapContainer, mapSection, nid, orderById, setContainers, setZoneItems, siblingZones, zoneItems } from "./zones";

const TABS = ["布局", "内容", "颜色", "图标"] as const;

const KIND_OPTIONS: { value: DialogKind; label: string }[] = [
  { value: "form", label: "表单" },
  { value: "menu", label: "菜单" },
  { value: "list", label: "列表" },
  { value: "banner", label: "提示条" },
  { value: "system", label: "系统框" }
];

const STYLE_OPTIONS: { value: "" | DialogStyle; label: string }[] = [
  { value: "", label: "跟随方案" },
  { value: "modal", label: "模态" },
  { value: "sheet", label: "抽屉" },
  { value: "wizard", label: "向导" }
];

const FIELD_TYPES: { value: DialogField["type"]; label: string }[] = [
  { value: "text", label: "文本" },
  { value: "number", label: "数字" },
  { value: "select", label: "下拉" },
  { value: "toggle", label: "开关" },
  { value: "color", label: "颜色" },
  { value: "table", label: "表格" }
];

function patchSidePage(id: string, patch: Partial<SidePageDef>, coalesce?: string) {
  design.setConfig(
    (c) => ({ ...c, sidePages: c.sidePages?.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),
    coalesce
  );
}

function patchRegion(page: SidePageDef, regionId: string, patch: Partial<SidePageRegion>) {
  patchSidePage(page.id, { regions: page.regions.map((r) => (r.id === regionId ? { ...r, ...patch } : r)) });
}

/** 点中一页副页面后的检查器。属性改标题，内容改各分区的条目。 */
function SidePageInspector({ id, page }: { id: string; page?: SidePageDef }) {
  const [tab, setTab] = useState<"属性" | "内容">("属性");
  if (!page) {
    return (
      <div className="ut-view">
        <div className="ut-pad ut-note">这一页不在当前设计里。用「连接」再读一次 HyMd。</div>
        <div className="ut-pad">
          <Button onClick={() => design.selectSidePage(null)}>关闭</Button>
        </div>
      </div>
    );
  }
  return (
    <div className={"ut-view" + (tab === "内容" ? " ut-view-fill" : "")}>
      <div className="ut-prop-head">
        <span className="ut-crumb cur">{page.title}</span>
        <span className="ut-grow" />
        <Button onClick={() => design.selectSidePage(null)}>取消</Button>
      </div>
      <div className="ut-tabs">
        {(["属性", "内容"] as const).map((t) => (
          <button key={t} type="button" className={t === tab ? "on" : ""} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className={tab === "内容" ? "ut-fill" : "ut-pad"}>
        {tab === "属性" && (
          <>
            <Field label="标题">
              <TextField value={page.title} onChange={(title) => patchSidePage(id, { title }, "page-title")} />
            </Field>
            <div className="ut-note">来源 {page.source}</div>
            <div className="ut-note">标识 {page.id}</div>
          </>
        )}
        {tab === "内容" &&
          page.regions.map((region) => (
            <div key={region.id}>
              <Field label="分区">
                <TextField value={region.title} onChange={(title) => patchRegion(page, region.id, { title })} />
              </Field>
              <ListEditor<SidePageItem>
                items={region.items}
                addLabel="添加条目"
                create={() => ({ id: nid("i"), label: "条目" })}
                onChange={(items) => patchRegion(page, region.id, { items })}
                columns={[{ key: "label", label: region.title }]}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

function patchDialog(id: string, patch: Partial<DialogDef>, coalesce?: string) {
  design.setConfig(
    (c) => ({ ...c, dialogs: c.dialogs?.map((d) => (d.id === id ? { ...d, ...patch } : d)) }),
    coalesce
  );
}

/** 点中一条弹窗后的属性检查器。属性改标题和呈现，内容改字段和按钮。 */
function DialogInspector({ id, def }: { id: string; def?: DialogDef }) {
  const [tab, setTab] = useState<"属性" | "内容">("属性");
  if (!def) {
    return (
      <div className="ut-view">
        <div className="ut-pad ut-note">这条窗口不在当前设计里。</div>
        <div className="ut-pad">
          <Button onClick={() => design.selectDialog(null)}>关闭</Button>
        </div>
      </div>
    );
  }
  const kind = def.kind ?? "form";
  const showFields = kind === "form" || kind === "system";
  return (
    <div className={"ut-view" + (tab === "内容" ? " ut-view-fill" : "")}>
      <div className="ut-prop-head">
        <span className="ut-crumb cur">{def.title}</span>
        <span className="ut-grow" />
        <Button onClick={() => design.selectDialog(null)}>取消</Button>
      </div>
      <div className="ut-tabs">
        {(["属性", "内容"] as const).map((t) => (
          <button key={t} type="button" className={t === tab ? "on" : ""} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className={tab === "内容" ? "ut-fill" : "ut-pad"}>
        {tab === "属性" && (
          <>
            <Field label="标题">
              <TextField value={def.title} onChange={(title) => patchDialog(id, { title }, "dialog-title")} />
            </Field>
            <Field label="命令" hint="列表专用命令以 hymd.dialog. 或 hy3d.dialog. 开头，不进菜单">
              <TextField mono value={def.command} onChange={(command) => patchDialog(id, { command }, "dialog-command")} />
            </Field>
            <Field label="种类">
              <Select value={kind} options={KIND_OPTIONS} onChange={(next) => patchDialog(id, { kind: next === "form" ? undefined : next })} />
            </Field>
            <Field label="呈现" hint="跟随方案时用左侧「呈现」里这一套的默认">
              <Select value={def.style ?? ""} options={STYLE_OPTIONS} onChange={(style) => patchDialog(id, { style: style || undefined })} />
            </Field>
            <Field label="分组" hint="向导按这个分步。用逗号分开">
              <TextField value={def.groups?.join("，") ?? ""} placeholder="例如 基本，页面" onChange={(text) => patchDialog(id, { groups: text.split(/[,，]/).map((s) => s.trim()).filter(Boolean) }, "dialog-groups")} />
            </Field>
            <Field label="文件夹" hint="弹窗列表里的分组">
              <TextField value={def.folder ?? ""} placeholder="对话框" onChange={(folder) => patchDialog(id, { folder: folder || undefined }, "dialog-folder")} />
            </Field>
            <Field label="正文">
              <textarea className="wb-input ut-area" value={def.body ?? ""} onChange={(e) => patchDialog(id, { body: e.target.value || undefined }, "dialog-body")} />
            </Field>
            {def.source && <div className="ut-note">来源 {def.source}</div>}
            <div className="ut-note">标识 {def.id}</div>
          </>
        )}
        {tab === "内容" && (
          <>
            {showFields && (
              <>
                <div className="ut-sub">字段</div>
                <ListEditor<DialogField>
                  items={def.fields}
                  addLabel="添加字段"
                  create={() => ({ id: nid("f"), label: "字段", type: "text" })}
                  onChange={(fields) => patchDialog(id, { fields })}
                  columns={[
                    { key: "label", label: "标签", width: 88 },
                    { key: "id", label: "标识", width: 72 },
                    { key: "type", label: "类型", type: "select", options: FIELD_TYPES, width: 72 },
                    { key: "group", label: "分组", width: 64 }
                  ]}
                />
              </>
            )}
            <div className="ut-sub">按钮</div>
            <ListEditor<DialogAction>
              items={def.actions}
              addLabel="添加按钮"
              create={() => ({ id: nid("a"), label: "按钮" })}
              onChange={(actions) => patchDialog(id, { actions })}
              columns={[
                { key: "label", label: "文字" },
                { key: "id", label: "标识", width: 72 },
                { key: "primary", label: "主按钮", type: "check", width: 36 },
                { key: "separator", label: "分隔", type: "check", width: 36 }
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}

export function PropertiesView() {
  const pageId = useDesign((s) => s.pageId);
  const sidePages = useDesign((s) => s.doc.config.sidePages);
  const dialogId = useDesign((s) => s.dialogId);
  const dialogs = useDesign((s) => s.doc.config.dialogs);
  const selected = useDesign((s) => s.selected);
  const multi = useDesign((s) => s.multi);
  const config = useDesign((s) => s.doc.config);
  const [tab, setTab] = useState<(typeof TABS)[number]>("内容");
  if (pageId) return <SidePageInspector id={pageId} page={sidePages?.find((p) => p.id === pageId)} />;
  if (dialogId) return <DialogInspector id={dialogId} def={dialogs?.find((d) => d.id === dialogId)} />;
  if (!selected)
    return (
      <div className="ut-view">
        <div className="ut-pad ut-note">单击预览确认一块区域。Ctrl 添加，Shift 减少。同宽或同高的可以多选后合并。</div>
        <div className="ut-partlist">
          {Object.entries(PART_NAMES).map(([id, name]) => (
            <button key={id} type="button" onClick={() => design.select({ part: id as Selection["part"] })}>
              <Icon name="pointer" size={13} /> {name}
            </button>
          ))}
        </div>
      </div>
    );
  const { part, zone, item, sub } = selected;
  const fill = tab === "内容";
  const up = () => {
    if (multi.length >= 2) {
      design.clearMulti();
      return;
    }
    design.select(sub ? { part, zone, item } : item ? { part, zone } : zone ? { part } : null);
  };
  return (
    <div className={"ut-view" + (fill ? " ut-view-fill" : "")}>
      <div className="ut-prop-head">
        <button type="button" className="ut-crumb" onClick={() => design.select({ part })}>
          {PART_NAMES[part]}
        </button>
        {zone && (
          <button type="button" className="ut-crumb" onClick={() => design.select({ part, zone })}>
            {zoneLabel(zone)}
          </button>
        )}
        {multi.length >= 2 ? <span className="ut-crumb cur">多选 {multi.length}</span> : item && <span className="ut-crumb cur">{describe(config, selected)}{sub === "icon" ? " · 图标" : sub === "text" ? " · 文字" : ""}</span>}
        <span className="ut-grow" />
        <Button onClick={up}>{multi.length >= 2 ? "取消多选" : item || zone || sub ? "上一级" : "取消"}</Button>
      </div>
      <div className="ut-tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={t === tab ? "on" : ""} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className={fill ? "ut-fill" : "ut-pad"}>
        {tab === "布局" && <PartLayout part={part} />}
        {tab === "内容" && <Content selected={selected} />}
        {tab === "颜色" && <PartColors part={part} />}
        {tab === "图标" && <AreaStyle part={part} />}
      </div>
    </div>
  );
}

function zoneLabel(zone: string): string {
  const known: Record<string, string> = {
    "title-left": "左侧按钮",
    "title-right": "右侧按钮",
    "title-center": "命令中心",
    appicon: "应用图标",
    winctl: "窗口按钮",
    menus: "菜单",
    "activity-items": "条目",
    "activity-bottom": "底部按钮",
    "activity-top": "顶部图标",
    "tab-actions": "页签右侧",
    "crumb-actions": "面包屑右侧",
    tabs: "页签",
    breadcrumbs: "面包屑",
    "panel-tabs": "页签",
    "panel-actions": "标题按钮",
    "status:start": "左区",
    "status:center": "中区",
    "status:end": "右区"
  };
  if (known[zone]) return known[zone];
  if (zone.startsWith("menu:")) return "菜单";
  if (zone.startsWith("sec:")) return "分区";
  if (zone.includes(":header")) return "标题栏";
  if (zone.startsWith("tbg:")) return "面板";
  if (zone.startsWith("tb:")) return zone.endsWith(":start") ? "左 / 上" : zone.endsWith(":end") ? "右 / 下" : zone.endsWith(":center") ? "中间" : "一排";
  return zone;
}

function itemInZone(c: Parameters<typeof zoneItems>[0], zone: string, item: string) {
  if (item.endsWith("#head")) return false;
  if ((zoneItems(c, zone) ?? []).some((x) => x.id === item)) return true;
  return !!locateSlot(c, zone, item);
}

function Content({ selected }: { selected: Selection }) {
  const multi = useDesign((s) => s.multi);
  const c = useDesign((s) => s.doc.config);
  const { part, zone, item, sub } = selected;
  if (multi.length >= 2) return <MultiPanel items={multi} />;
  if (zone === "winctl") return <WinEditor focus={item} />;
  if (zone === "appicon") return <AppIconEditor sub={sub} />;
  if (zone === "title-center") return <CenterEditor item={item} sub={sub} />;
  if (zone === "menus") return <MenusOverview />;
  if (part === "titlebar" && !zone) {
    return (
      <>
        <MenusOverview />
        <div className="ut-sub">其它区域</div>
        <ZonesOverview zones={["title-left", "title-center", "title-right", "appicon", "winctl"]} labels={["左侧按钮", "中间", "右侧按钮", "应用图标", "窗口按钮"]} />
      </>
    );
  }
  if (zone?.startsWith("menu:")) {
    return <Split top={<MenusOverview />} bottom={<MenuEditor zone={zone} itemId={item} sub={sub} />} />;
  }
  if (zone?.startsWith("sec:")) {
    const section = findSection(c, zone.slice(4));
    if (!section) return <div className="ut-note">分区不存在。</div>;
    if (item && itemInZone(c, zone, item)) return <Split top={<ZoneChips zone={zone} />} bottom={<ItemDetail zone={zone} itemId={item} sub={sub} />} />;
    return <SectionEditor id={zone.slice(4)} section={section} sub={item?.endsWith("#head") ? sub : undefined} />;
  }
  if (zone?.startsWith("side:") && zone.endsWith(":header") && item && !itemInZone(c, zone, item)) {
    const id = /^side:([^:]+):header$/.exec(zone)?.[1];
    if (id) return <ContainerHeadEditor id={id} sub={sub} />;
  }
  if (zone?.startsWith("tbg:") && item && itemInZone(c, zone, item)) return <Split top={<ZoneChips zone={zone} />} bottom={<ItemDetail zone={zone} itemId={item} sub={sub} />} />;
  if (zone?.startsWith("tbg:")) return <GroupEditor zone={zone} />;
  if (item && zone && itemInZone(c, zone, item)) return <Split top={<ZoneChips zone={zone} />} bottom={<ItemDetail zone={zone} itemId={item} sub={sub} />} />;
  if (zone && zoneItems(c, zone)) return <ItemListEditor zone={zone} />;
  if (part === "statusbar" && !zone) return <ZonesOverview zones={["status:start", "status:center", "status:end"]} labels={["左区", "中区", "右区"]} />;
  if (part === "toolbar") return <ToolbarOverview />;
  if (part === "sidebar" || part === "auxiliarybar") return <SideOverview part={part} zone={zone} item={item} />;
  if (part === "activitybar") return <ActivityOverview item={item} sub={sub} />;
  if (part === "panel") return <PanelOverview item={zone === "panel-tabs" ? item : undefined} sub={zone === "panel-tabs" ? sub : undefined} />;
  if (part === "editor") return <EditorOverview item={zone === "tabs" ? item : undefined} sub={zone === "tabs" ? sub : undefined} />;
  if (part === "titlebar") return <ZonesOverview zones={["title-left", "title-center", "title-right"]} labels={["左侧按钮", "中间", "右侧按钮"]} />;
  return <div className="ut-note">点预览里的具体区域来编辑按钮。</div>;
}

function CenterEditor({ item, sub }: { item?: string; sub?: "icon" | "text" }) {
  const c = useDesign((s) => s.doc.config);
  const T = c.layout.titleBar;
  const real = !!item && item !== "command-center" && item !== "title-text" && (T.center ?? []).some((x) => x.id === item);
  const settings = (
    <>
      <ToggleField label="命令中心" checked={T.commandCenter} onChange={(commandCenter) => design.setConfig((cfg) => ({ ...cfg, layout: { ...cfg.layout, titleBar: { ...cfg.layout.titleBar, commandCenter } } }))} hint="标题栏中间的搜索框，点开命令面板" />
      <ToggleField label="搜索框" checked={!!T.search} onChange={(search) => design.setConfig((cfg) => ({ ...cfg, layout: { ...cfg.layout, titleBar: { ...cfg.layout.titleBar, search } } }))} hint="标题栏右侧的搜索框，和命令中心分开" />
      <div className={item === "title-text" && sub === "text" ? "ut-focus" : undefined}>
        <Field label="标题文字">
          <TextField value={T.titleText ?? ""} placeholder="留空用默认。{app} 应用名，{doc} 文档名" onChange={(titleText) => design.setConfig((cfg) => ({ ...cfg, layout: { ...cfg.layout, titleBar: { ...cfg.layout.titleBar, titleText: titleText || undefined } } }), "title-text")} />
        </Field>
      </div>
      {item === "command-center" && sub === "icon" && <div className="ut-note">命令中心的图标固定是搜索。</div>}
    </>
  );
  if (real && item) return <Split top={<><div className="ut-sub">中间</div>{settings}<ZoneChips zone="title-center" /></>} bottom={<ItemDetail zone="title-center" itemId={item} sub={sub} />} />;
  return (
    <div>
      {settings}
      <div className="ut-sub">中间按钮</div>
      <ItemListEditor zone="title-center" />
    </div>
  );
}

function ItemListEditor({ zone }: { zone: string }) {
  const c = useDesign((s) => s.doc.config);
  const items = zoneItems(c, zone) ?? [];
  const set = (next: ToolItem[]) => design.setConfig((cfg) => setZoneItems(cfg, zone, next));
  const options = commandOptions(c);
  const part = design.get().selected?.part ?? "statusbar";
  const columns: Column<ToolItem>[] = [
    { key: "icon", label: "图标", type: "icon", width: 42 },
    { key: "text", label: "文字", width: 72 },
    { key: "command", label: "命令", type: "select", options }
  ];
  const siblings = siblingZones(zone).filter((z) => z.id !== zone);
  return (
    <div>
      {items.length > 1 && (
        <ChipList
          items={items.map((it) => ({ id: it.id, label: it.separator ? "分隔" : it.text || it.tooltip || it.command || "按钮" }))}
          onSelect={(id) => design.select({ part, zone, item: id })}
          onReorder={(ids) => set(orderById(items, ids))}
        />
      )}
      <ListEditor items={items} columns={columns} onChange={set} create={() => ({ id: nid("btn"), icon: "play" })} addLabel="空按钮" />
      <AddFromCatalog
        onPick={(cmd) =>
          design.setConfig((cfg) => {
            const withCmd = cfg.commands.some((x) => x.id === cmd.id) ? cfg : { ...cfg, commands: [...cfg.commands, cmd] };
            return setZoneItems(withCmd, zone, [...(zoneItems(withCmd, zone) ?? []), { id: nid("btn"), command: cmd.id, icon: cmd.icon, tooltip: cmd.title }]);
          })
        }
      />
      {siblings.length > 0 && items.length > 0 && (
        <div className="ut-note">
          把最后一项移到
          {siblings.map((z) => (
            <button key={z.id} type="button" className="ut-link" onClick={() => moveLast(zone, z.id)}>
              {z.label}
            </button>
          ))}
        </div>
      )}
      <div className="ut-note">再点一次预览里的按钮，可以改这一项的图标风格。</div>
    </div>
  );
}

function moveLast(from: string, to: string) {
  design.setConfig((c) => {
    const items = zoneItems(c, from) ?? [];
    const item = items[items.length - 1];
    if (!item) return c;
    const next = setZoneItems(c, from, items.slice(0, -1));
    return setZoneItems(next, to, [...(zoneItems(next, to) ?? []), item]);
  });
}

function AddFromCatalog({ onPick }: { onPick: (cmd: (typeof commandCatalog)[number]) => void }) {
  const [cat, setCat] = useState(commandCatalog[0].category);
  const list = commandCatalog.filter((c) => c.category === cat);
  return (
    <div className="ut-row">
      <select className="wb-select" value={cat} onChange={(e) => setCat(e.target.value)}>
        {[...new Set(commandCatalog.map((c) => c.category))].map((g) => (
          <option key={g}>{g}</option>
        ))}
      </select>
      <select className="wb-select ut-grow" onChange={(e) => { const cmd = list.find((c) => c.id === e.target.value); if (cmd) onPick(cmd); e.currentTarget.value = ""; }}>
        <option value="">添加命令…</option>
        {list.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
    </div>
  );
}

function commandOptions(c: { commands: { id: string; title: string }[] }) {
  const seen = new Set<string>();
  const out = [{ value: "", label: "（无命令）" }];
  for (const cmd of [...c.commands, ...commandCatalog, ...Object.entries(builtinCommands).map(([id, b]) => ({ id, title: b.title }))]) {
    if (seen.has(cmd.id)) continue;
    seen.add(cmd.id);
    out.push({ value: cmd.id, label: `${cmd.title} · ${cmd.id}` });
  }
  return out;
}

function ZonesOverview({ zones, labels, part }: { zones: string[]; labels: string[]; part?: Selection["part"] }) {
  return (
    <div className="ut-col">
      {zones.map((z, i) => (
        <button key={z} type="button" className="ut-link" onClick={() => design.select({ part: part ?? design.get().selected?.part ?? "statusbar", zone: z })}>
          编辑{labels[i]}
        </button>
      ))}
    </div>
  );
}

function ToolbarOverview() {
  const c = useDesign((s) => s.doc.config);
  const bars = [
    ["top", "上侧", c.layout.toolbars.top.rows],
    ["side", "侧面", c.layout.toolbars.side.rows]
  ] as const;
  return (
    <div>
      {bars.map(([which, label, rows]) => (
        <div key={which}>
          <div className="ut-sub">{label}</div>
          {rows.length === 0 && <div className="ut-note">还没有排。在「布局」里增加排数。</div>}
          {rows.map((row, i) => (
            <div key={row.id} className="ut-row">
              <span className="ut-grow">{row.title || `第 ${i + 1} 排`}</span>
              {row.groups ? (
                <button type="button" className="ut-link" onClick={() => design.select({ part: "toolbar", zone: `tbg:${which}:${row.id}` })}>
                  面板 {row.groups.length}
                </button>
              ) : (
                (["start", "center", "end"] as const).map((name) => (
                  <button key={name} type="button" className="ut-link" onClick={() => design.select({ part: "toolbar", zone: `tb:${which}:${row.id}:${name}` })}>
                    {name === "start" ? "左" : name === "center" ? "中" : "右"} {row[name].length}
                  </button>
                ))
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function groupZone(zone: string): { which: "top" | "side"; rowId: string } | null {
  const m = /^tbg:(top|side):(.+)$/.exec(zone);
  return m ? { which: m[1] as "top" | "side", rowId: m[2] } : null;
}

type FaceRow = { command: string; size: "big" | "small"; menu: string };

function parseMenu(text: string) {
  return text.split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean);
}

function faceRows(slots: ToolSlot[]): FaceRow[] {
  return slots.map((slot) => ({ command: slot.command, size: slot.size === "big" ? "big" : "small", menu: (slot.menu || []).join(",") }));
}

function slotsFromRows(rows: FaceRow[], prev: ToolSlot[]): ToolSlot[] {
  const prevBy = new Map(prev.map((slot) => [slot.command, slot]));
  return rows
    .filter((row) => row.command)
    .map((row) => {
      const menu = parseMenu(row.menu).filter((id) => id !== row.command);
      const old = prevBy.get(row.command);
      return {
        command: row.command,
        size: row.size,
        ...(menu.length ? { menu } : {}),
        ...(old?.text ? { text: old.text } : {}),
        ...(old?.icon ? { icon: old.icon } : {}),
        ...(old?.display ? { display: old.display } : {}),
        ...(old?.menuOn && menu.length ? { menuOn: old.menuOn } : {})
      };
    });
}

function covered(slots: ToolSlot[]) {
  const ids = new Set<string>();
  for (const slot of slots) {
    if (slot.command) ids.add(slot.command);
    for (const id of slot.menu || []) ids.add(id);
  }
  return ids;
}

/** 功能区一页里的面板：改组名、面上按钮、下拉和大或小。 */
function GroupEditor({ zone }: { zone: string }) {
  const c = useDesign((s) => s.doc.config);
  const parsed = groupZone(zone);
  const row = parsed ? c.layout.toolbars[parsed.which].rows.find((r) => r.id === parsed.rowId) : undefined;
  if (!parsed || !row || !row.groups) return <div className="ut-note">这一页没有面板。</div>;
  const groups = row.groups;
  const setGroups = (next: ToolGroup[], coalesce?: string) => {
    design.setConfig((cfg) => {
      const which = parsed.which;
      const rows = cfg.layout.toolbars[which].rows.map((r) => {
        if (r.id !== parsed.rowId) return r;
        const start = next.flatMap((g) => g.commands.filter(Boolean).map((command) => ({ id: `${r.id}-${g.id}-${command}`, command })));
        return { ...r, groups: next, start, center: [], end: [] };
      });
      return { ...cfg, layout: { ...cfg.layout, toolbars: { ...cfg.layout.toolbars, [which]: { ...cfg.layout.toolbars[which], rows } } } };
    }, coalesce);
  };
  const options = commandOptions(c);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= groups.length) return;
    const next = [...groups];
    [next[i], next[j]] = [next[j], next[i]];
    setGroups(next);
  };
  const write = (g: ToolGroup, slots: ToolSlot[], overflow: string[]) => {
    const seen = new Set<string>();
    const commands: string[] = [];
    const add = (id: string) => {
      if (!id || seen.has(id)) return;
      seen.add(id);
      commands.push(id);
    };
    for (const id of g.commands) if (covered(slots).has(id) || overflow.includes(id)) add(id);
    for (const slot of slots) {
      add(slot.command);
      for (const id of slot.menu || []) add(id);
    }
    for (const id of overflow) add(id);
    setGroups(groups.map((x) => (x.id === g.id ? { ...x, slots, commands } : x)));
  };
  return (
    <div>
      <ChipList
        items={groups.map((g) => ({ id: g.id, label: g.title || g.id }))}
        selectedId={design.get().selected?.item?.includes("/") ? undefined : design.get().selected?.item}
        onSelect={(id) => design.select({ part: "toolbar", zone, item: id })}
        onReorder={(ids) => setGroups(orderById(groups, ids))}
      />
      <div className="ut-note">{row.title || row.id}：拖动面板换顺序。面上的按钮按大、小和下拉来排。没放在面上的命令进面板底部的下拉。</div>
      {groups.map((g, i) => {
        const slots = g.slots?.length ? g.slots : g.commands.filter(Boolean).map((command, n) => ({ command, size: n === 0 ? "big" as const : "small" as const }));
        const overflow = g.commands.filter((id) => id && !covered(slots).has(id));
        return (
          <div key={g.id}>
            <Field label="面板名">
              <TextField value={g.title} onChange={(title) => setGroups(groups.map((x) => (x.id === g.id ? { ...x, title } : x)), "grp-title:" + g.id)} />
            </Field>
            <div className="ut-sub">面上</div>
            <ListEditor
              items={faceRows(slots)}
              columns={[
                { key: "command", label: "命令", type: "select", options },
                { key: "size", label: "大小", type: "select", width: 72, options: [{ value: "big", label: "大" }, { value: "small", label: "小" }] },
                { key: "menu", label: "下拉", placeholder: "下拉里的命令，逗号分隔" }
              ]}
              onChange={(rows) => write(g, slotsFromRows(rows, slots), overflow)}
              create={() => ({ command: "", size: "small" as const, menu: "" })}
              addLabel="面上按钮"
            />
            <div className="ut-sub">下拉里（不在面上）</div>
            <ListEditor
              items={overflow.map((command) => ({ command }))}
              columns={[{ key: "command", label: "命令", type: "select", options }]}
              onChange={(rows) => write(g, slots, rows.map((r) => r.command).filter(Boolean))}
              create={() => ({ command: "" })}
              addLabel="溢出命令"
            />
            <div className="ut-row">
              <button type="button" className="ut-link" onClick={() => move(i, -1)}>上移</button>
              <button type="button" className="ut-link" onClick={() => move(i, 1)}>下移</button>
              <button type="button" className="ut-link" onClick={() => setGroups(groups.filter((x) => x.id !== g.id))}>删除面板</button>
            </div>
          </div>
        );
      })}
      <button type="button" className="ut-add" onClick={() => setGroups([...groups, { id: nid("grp"), title: "新面板", commands: [] }])}>
        添加面板
      </button>
    </div>
  );
}

function MenusOverview() {
  const menus = useDesign((s) => s.doc.config.menus);
  const zone = useDesign((s) => s.selected?.zone);
  return (
    <div>
      <ChipList
        items={menus.map((m) => ({ id: m.id, label: `${m.title}（${m.items.length}）` }))}
        selectedId={zone?.startsWith("menu:") ? zone.slice(5) : undefined}
        onSelect={(id) => design.select({ part: "titlebar", zone: `menu:${id}` })}
        onReorder={(ids) => design.setConfig((c) => ({ ...c, menus: orderById(c.menus, ids) }))}
      />
      <div className="ut-note">拖动换顺序，预览里的菜单跟着动。点一个，在下面改这一项。</div>
      <button
        type="button"
        className="ut-add"
        onClick={() => {
          const id = nid("menu");
          design.setConfig((c) => ({ ...c, menus: [...c.menus, { id, title: "新菜单", items: [] }] }));
          design.select({ part: "titlebar", zone: `menu:${id}` });
        }}
      >
        添加菜单
      </button>
    </div>
  );
}

type CmdRow = { id: string; title: string; category: string; keybinding: string; core: string; icon?: string; params?: unknown };

function CommandsEditor() {
  const commands = useDesign((s) => s.doc.config.commands);
  const rows: CmdRow[] = commands.map((c) => ({ id: c.id, title: c.title, category: c.category ?? "", keybinding: c.keybinding ?? "", core: c.core ?? "", icon: c.icon, params: c.params }));
  const columns: Column<CmdRow>[] = [
    { key: "title", label: "名称", width: 72 },
    { key: "id", label: "命令 id", width: 88 },
    { key: "category", label: "分类", width: 56 },
    { key: "keybinding", label: "快捷键", width: 72 },
    { key: "core", label: "内核方法", placeholder: "内核方法" }
  ];
  return (
    <div>
      <div className="ut-note">内核方法填了，执行这条命令就交给 Rust：core.call(方法名)。</div>
      <ListEditor
        items={rows}
        columns={columns}
        onChange={(next) =>
          design.setConfig((c) => ({
            ...c,
            commands: next.map((r) => {
              const cmd: CommandDef = { id: r.id, title: r.title || "未命名" };
              if (r.category) cmd.category = r.category;
              if (r.keybinding) cmd.keybinding = r.keybinding;
              if (r.core) cmd.core = r.core;
              if (r.icon) cmd.icon = r.icon;
              if (r.params !== undefined) cmd.params = r.params;
              return cmd;
            })
          }))
        }
        create={(): CmdRow => ({ id: nid("cmd"), title: "新命令", category: "命令", keybinding: "", core: "" })}
        addLabel="命令"
      />
    </div>
  );
}

/** 菜单、工具栏、状态栏、命令。命令的「内核方法」执行时转给 Rust。 */
export function PartsView() {
  return (
    <div className="ut-view">
      <Section title="菜单">
        <MenusOverview />
      </Section>
      <Section title="工具栏" defaultOpen={false}>
        <ToolbarOverview />
      </Section>
      <Section title="状态栏" defaultOpen={false}>
        <ZonesOverview part="statusbar" zones={["status:start", "status:center", "status:end"]} labels={["左区", "中区", "右区"]} />
      </Section>
      <Section title="命令" defaultOpen={false}>
        <CommandsEditor />
      </Section>
    </div>
  );
}

function menuKey(it: MenuItem, i: number) {
  return it.id ?? `item-${i}`;
}

function findMenuItem(items: MenuItem[], id: string): MenuItem | undefined {
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (menuKey(it, i) === id) return it;
    const child = it.items && findMenuItem(it.items, id);
    if (child) return child;
  }
  return undefined;
}

function mapMenuItem(items: MenuItem[], id: string, fn: (it: MenuItem) => MenuItem): MenuItem[] {
  return items.map((it, i) => {
    const key = menuKey(it, i);
    if (key === id) return fn({ ...it, id: it.id ?? id });
    if (it.items) return { ...it, items: mapMenuItem(it.items, id, fn) };
    return it;
  });
}

function keptItem(prev: MenuItem | undefined, row: { id: string; command: string; title: string }): MenuItem {
  if (row.command === "-") return { id: row.id, separator: true };
  return {
    id: row.id,
    ...(row.command ? { command: row.command } : {}),
    ...(row.title ? { title: row.title } : {}),
    ...(prev?.display ? { display: prev.display } : {}),
    ...(prev?.items ? { items: prev.items } : {}),
    ...(prev?.swatches ? { swatches: prev.swatches } : {})
  };
}

function MenuEditor({ zone, itemId, sub }: { zone: string; itemId?: string; sub?: "icon" | "text" }) {
  const c = useDesign((s) => s.doc.config);
  const menu = findMenu(c, zone);
  if (!menu) return <div className="ut-note">菜单不存在。</div>;
  const setItems = (items: MenuItem[]) => design.setConfig((cfg) => ({ ...cfg, menus: cfg.menus.map((m) => (m.id === menu.id ? { ...m, items } : m)) }));
  const current = itemId ? findMenuItem(menu.items, itemId) : undefined;
  const onTitle = !current || !!current.separator;
  const patchItem = (p: Partial<MenuItem>) => {
    if (!itemId) return;
    setItems(mapMenuItem(menu.items, itemId, (it) => ({ ...it, ...p })));
  };
  const options = [{ value: "-", label: "—— 分隔线 ——" }, ...commandOptions(c)];
  const columns: Column<{ id: string; command: string; title: string }>[] = [
    { key: "command", label: "命令", type: "select", options },
    { key: "title", label: "改名", width: 80 }
  ];
  return (
    <div>
      {onTitle && (
        <ToggleField label="隐身" checked={!!menu.ghost} onChange={(ghost) => design.setConfig((cfg) => ({ ...cfg, menus: cfg.menus.map((m) => (m.id === menu.id ? { ...m, ghost } : m)) }))} hint="打开后不出现在标题栏。进入当前模块仍能看到。" />
      )}
      {(onTitle || sub !== "icon") && (
        <div className={onTitle && sub === "text" ? "ut-focus" : undefined}>
          <Field label={onTitle ? "菜单名" : "显示文字"}>
            <TextField
              value={onTitle ? menu.title : (current?.title ?? "")}
              placeholder={onTitle ? "" : "留空用命令名"}
              onChange={(title) => {
                if (onTitle) design.setConfig((cfg) => ({ ...cfg, menus: cfg.menus.map((m) => (m.id === menu.id ? { ...m, title } : m)) }), "menu-title");
                else patchItem({ title: title || undefined });
              }}
            />
          </Field>
        </div>
      )}
      {current && !current.separator && !current.items && !current.swatches && sub !== "text" && (
        <Field label="此项命令">
          <select className="wb-select ut-full" value={current.command ?? ""} onChange={(e) => patchItem({ command: e.target.value })}>
            {commandOptions(c).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      )}
      {current && !current.separator && sub !== "text" && (
        <Field label="显示">
          <Segmented value={current.display ?? "both"} options={[{ value: "both", label: "图标+文字" }, { value: "icon", label: "仅图标" }, { value: "text", label: "仅文字" }]} onChange={(display) => patchItem({ display })} />
        </Field>
      )}
      {current && sub === "icon" && <div className="ut-note">菜单项的图标来自它的命令。这里只决定这一项画不画图标。</div>}
      {current?.items && (
        <ListEditor
          items={current.items.map((it, i) => ({ id: menuKey(it, i), command: it.separator ? "-" : (it.command ?? ""), title: it.title ?? "" }))}
          columns={columns}
          onChange={(rows) =>
            patchItem({
              items: rows.map((r) => keptItem(current.items?.find((it, i) => menuKey(it, i) === r.id), r))
            })
          }
          create={() => ({ id: nid("mi"), command: "", title: "" })}
          addLabel="子项"
        />
      )}
      {current?.swatches && <SwatchEditor swatches={current.swatches} onChange={(swatches) => patchItem({ swatches })} />}
      {!sub && onTitle && (
        <ListEditor
          items={menu.items.map((it, i) => ({ id: menuKey(it, i), command: it.separator ? "-" : (it.command ?? ""), title: it.title ?? "" }))}
          columns={columns}
          onChange={(rows) => setItems(rows.map((r) => keptItem(menu.items.find((it, i) => menuKey(it, i) === r.id), r)))}
          create={() => ({ id: nid("mi"), command: "", title: "" })}
          addLabel="菜单项"
        />
      )}
      {!sub && onTitle && (
        <button type="button" className="ut-add" onClick={() => design.setConfig((cfg) => ({ ...cfg, menus: cfg.menus.filter((m) => m.id !== menu.id) }))}>
          删除此菜单
        </button>
      )}
    </div>
  );
}

function SwatchEditor({ swatches, onChange }: { swatches: MenuSwatch[]; onChange: (next: MenuSwatch[]) => void }) {
  return (
    <ListEditor
      items={swatches.map((s) => ({ id: s.id, label: s.label, color: s.color }))}
      columns={[
        { key: "label", label: "字", width: 64 },
        { key: "color", label: "颜色", width: 88 }
      ]}
      onChange={(rows) => onChange(rows.map((r) => ({ id: r.id, label: r.label, color: r.color })))}
      create={() => ({ id: nid("sw"), label: "新色", color: "#888888" })}
      addLabel="色块"
    />
  );
}

function SideOverview({ part, zone, item }: { part: "sidebar" | "auxiliarybar"; zone?: string; item?: string }) {
  const c = useDesign((s) => s.doc.config);
  const list = containersOf(c, part);
  const secId = zone?.startsWith("sec:") ? zone.slice(4) : undefined;
  const section = secId ? findSection(c, secId) : undefined;
  if (section && !item) return <SectionEditor id={secId!} section={section} />;
  return (
    <div>
      <div className="ut-sub">视图容器</div>
      {list.map((box) => (
        <ContainerBlock key={box.id} part={part} box={box} />
      ))}
      <button
        type="button"
        className="ut-add"
        onClick={() => {
          const id = nid("view");
          const box: SideContainer = { id, title: "新视图", icon: "layout", header: "show", headerActions: [], bottomOrder: "down", sections: [{ id: nid("sec"), title: "分区", view: "placeholder", anchor: "top", header: true, actions: [] }] };
          design.setConfig((cfg) => setContainers(cfg, part, [...containersOf(cfg, part), box]));
        }}
      >
        添加视图
      </button>
    </div>
  );
}

function ContainerBlock({ part, box }: { part: "sidebar" | "auxiliarybar"; box: SideContainer }) {
  const patch = (p: Partial<SideContainer>) => design.setConfig((c) => mapContainer(c, box.id, (x) => ({ ...x, ...p })));
  return (
    <Section title={box.title} defaultOpen={false}>
      <Field label="标题">
        <TextField value={box.title} onChange={(title) => patch({ title })} />
      </Field>
      <Field label="图标">
        <IconPicker value={box.icon} onChange={(icon) => patch({ icon })} />
      </Field>
      <Field label="标题栏">
        <Segmented value={box.header} options={[{ value: "show", label: "标题" }, { value: "icon", label: "仅图标" }, { value: "hidden", label: "隐藏" }]} onChange={(header) => patch({ header })} />
      </Field>
      <ToggleField label="隐身" checked={!!box.ghost} onChange={(ghost) => patch({ ghost })} hint="标题按钮平时看不见，鼠标移到标题栏才显现。" />
      <Field label="下组方向">
        <Segmented value={box.bottomOrder} options={[{ value: "down", label: "从上往下" }, { value: "up", label: "从下往上" }]} onChange={(bottomOrder) => patch({ bottomOrder })} />
      </Field>
      <button type="button" className="ut-link" onClick={() => design.select({ part, zone: `side:${box.id}:header` })}>
        编辑标题栏按钮（{box.headerActions.length}）
      </button>
      {box.sections.map((s) => (
        <div key={s.id} className="ut-row">
          <span className="ut-grow">{s.title}</span>
          <span className="ut-dim">{s.anchor === "top" ? "上组" : "下组"}</span>
          <button type="button" className="ut-link" onClick={() => design.select({ part, zone: `sec:${s.id}` })}>
            编辑
          </button>
        </div>
      ))}
      <button
        type="button"
        className="ut-add"
        onClick={() => {
          const id = nid("sec");
          patch({ sections: [...box.sections, { id, title: "新分区", view: "placeholder", anchor: "bottom", header: true, actions: [] }] });
          design.select({ part, zone: `sec:${id}` });
        }}
      >
        添加分区
      </button>
      <button type="button" className="ut-add" onClick={() => design.setConfig((c) => setContainers(c, part, containersOf(c, part).filter((x) => x.id !== box.id)))}>
        删除此视图
      </button>
    </Section>
  );
}

function SectionEditor({ id, section, sub }: { id: string; section: ViewSection; sub?: "icon" | "text" }) {
  const patch = (p: Partial<ViewSection>) => design.setConfig((c) => mapSection(c, id, (s) => ({ ...s, ...p })));
  return (
    <div>
      {sub !== "icon" && (
        <div className={sub === "text" ? "ut-focus" : undefined}>
          <Field label="标题">
            <TextField value={section.title} onChange={(title) => patch({ title })} />
          </Field>
        </div>
      )}
      {sub !== "text" && sub !== "icon" && (
        <Field label="视图">
          <select className="wb-select ut-full" value={section.view} onChange={(e) => patch({ view: e.target.value })}>
            {viewOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      )}
      {sub !== "text" && (
        <div className={sub === "icon" ? "ut-focus" : undefined}>
          <Field label="图标">
            <IconPicker value={section.icon ?? ""} onChange={(icon) => patch({ icon })} />
          </Field>
        </div>
      )}
      {!sub && (
        <>
          <Field label="位置">
            <Segmented value={section.anchor} options={[{ value: "top", label: "上组" }, { value: "bottom", label: "下组" }]} onChange={(anchor) => patch({ anchor })} />
          </Field>
          <ToggleField label="显示标题" checked={section.header} onChange={(header) => patch({ header })} />
          <ToggleField label="折叠" checked={!!section.collapsed} onChange={(collapsed) => patch({ collapsed })} />
          <div className="ut-sub">标题栏按钮</div>
          <ItemListEditor zone={`sec:${id}`} />
        </>
      )}
    </div>
  );
}

function ActivityOverview({ item, sub }: { item?: string; sub?: "icon" | "text" }) {
  const c = useDesign((s) => s.doc.config);
  const box = item ? c.activity.find((x) => x.id === item) : undefined;
  if (box)
    return (
      <div>
        {sub !== "icon" && (
          <div className={sub === "text" ? "ut-focus" : undefined}>
            <Field label="标题">
              <TextField value={box.title} onChange={(title) => design.setConfig((cfg) => mapContainer(cfg, box.id, (x) => ({ ...x, title })))} />
            </Field>
          </div>
        )}
        {sub !== "text" && (
          <div className={sub === "icon" ? "ut-focus" : undefined}>
            <Field label="图标">
              <IconPicker value={box.icon} onChange={(icon) => design.setConfig((cfg) => mapContainer(cfg, box.id, (x) => ({ ...x, icon })))} />
            </Field>
          </div>
        )}
      </div>
    );
  return (
    <div>
      <div className="ut-note">点活动栏图标选中一个视图，或在下面调整顺序。</div>
      {c.activity.map((a, i) => (
        <div key={a.id} className="ut-row">
          <Icon name={a.icon} size={14} />
          <span className="ut-grow">{a.title}</span>
          <button type="button" className="ut-link" onClick={() => moveList("activity", i, -1)}>上移</button>
          <button type="button" className="ut-link" onClick={() => moveList("activity", i, 1)}>下移</button>
        </div>
      ))}
      <button type="button" className="ut-link" onClick={() => design.select({ part: "activitybar", zone: "activity-bottom" })}>
        编辑底部按钮
      </button>
    </div>
  );
}

function moveList(key: "activity" | "auxiliary" | "panel", index: number, delta: number) {
  design.setConfig((c) => {
    const list = [...c[key]];
    const j = index + delta;
    if (j < 0 || j >= list.length) return c;
    [list[index], list[j]] = [list[j], list[index]];
    return { ...c, [key]: list };
  });
}

function PanelOverview({ item, sub }: { item?: string; sub?: "icon" | "text" }) {
  const c = useDesign((s) => s.doc.config);
  const tab = item ? c.panel.find((p) => p.id === item) : undefined;
  const setTabs = (panel: PaneTab[]) => design.setConfig((cfg) => ({ ...cfg, panel }));
  if (tab)
    return (
      <div>
        {sub !== "icon" && (
          <div className={sub === "text" ? "ut-focus" : undefined}>
            <Field label="标题">
              <TextField value={tab.title} onChange={(title) => setTabs(c.panel.map((p) => (p.id === tab.id ? { ...p, title } : p)))} />
            </Field>
          </div>
        )}
        {sub !== "text" && sub !== "icon" && (
          <Field label="视图">
            <select className="wb-select ut-full" value={tab.view} onChange={(e) => setTabs(c.panel.map((p) => (p.id === tab.id ? { ...p, view: e.target.value } : p)))}>
              {viewOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        )}
        {sub !== "text" && (
          <div className={sub === "icon" ? "ut-focus" : undefined}>
            <Field label="图标">
              <IconPicker value={tab.icon} onChange={(icon) => setTabs(c.panel.map((p) => (p.id === tab.id ? { ...p, icon } : p)))} />
            </Field>
          </div>
        )}
      </div>
    );
  return (
    <div>
      <ListEditor
        items={c.panel}
        columns={[
          { key: "icon", label: "图标", type: "icon" },
          { key: "title", label: "标题" },
          { key: "view", label: "视图", type: "select", options: viewOptions }
        ]}
        onChange={setTabs}
        create={() => ({ id: nid("panel"), title: "新页签", icon: "terminal", view: "placeholder" })}
      />
      <button type="button" className="ut-link" onClick={() => design.select({ part: "panel", zone: "panel-actions" })}>
        编辑标题栏按钮
      </button>
    </div>
  );
}

function EditorOverview({ item, sub }: { item?: string; sub?: "icon" | "text" }) {
  const c = useDesign((s) => s.doc.config);
  const tab = item ? c.editors.find((e) => e.id === item) : undefined;
  return (
    <div>
      {tab && (
        <>
          {sub !== "icon" && (
            <div className={sub === "text" ? "ut-focus" : undefined}>
              <Field label="标题">
                <TextField value={tab.title} onChange={(title) => design.setConfig((cfg) => ({ ...cfg, editors: cfg.editors.map((e) => (e.id === tab.id ? { ...e, title } : e)) }))} />
              </Field>
            </div>
          )}
          {sub !== "text" && (
            <div className={sub === "icon" ? "ut-focus" : undefined}>
              <Field label="图标">
                <IconPicker value={tab.icon ?? ""} onChange={(icon) => design.setConfig((cfg) => ({ ...cfg, editors: cfg.editors.map((e) => (e.id === tab.id ? { ...e, icon } : e)) }))} />
              </Field>
            </div>
          )}
        </>
      )}
      {!sub && (
        <>
          <div className="ut-sub">启动时打开</div>
          <ListEditor
            items={c.editors}
            columns={[
              { key: "icon", label: "图标", type: "icon" },
              { key: "title", label: "标题" },
              { key: "view", label: "视图", type: "select", options: viewOptions }
            ]}
            onChange={(editors) => design.setConfig((cfg) => ({ ...cfg, editors }))}
            create={() => ({ id: nid("doc"), title: "新文档", icon: "file-text", view: "placeholder" })}
          />
          <button type="button" className="ut-link" onClick={() => design.select({ part: "editor", zone: "tab-actions" })}>
            页签右侧按钮
          </button>
          <button type="button" className="ut-link" onClick={() => design.select({ part: "editor", zone: "crumb-actions" })}>
            面包屑右侧按钮
          </button>
        </>
      )}
    </div>
  );
}

function AreaStyle({ part }: { part: Selection["part"] }) {
  const icons = useDesign((s) => s.doc.config.icons);
  const area = part === "auxiliarybar" || part === "sidebar" ? "sidebar" : part === "titlebar" ? "titlebar" : part;
  const known = ICON_AREAS.find((a) => a.id === area);
  if (!known) return <div className="ut-note">这个部件没有单独的图标区域。</div>;
  const current = icons.areas[known.id];
  return (
    <div>
      <div className="ut-note">这里只改「{known.name}」的图标风格，其它区域不动。全局风格在「工具图标」页。</div>
      <div className="ut-style-picks">
        <button type="button" className={!current ? "on" : ""} onClick={() => design.setConfig((c) => { const areas = { ...c.icons.areas }; delete areas[known.id]; return { ...c, icons: { ...c.icons, areas } }; })}>
          跟随全局
        </button>
        {ICON_STYLES.map((s) => (
          <button key={s.id} type="button" className={current === s.id ? "on" : ""} onClick={() => design.setConfig((c) => ({ ...c, icons: { ...c.icons, areas: { ...c.icons.areas, [known.id]: s.id } } }))}>
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
