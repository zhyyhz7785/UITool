import { Icon, styleGlyphs } from "@tpl/icons/Icon";
import { builtinCommands } from "@tpl/workbench/commands";
import type { ItemDisplay, SideContainer, ToolItem, ToolSlot, UiConfig } from "@tpl/workbench/types";
import { useLayoutEffect, useState, type ReactNode } from "react";
import { commandCatalog } from "./commandCatalog";
import { ChipList, Field, IconPicker, ListEditor, Segmented, TextField, ToggleField } from "./controls";
import { deleteSelections, describe, kindOf, mergeAsMenu, mergeMenus, mergeRows, splitMenu } from "./merge";
import { shareSpan, targetOf } from "./regionSelect";
import { design, selKey, useDesign, type Selection } from "./store";
import { locateSlot, mapContainer, orderById, orderSlots, parseToolbarRow, removeSlot, ribbonSlots, setZoneItems, updateSlot, zoneItems, parseGroupZone } from "./zones";

const SPLIT_KEY = "uitool.prop.split";

/** 属性「内容」页：上面是概览，下面是细节，中间的条可以拖。 */
export function Split({ top, bottom }: { top: ReactNode; bottom: ReactNode }) {
  const [h, setH] = useState(() => {
    const n = Number(localStorage.getItem(SPLIT_KEY));
    return Number.isFinite(n) && n >= 72 ? n : 168;
  });
  const drag = (e: React.PointerEvent) => {
    const parent = (e.currentTarget as HTMLElement).parentElement;
    if (!parent) return;
    const top0 = parent.getBoundingClientRect().top;
    const move = (ev: PointerEvent) => {
      const next = Math.max(72, Math.min(Math.max(96, parent.clientHeight - 96), ev.clientY - top0));
      setH(next);
      localStorage.setItem(SPLIT_KEY, String(Math.round(next)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return (
    <div className="ut-split">
      <div className="ut-split-top" style={{ height: h }}>
        {top}
      </div>
      <div className="ut-split-bar" onPointerDown={drag} title="拖动分开上下" />
      <div className="ut-split-bottom">{bottom}</div>
    </div>
  );
}

function commandName(c: UiConfig, id: string) {
  return c.commands.find((x) => x.id === id)?.title ?? commandCatalog.find((x) => x.id === id)?.title ?? builtinCommands[id]?.title ?? id;
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

function setOverride(semantic: string, value: string | null) {
  design.setConfig((c) => {
    const overrides = { ...c.icons.overrides };
    if (value) overrides[semantic] = value;
    else delete overrides[semantic];
    return { ...c, icons: { ...c.icons, overrides } };
  });
}

const DISPLAYS: { value: ItemDisplay; label: string }[] = [
  { value: "both", label: "图标+文字" },
  { value: "icon", label: "仅图标" },
  { value: "text", label: "仅文字" }
];

/** 一个区域里的按钮，拖动换顺序，点一下在下面编辑。 */
export function ZoneChips({ zone }: { zone: string }) {
  const c = useDesign((s) => s.doc.config);
  const selected = useDesign((s) => s.selected);
  const part = selected?.part ?? "toolbar";
  if (zone.startsWith("tbg:")) {
    const parsed = parseGroupZone(zone);
    const row = parsed ? c.layout.toolbars[parsed.which].rows.find((r) => r.id === parsed.rowId) : undefined;
    const groupId = selected?.item?.includes("/") ? selected.item.slice(0, selected.item.indexOf("/")) : selected?.item;
    const group = row?.groups?.find((g) => g.id === groupId) ?? row?.groups?.[0];
    if (!group) return <div className="ut-note">这一页没有面板。</div>;
    const slots = ribbonSlots(group);
    return (
      <div>
        <ChipList
          items={slots.map((s) => ({ id: `${group.id}/${s.command}`, label: s.text || commandName(c, s.command) }))}
          selectedId={selected?.item}
          onSelect={(id) => design.select({ part, zone, item: id })}
          onReorder={(ids) => design.setConfig((cfg) => orderSlots(cfg, zone, group.id, ids))}
        />
        <div className="ut-note">拖动换顺序。点一个，在下面改图标和文字。</div>
      </div>
    );
  }
  const items = zoneItems(c, zone) ?? [];
  return (
    <div>
      <ChipList
        items={items.map((it) => ({ id: it.id, label: it.separator ? "分隔" : it.text || it.tooltip || (it.command ? commandName(c, it.command) : "按钮") }))}
        selectedId={selected?.zone === zone ? selected.item : undefined}
        onSelect={(id) => design.select({ part, zone, item: id })}
        onReorder={(ids) => design.setConfig((cfg) => setZoneItems(cfg, zone, orderById(zoneItems(cfg, zone) ?? [], ids)))}
      />
      <div className="ut-note">拖动换顺序。点一个，在下面改图标和文字。</div>
    </div>
  );
}

/** 按钮细节：显示方式，以及图标、文字两节。sub 只展开对应的那一节。 */
export function ItemDetail({ zone, itemId, sub }: { zone: string; itemId: string; sub?: "icon" | "text" }) {
  const c = useDesign((s) => s.doc.config);
  const slotLoc = locateSlot(c, zone, itemId);
  const tool = !slotLoc ? (zoneItems(c, zone) ?? []).find((x) => x.id === itemId) : undefined;
  if (!slotLoc && !tool) return <div className="ut-note">这一项已经不在了。</div>;
  if (tool?.separator) {
    return (
      <div>
        <div className="ut-note">这是一条分隔线。</div>
        <button type="button" className="ut-add" onClick={() => design.setConfig((cfg) => setZoneItems(cfg, zone, (zoneItems(cfg, zone) ?? []).filter((x) => x.id !== itemId)))}>
          删除此按钮
        </button>
      </div>
    );
  }
  const options = commandOptions(c);
  const display = (slotLoc ? slotLoc.slot.display : tool?.display) ?? "both";
  const menu = (slotLoc ? slotLoc.slot.menu : tool?.menu) ?? [];
  const iconValue = slotLoc ? slotLoc.slot.icon || c.commands.find((x) => x.id === slotLoc.slot.command)?.icon || builtinCommands[slotLoc.slot.command]?.icon || "" : tool?.icon || "";
  const semantic = iconValue && !iconValue.includes(":") ? iconValue : undefined;
  const glyphs = semantic ? styleGlyphs(semantic) : [];
  const patchTool = (p: Partial<ToolItem>) => design.setConfig((cfg) => setZoneItems(cfg, zone, (zoneItems(cfg, zone) ?? []).map((x) => (x.id === itemId ? { ...x, ...p } : x))), "item:" + itemId);
  const patchSlot = (p: Partial<ToolSlot>) => design.setConfig((cfg) => updateSlot(cfg, zone, itemId, p), "slot:" + itemId);
  const patch = slotLoc ? patchSlot : patchTool;
  return (
    <div>
      {!sub && !slotLoc && tool && (
        <Field label="命令">
          <select className="wb-select ut-full" value={tool.command ?? ""} onChange={(e) => patchTool({ command: e.target.value || undefined })}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      )}
      {slotLoc && !sub && <div className="ut-note">命令：{commandName(c, slotLoc.slot.command)}</div>}
      <Field label="显示">
        <Segmented value={display} options={DISPLAYS} onChange={(v) => patch({ display: v })} />
      </Field>
      {sub !== "text" && (
        <>
          <div className="ut-sub">图标</div>
          <Field label="图标">
            <IconPicker value={semantic ?? ""} onChange={(icon) => patch({ icon })} />
          </Field>
          {glyphs.length > 0 && semantic && (
            <div className="ut-glyph-row">
              {glyphs.map((g) => (
                <button
                  key={g.style}
                  type="button"
                  className={c.icons.overrides[semantic] === `${g.style}:${semantic}` || (!c.icons.overrides[semantic] && g.style === c.icons.style) ? "on" : ""}
                  title={g.style}
                  onClick={() => setOverride(semantic, g.style === c.icons.style ? null : `${g.style}:${semantic}`)}
                >
                  <Icon name={g.style === "hy" ? semantic : `${g.style}:${semantic}`} size={18} />
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {sub !== "icon" && (
        <>
          <div className="ut-sub">文字</div>
          <Field label="文字">
            <TextField value={(slotLoc ? slotLoc.slot.text : tool?.text) ?? ""} placeholder={slotLoc ? "留空用命令名" : ""} onChange={(text) => patch({ text: text || undefined })} />
          </Field>
          {!slotLoc && (
            <Field label="提示">
              <TextField value={tool?.tooltip ?? ""} onChange={(tooltip) => patchTool({ tooltip: tooltip || undefined })} />
            </Field>
          )}
        </>
      )}
      {!sub && slotLoc && (
        <Field label="大小">
          <Segmented value={slotLoc.slot.size} options={[{ value: "big", label: "大" }, { value: "small", label: "小" }]} onChange={(size) => patchSlot({ size })} />
        </Field>
      )}
      {!sub && (
        <>
          <div className="ut-sub">右键下拉</div>
          <ListEditor
            items={menu.map((command) => ({ command }))}
            columns={[{ key: "command", label: "命令", type: "select", options }]}
            onChange={(rows) => {
              const ids = rows.map((r) => r.command).filter(Boolean);
              patch(slotLoc ? { menu: ids, ...(ids.length ? { menuOn: slotLoc.slot.menuOn ?? "right" } : { menuOn: undefined }) } : { menu: ids });
            }}
            create={() => ({ command: options.find((o) => o.value)?.value ?? "" })}
            addLabel="下拉命令"
          />
          {slotLoc && menu.length > 0 && (
            <Field label="拉出方式">
              <Segmented
                value={slotLoc.slot.menuOn ?? "arrow"}
                options={[{ value: "arrow", label: "箭头" }, { value: "right", label: "右键" }]}
                onChange={(menuOn) => patchSlot({ menuOn })}
              />
            </Field>
          )}
        </>
      )}
      {!slotLoc && !sub && tool && <ToggleField label="强调色块" checked={tool.kind === "accent"} onChange={(on) => patchTool({ kind: on ? "accent" : "normal" })} />}
      {menu.length > 0 && (
        <button type="button" className="ut-add" onClick={() => design.setConfig((cfg) => splitMenu(cfg, { part: design.get().selected?.part ?? "toolbar", zone, item: itemId }))}>
          拆开下拉
        </button>
      )}
      <button
        type="button"
        className="ut-add"
        onClick={() => {
          if (slotLoc) design.setConfig((cfg) => removeSlot(cfg, zone, itemId));
          else design.setConfig((cfg) => setZoneItems(cfg, zone, (zoneItems(cfg, zone) ?? []).filter((x) => x.id !== itemId)));
          design.select({ part: design.get().selected?.part ?? "toolbar", zone });
        }}
      >
        删除此按钮
      </button>
    </div>
  );
}

function patchTitle(p: Partial<UiConfig["layout"]["titleBar"]>, coalesce?: string) {
  design.setConfig((c) => ({ ...c, layout: { ...c.layout, titleBar: { ...c.layout.titleBar, ...p } } }), coalesce);
}

export function AppIconEditor({ sub }: { sub?: "icon" | "text" }) {
  const c = useDesign((s) => s.doc.config);
  const T = c.layout.titleBar;
  return (
    <div>
      <ToggleField label="显示" checked={T.appIcon} onChange={(appIcon) => patchTitle({ appIcon })} />
      {sub !== "text" && (
        <Field label="图标">
          <IconPicker value={c.app.icon} onChange={(icon) => design.setConfig((cfg) => ({ ...cfg, app: { ...cfg.app, icon } }))} />
        </Field>
      )}
      {c.app.iconImage && (
        <button type="button" className="ut-add" onClick={() => design.setConfig((cfg) => ({ ...cfg, app: { ...cfg.app, iconImage: undefined } }))}>
          改用上面的笔画图标
        </button>
      )}
    </div>
  );
}

export function WinEditor({ focus }: { focus?: string }) {
  const T = useDesign((s) => s.doc.config.layout.titleBar);
  const win = { min: T.winControls?.min !== false, max: T.winControls?.max !== false };
  return (
    <div>
      <div className="ut-note">关闭按钮始终保留。</div>
      <div className={focus === "min" ? "ut-focus" : undefined}>
        <ToggleField label="最小化" checked={win.min} onChange={(min) => patchTitle({ winControls: { ...win, min } })} />
      </div>
      <div className={focus === "max" ? "ut-focus" : undefined}>
        <ToggleField label="最大化" checked={win.max} onChange={(max) => patchTitle({ winControls: { ...win, max } })} />
      </div>
    </div>
  );
}

export function ContainerHeadEditor({ id, sub }: { id: string; sub?: "icon" | "text" }) {
  const c = useDesign((s) => s.doc.config);
  const box = [...c.activity, ...c.auxiliary].find((x) => x.id === id);
  if (!box) return <div className="ut-note">这个视图不在了。</div>;
  const patch = (p: Partial<SideContainer>) => design.setConfig((cfg) => mapContainer(cfg, id, (x) => ({ ...x, ...p })));
  return (
    <div>
      {sub !== "icon" && (
        <Field label="标题">
          <TextField value={box.title} onChange={(title) => patch({ title })} />
        </Field>
      )}
      {sub !== "text" && (
        <Field label="图标">
          <IconPicker value={box.icon} onChange={(icon) => patch({ icon })} />
        </Field>
      )}
    </div>
  );
}

/** 多选：选保留的一个，勾上要合并的。全部同宽或同高才能合并。 */
export function MultiPanel({ items }: { items: Selection[] }) {
  const c = useDesign((s) => s.doc.config);
  const key = items.map(selKey).join("\n");
  const [pick, setPick] = useState(() => ({ key, keep: 0, merge: items.map((_, i) => i !== 0) }));
  const [geom, setGeom] = useState({ ok: false, missing: false });
  useLayoutEffect(() => {
    const root = document.querySelector(".ut-frame-inner");
    if (!root) {
      setGeom({ ok: false, missing: true });
      return;
    }
    const rects: { w: number; h: number }[] = [];
    for (const s of items) {
      const el = root.querySelector(targetOf(s));
      if (!el) {
        setGeom({ ok: false, missing: true });
        return;
      }
      const r = el.getBoundingClientRect();
      rects.push({ w: r.width, h: r.height });
    }
    setGeom({ ok: shareSpan(rects), missing: false });
  }, [key, items]);
  if (pick.key !== key) {
    setPick({ key, keep: 0, merge: items.map((_, i) => i !== 0) });
    return null;
  }
  const keep = Math.min(pick.keep, items.length - 1);
  const kept = items[keep];
  const drops = items.filter((_, i) => i !== keep && pick.merge[i]);
  const unkept = items.filter((_, i) => i !== keep);
  const kinds = items.map((s) => kindOf(c, s));
  const kind = kinds.every((k) => k === kinds[0]) ? kinds[0] : "mixed";
  const rows = [kept, ...drops].map((s) => s.row).filter((x): x is string => !!x);
  const keepTb = kept.row ? parseToolbarRow(kept.row) : null;
  const canRow =
    kind === "row" &&
    ((rows.includes("title") && rows.includes("menu")) ||
      (!!keepTb && drops.some((s) => {
        const p = s.row ? parseToolbarRow(s.row) : null;
        return !!p && p.which === keepTb.which && p.id !== keepTb.id;
      })));
  const commit = (next: UiConfig) => {
    if (next === c) return;
    design.setConfig(() => next);
    design.select(kept.item || kept.zone || kept.row ? kept : { part: kept.part });
  };
  return (
    <div>
      <div className="ut-note">Ctrl 添加，Shift 减少。左边选保留的一个，右边勾要合并的。</div>
      {geom.missing && <div className="ut-note">有的区域现在量不到宽高，先在预览里让它露出来。</div>}
      {!geom.missing && !geom.ok && <div className="ut-note">只有同宽或同高的区域能合并。叠在一起也可以，只要宽或高对齐。</div>}
      {items.map((s, i) => (
        <div key={selKey(s)} className="ut-multi-row">
          <label>
            <input
              type="radio"
              name="ut-keep"
              checked={keep === i}
              onChange={() =>
                setPick((p) => ({
                  ...p,
                  keep: i,
                  merge: p.merge.map((v, j) => (j === i ? false : j === p.keep ? true : v))
                }))
              }
            />
            保留
          </label>
          <label>
            <input
              type="checkbox"
              checked={i !== keep && !!pick.merge[i]}
              disabled={i === keep}
              onChange={() => setPick((p) => ({ ...p, merge: p.merge.map((v, j) => (j === i ? !v : v)) }))}
            />
            合并
          </label>
          <span className="ut-grow">{describe(c, s)}</span>
        </div>
      ))}
      {kind === "item" && (
        <button type="button" className="ut-add" disabled={!drops.length || !geom.ok} onClick={() => geom.ok && commit(mergeAsMenu(c, kept, drops))}>
          合并为右键下拉
        </button>
      )}
      {kind === "row" && (
        <button type="button" className="ut-add" disabled={!canRow || !geom.ok} onClick={() => geom.ok && commit(mergeRows(c, kept, drops))}>
          合并为一排
        </button>
      )}
      {kind === "menu" && (
        <button type="button" className="ut-add" disabled={!drops.length || !geom.ok} onClick={() => geom.ok && commit(mergeMenus(c, kept, drops))}>
          合并菜单
        </button>
      )}
      {(kind === "mixed" || kind === "other") && <div className="ut-note">按钮可以并成右键下拉，同一侧的排可以并成一排，菜单可以并成一个菜单。混在一起时只能删除未保留的。</div>}
      {kind === "row" && !canRow && <div className="ut-note">保留一排工具栏，才能把同侧其它排并进去。标题栏和菜单一排会收进标题栏。</div>}
      <button type="button" className="ut-add" disabled={!unkept.length} onClick={() => commit(deleteSelections(c, unkept))}>
        删除未保留
      </button>
      <button type="button" className="ut-link" onClick={() => design.clearMulti()}>
        取消多选
      </button>
    </div>
  );
}
