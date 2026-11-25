import { Icon, IconContext, icons, loadIconPool, styleGlyphs, variantIds } from "@tpl/icons/Icon";
import { importVSCodeTheme, resolveColors, themeSwatches, type ThemeData } from "@tpl/theme/resolve";
import { accentChoices, findTheme } from "@tpl/theme/themes";
import { useWorkbench } from "@tpl/workbench/context";
import { ICON_AREAS, ICON_STYLES, type IconStyleId, type ToolItem, type UiConfig } from "@tpl/workbench/types";
import { switchScheme, TIER_NAME } from "@tpl/workbench/schemes";
import { Button, IconButton } from "@tpl/workbench/ui";
import { useMemo, useState } from "react";
import { exportProject, openDesign, saveDesign } from "../actions";
import { ColorInput, Field, filterIcons, IconPicker, Section, Segmented, TextField } from "../controls";
import { packageName, projectSummary, validateDoc } from "../export";
import { PART_NAMES, PART_ORDER, PartColors, PartLayout } from "../partSettings";
import { openTextFile, copyText } from "../platform";
import { buildConfig, workTypes } from "../presets";
import { migrateConfig } from "@tpl/workbench/migrate";
import { allThemes, clone, design, useDesign, type DesignDoc } from "../store";

const setCfg = <K extends keyof UiConfig>(k: K, v: UiConfig[K], coalesce?: string) => design.setConfig((c) => ({ ...c, [k]: v }), coalesce);

// ---------------- 预设 ----------------

const SNAP_KEY = "uitool.snapshots.v1";
type Snapshot = { name: string; at: number; doc: DesignDoc };
const loadSnaps = (): Snapshot[] => {
  try {
    return JSON.parse(localStorage.getItem(SNAP_KEY) ?? "[]");
  } catch {
    return [];
  }
};

export function PresetsView() {
  const wb = useWorkbench();
  const cfg = useDesign((s) => s.doc.config);
  const [snaps, setSnaps] = useState(loadSnaps);
  const [name, setName] = useState("");
  const saveSnaps = (s: Snapshot[]) => {
    setSnaps(s);
    localStorage.setItem(SNAP_KEY, JSON.stringify(s));
  };
  return (
    <div className="ut-view">
      <Section title="按工作类型">
        <div className="ut-note">点一套就是生成：这一套成为主方案，可以接着改；同类型另外两套自动附上。导出的程序里用「视图 → 界面方案」切换，命令和按钮不变。</div>
        <div className="ut-note">改 hy3d 或 HyMd：用左侧「连接」读取，在预览里改，再替换原设计。点下面的卡片会用预设换掉当前设计。</div>
        {workTypes.map((type) => (
          <div key={type.id}>
            <div className="ut-group-title">{type.name}</div>
            <div className="ut-cards">
              {type.schemes.map((s) => {
                const preview = buildConfig(type.id, s.id);
                const t = findTheme(allThemes(design.get().doc), preview.theme.id);
                const total = s.score.efficiency + s.score.aesthetic + s.score.learn;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={"ut-card" + (cfg.scheme === s.id ? " on" : "")}
                    onClick={() => {
                      design.setConfig(() => buildConfig(type.id, s.id, design.get().doc.config.app));
                      design.select(null);
                      wb.notify("success", `已生成「${type.name} · ${s.name}」`, "另外两套已附上");
                    }}
                  >
                    <MiniLayout config={preview} theme={t} />
                    <div className={"ut-tier " + s.tier}>{TIER_NAME[s.tier]} · {total}</div>
                    <div className="ut-card-title">{s.name}</div>
                    <div className="ut-card-desc">{s.desc}</div>
                    <div className="ut-card-src">{s.source}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Section>
      <Section title="界面方案">
        {(cfg.schemes?.length ?? 0) === 0 && <div className="ut-note">还没有方案。从上面选一个工作类型。</div>}
        {cfg.schemes?.map((s) => (
          <div key={s.id} className="ut-snap">
            <span className={"ut-tier " + s.tier}>{TIER_NAME[s.tier]}</span>
            <span className="ut-grow">
              {s.name}
              {s.tuned ? " · 主方案" : ""}
            </span>
            {cfg.scheme !== s.id && (
              <Button
                onClick={() => {
                  design.setConfig((c) => switchScheme(c, s.id, "design"));
                  wb.notify("info", `主方案改为「${s.name}」`, "之前的调整留在原来那一套里");
                }}
              >
                设为主方案
              </Button>
            )}
          </div>
        ))}
      </Section>
      <Section title="我的设计（本机）">
        <div className="ut-row">
          <input className="wb-input ut-grow" placeholder="给当前设计起个名字" value={name} onChange={(e) => setName(e.target.value)} />
          <Button
            onClick={() => {
              const n = name.trim() || design.get().doc.config.app.title;
              saveSnaps([{ name: n, at: Date.now(), doc: clone(design.get().doc) }, ...snaps.filter((s) => s.name !== n)]);
              setName("");
              wb.notify("success", `已存为「${n}」`);
            }}
          >
            保存
          </Button>
        </div>
        {snaps.length === 0 && <div className="ut-note">还没有保存的设计。</div>}
        {snaps.map((s) => (
          <div key={s.name} className="ut-snap">
            <Icon name="layout" size={14} />
            <span className="ut-grow" title={new Date(s.at).toLocaleString()}>
              {s.name}
            </span>
            <IconButton icon="open" title="载入" onClick={() => (design.replace(clone(s.doc)), wb.notify("info", `已载入「${s.name}」`))} />
            <IconButton icon="x" title="删除" onClick={() => saveSnaps(snaps.filter((x) => x !== s))} />
          </div>
        ))}
      </Section>
    </div>
  );
}

/** 活动栏「副页面」：点一行，编辑区画出这一页的分区，右侧改标题和条目。 */
export function DialogsView() {
  const cfg = useDesign((s) => s.doc.config);
  const pageId = useDesign((s) => s.pageId);
  const [query, setQuery] = useState("");
  const openPage = (id: string) => {
    design.selectSidePage(id);
    design.setSelecting(false);
  };
  const q = query.trim();
  const rows = (cfg.sidePages ?? []).filter((p) => !q || p.title.includes(q) || p.id.includes(q));
  return (
    <div className="ut-view">
      {(cfg.sidePages?.length ?? 0) === 0 ? (
        <div className="ut-note">当前设计没有副页面。读取 HyMd 后这里是绘图、文献、图片这些整页。hy3d 的绘图就在预设里，读取后这里是空的。</div>
      ) : (
        <div className="ut-note">点一行就选中。编辑区画出这一页的分区，右侧改标题和条目。</div>
      )}
      <Section title="列表">
        <input className="wb-input ut-full" placeholder="检索标题" value={query} onChange={(e) => setQuery(e.target.value)} />
        {rows.length === 0 && (cfg.sidePages?.length ?? 0) > 0 && <div className="ut-note">没有匹配的页面。</div>}
        {rows.map((p) => (
          <button key={p.id} type="button" className={"ut-dialog-row" + (pageId === p.id ? " on" : "")} onClick={() => openPage(p.id)}>
            <span className="ut-grow">{p.title}</span>
          </button>
        ))}
      </Section>
    </div>
  );
}

/** 方案卡片上的布局缩略图（按真实布局和主题色画）。 */
function MiniLayout({ config: c, theme }: { config: UiConfig; theme: ThemeData }) {
  const col = resolveColors(theme, c.theme);
  const L = c.layout;
  const left = L.primarySideBar.position === "left";
  const side = (
    <>
      {L.activityBar.visible && L.activityBar.position === "side" && <i style={{ width: 8, background: col["activityBar.background"] }} />}
      {L.primarySideBar.visible && <i style={{ width: 30, background: col["sideBar.background"] }} />}
    </>
  );
  return (
    <div className="ut-mini" style={{ background: col["editor.background"], borderColor: col["base.border"] }}>
      <i style={{ height: 6, background: col["titleBar.activeBackground"] }} />
      {L.toolbars.top.visible && <i style={{ height: 5, background: col["toolbar.background"], borderBottom: `1px solid ${col["base.border"]}` }} />}
      <div className="ut-mini-main">
        {L.toolbars.side.visible && <i style={{ width: 6, background: col["toolbar.background"] }} />}
        {left && side}
        {!left && L.auxiliaryBar.visible && <i style={{ width: 26, background: col["sideBar.background"] }} />}
        <div className="ut-mini-center">
          {L.editor.tabs && <i style={{ height: 6, background: col["editorGroupHeader.tabsBackground"] }} />}
          <i style={{ flex: 1, background: col["editor.background"] }} />
          {L.panel.visible && L.panel.position === "bottom" && <i style={{ height: 16, background: col["panel.background"], borderTop: `1px solid ${col["panel.border"]}` }} />}
        </div>
        {L.panel.visible && L.panel.position === "right" && <i style={{ width: 26, background: col["panel.background"] }} />}
        {left && L.auxiliaryBar.visible && <i style={{ width: 26, background: col["sideBar.background"] }} />}
        {!left && side}
      </div>
      {L.statusBar.visible && <i style={{ height: 4, background: col["statusBar.background"] }} />}
    </div>
  );
}

// ---------------- 布局 ----------------

export function LayoutView() {
  const c = useDesign((s) => s.doc.config);
  return (
    <div className="ut-view">
      <Section title="密度">
        <Field label="尺寸档">
          <Segmented value={c.density} options={[{ value: "compact", label: "紧凑" }, { value: "comfortable", label: "舒适" }]} onChange={(density) => setCfg("density", density)} />
        </Field>
        <div className="ut-note">字号、行高、栏高随密度变化（hy 令牌）；标题栏固定 28px。</div>
      </Section>
      {PART_ORDER.map((p) => (
        <Section key={p} title={PART_NAMES[p]} defaultOpen={p === "sidebar" || p === "panel" || p === "auxiliarybar"} actions={<IconButton icon="pointer" title="在预览中选中" size={13} onClick={() => design.select({ part: p })} />}>
          <PartLayout part={p} />
        </Section>
      ))}
    </div>
  );
}

// ---------------- 主题与配色 ----------------

export function ThemeView() {
  const wb = useWorkbench();
  const doc = useDesign((s) => s.doc);
  const sel = doc.config.theme;
  const themes = allThemes(doc);
  const [filter, setFilter] = useState("");
  const [newName, setNewName] = useState("");
  const setTheme = (patch: Partial<UiConfig["theme"]>, coalesce?: string) => design.setConfig((c) => ({ ...c, theme: { ...c.theme, ...patch } }), coalesce);
  const isCustom = (id: string) => doc.customThemes.some((t) => t.id === id);

  const importTheme = async () => {
    const f = await openTextFile(".json,.jsonc");
    if (!f) return;
    try {
      const t = importVSCodeTheme(f.text, f.name);
      design.update((d) => ({ customThemes: [...d.customThemes.filter((x) => x.id !== t.id), t], config: { ...d.config, theme: { ...d.config.theme, id: t.id } } }));
      wb.notify("success", `已导入主题「${t.name}」`, `${Object.keys(t.colors).length} 个颜色键`);
    } catch (e) {
      wb.notify("error", "导入失败", String((e as Error).message ?? e));
    }
  };
  const bake = () => {
    const name = newName.trim() || `${findTheme(themes, sel.id).name} 改`;
    const base = findTheme(themes, sel.id);
    const id = "custom-" + (packageName(name) === "app" ? Date.now().toString(36) : packageName(name));
    const colors = { ...base.colors, ...(sel.accent ? { "base.accent": sel.accent } : {}), ...sel.overrides };
    const t: ThemeData = { id, name, type: base.type, colors, source: `基于 ${base.name}` };
    design.update((d) => ({ customThemes: [...d.customThemes.filter((x) => x.id !== id), t], config: { ...d.config, theme: { id, accent: null, overrides: {} } } }));
    setNewName("");
    wb.notify("success", `已另存为主题「${name}」`, `导出时写入 src/theme/themes/${id}.json`);
  };

  return (
    <div className="ut-view">
      <Section title="颜色主题">
        <div className="ut-theme-list">
          {themes.map((t) => (
            <div key={t.id} className={"ut-theme" + (t.id === sel.id ? " on" : "")} onClick={() => setTheme({ id: t.id })}>
              <span className="wb-swatches">
                {themeSwatches(t, sel.accent).map((s, i) => (
                  <i key={i} style={{ background: s }} />
                ))}
              </span>
              <span className="ut-theme-name">
                {t.name}
                <small>{t.type === "dark" ? "深色" : "浅色"}{isCustom(t.id) ? " · 自定义" : ""}</small>
              </span>
              {isCustom(t.id) && (
                <IconButton
                  icon="x"
                  title="删除此自定义主题"
                  size={13}
                  onClick={(e) => {
                    e.stopPropagation();
                    design.update((d) => ({ customThemes: d.customThemes.filter((x) => x.id !== t.id), config: d.config.theme.id === t.id ? { ...d.config, theme: { ...d.config.theme, id: "hy-dark" } } : d.config }));
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="ut-row">
          <Button onClick={importTheme}>导入 VSCode 主题…</Button>
        </div>
      </Section>
      <Section title="强调色">
        <div className="wb-accents">
          <button type="button" className={"wb-accent none" + (!sel.accent ? " active" : "")} title="跟随主题" onClick={() => setTheme({ accent: null })} />
          {accentChoices.map((a) => (
            <button key={a} type="button" className={"wb-accent" + (sel.accent === a ? " active" : "")} style={{ background: a }} title={a} onClick={() => setTheme({ accent: a })} />
          ))}
        </div>
        <Field label="自定义">
          <ColorInput value={sel.accent ?? resolveColors(findTheme(themes, sel.id))["base.accent"]} onChange={(v) => setTheme({ accent: v.slice(0, 7) }, "accent")} />
        </Field>
        <div className="ut-note">只改这一个颜色，按钮、焦点、徽标、选中、状态栏等派生色一起变（hy 令牌 v2 规则）。</div>
      </Section>
      <Section title="另存为新主题">
        <div className="ut-row">
          <input className="wb-input ut-grow" placeholder="新主题名称" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Button onClick={bake}>另存</Button>
        </div>
        <div className="ut-note">把当前主题 + 强调色 + 下方覆盖合成一套主题，随工程导出。</div>
      </Section>
      <Section
        title={`颜色键（${Object.keys(sel.overrides).length} 项已改）`}
        actions={Object.keys(sel.overrides).length ? <IconButton icon="undo2" title="清除全部覆盖" size={13} onClick={() => setTheme({ overrides: {} })} /> : undefined}
      >
        <input className="wb-input ut-full" placeholder="筛选：键名或中文说明，如 sideBar / 状态栏" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <PartColors filter={filter} />
      </Section>
    </div>
  );
}

// ---------------- 工具图标 ----------------

const SAMPLES = ["new", "open", "save", "undo", "search", "settings", "play", "files"];

export function IconsView() {
  const wb = useWorkbench();
  const cfg = useDesign((s) => s.doc.config);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [poolQ, setPoolQ] = useState("");
  const [pool, setPool] = useState<{ id: string; n: string }[]>([]);
  const used = useMemo(() => usedIcons(cfg), [cfg]);
  const groups = useMemo(() => filterIcons(q).map((g) => ({ ...g, icons: g.icons.filter((id) => variantIds().includes(id) && (!cat || g.id === cat)) })), [q, cat]);
  const split = (wantUsed: boolean) => groups.map((g) => ({ ...g, icons: g.icons.filter((id) => used.has(id) === wantUsed) })).filter((g) => g.icons.length);
  const setStyle = (style: IconStyleId) => design.setConfig((c) => ({ ...c, icons: { ...c.icons, style } }));
  const setArea = (area: (typeof ICON_AREAS)[number]["id"], style: IconStyleId | null) =>
    design.setConfig((c) => {
      const areas = { ...c.icons.areas };
      if (style) areas[area] = style;
      else delete areas[area];
      return { ...c, icons: { ...c.icons, areas } };
    });
  const setOverride = (id: string, value: string | null) =>
    design.setConfig((c) => {
      const overrides = { ...c.icons.overrides };
      if (value) overrides[id] = value;
      else delete overrides[id];
      return { ...c, icons: { ...c.icons, overrides } };
    });
  return (
    <div className="ut-view">
      <Section title="风格（切换全部图标）">
        <div className="ut-style-cards">
          {ICON_STYLES.map((s) => (
            <button key={s.id} type="button" className={"ut-style-card" + (cfg.icons.style === s.id ? " on" : "")} onClick={() => setStyle(s.id)}>
              <IconContext.Provider value={{ config: { style: s.id, areas: {}, overrides: {} } }}>
                <span className="ut-style-samples">
                  {SAMPLES.map((id) => (
                    <Icon key={id} name={id} size={16} />
                  ))}
                </span>
              </IconContext.Provider>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="按功能区域" defaultOpen={false}>
        {ICON_AREAS.map((a) => (
          <Field key={a.id} label={a.name}>
            <select className="wb-select ut-full" value={cfg.icons.areas[a.id] ?? ""} onChange={(e) => setArea(a.id, (e.target.value || null) as IconStyleId | null)}>
              <option value="">跟随全局（{ICON_STYLES.find((s) => s.id === cfg.icons.style)?.name}）</option>
              {ICON_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        ))}
      </Section>
      <div className="ut-pad">
        <input className="wb-input ut-full" placeholder="搜索图标：中文 / 英文 / id" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="wb-select ut-full" value={cat} onChange={(e) => setCat(e.target.value)} style={{ marginTop: 6 }}>
          <option value="">全部分类</option>
          {filterIcons("").map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <IconBucket title="预览中正在使用" groups={split(true)} openId={openId} onOpen={setOpenId} overrides={cfg.icons.overrides} onOverride={setOverride} />
      <IconBucket title="未在预览中使用" groups={split(false)} openId={openId} onOpen={setOpenId} overrides={cfg.icons.overrides} onOverride={setOverride} />
      {openId && (
        <Section title={`全库替换「${icons[openId]?.n ?? openId}」`}>
          <input
            className="wb-input ut-full"
            placeholder="搜索 Lucide / Tabler 全库，例如 arrow"
            value={poolQ}
            onChange={(e) => {
              const v = e.target.value;
              setPoolQ(v);
              void loadIconPool().then(async () => {
                const mod = await import("@tpl/icons/pool.json");
                const all = (mod.default ?? mod).icons as { id: string; n: string }[];
                const s = v.trim().toLowerCase();
                setPool(s ? all.filter((i) => i.n.includes(s) || i.id.includes(s)).slice(0, 40) : []);
              });
            }}
          />
          <div className="ut-icon-grid">
            {pool.map((p) => (
              <button key={p.id} type="button" className="ut-icon-cell" title={p.id} onClick={() => setOverride(openId, p.id)}>
                <Icon name={p.id} size={16} />
              </button>
            ))}
          </div>
          <button type="button" className="ut-link" onClick={() => (setOverride(openId, null), wb.notify("info", "已恢复这个图标"))}>
            恢复为当前风格
          </button>
        </Section>
      )}
    </div>
  );
}

function IconBucket({ title, groups, openId, onOpen, overrides, onOverride }: { title: string; groups: { id: string; name: string; icons: string[] }[]; openId: string | null; onOpen: (id: string | null) => void; overrides: Record<string, string>; onOverride: (id: string, v: string | null) => void }) {
  const count = groups.reduce((n, g) => n + g.icons.length, 0);
  return (
    <Section title={`${title}（${count}）`} defaultOpen={title.startsWith("预览")}>
      {count === 0 && <div className="ut-note">没有。</div>}
      {groups.map((g) => (
        <div key={g.id}>
          <div className="ut-sub">{g.name}</div>
          <div className="ut-icon-grid big">
            {g.icons.map((id) => (
              <button key={id} type="button" className={"ut-icon-cell" + (openId === id ? " on" : "")} onClick={() => onOpen(openId === id ? null : id)}>
                <Icon name={id} size={20} />
                <span>{icons[id]?.n ?? id}</span>
              </button>
            ))}
          </div>
          {g.icons.includes(openId ?? "") && openId && (
            <div className="ut-glyph-row">
              {styleGlyphs(openId).map((gph) => (
                <button key={gph.style} type="button" className={overrides[openId] === `${gph.style}:${openId}` ? "on" : ""} title={gph.style} onClick={() => onOverride(openId, `${gph.style}:${openId}`)}>
                  <Icon name={`${gph.style}:${openId}`} size={18} />
                  <span>{ICON_STYLES.find((s) => s.id === gph.style)?.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </Section>
  );
}

function walkItem(ids: Set<string>, it?: { icon?: string }) {
  const icon = it?.icon;
  if (!icon) return;
  ids.add(icon.includes(":") ? icon.slice(icon.indexOf(":") + 1) : icon);
}
function walkItems(ids: Set<string>, items?: ToolItem[]) {
  items?.forEach((it) => walkItem(ids, it));
}
function usedIcons(c: UiConfig): Set<string> {
  const ids = new Set<string>();
  walkItem(ids, { icon: c.app.icon });
  for (const cmd of c.commands) walkItem(ids, cmd);
  walkItems(ids, [...c.layout.titleBar.left, ...(c.layout.titleBar.center ?? []), ...c.layout.titleBar.right, ...c.layout.activityBar.bottom, ...c.layout.panel.actions, ...c.layout.editor.tabActions, ...c.layout.editor.breadcrumbActions]);
  for (const bar of [c.layout.toolbars.top, c.layout.toolbars.side])
    for (const row of bar.rows) {
      walkItems(ids, [...row.start, ...row.center, ...row.end]);
      for (const g of row.groups ?? []) for (const slot of g.slots ?? []) walkItem(ids, slot);
    }
  walkItems(ids, [...c.statusBar.start, ...c.statusBar.center, ...c.statusBar.end]);
  for (const box of [...c.activity, ...c.auxiliary]) {
    walkItem(ids, box);
    walkItems(ids, box.headerActions);
    for (const s of box.sections) {
      walkItem(ids, s);
      walkItems(ids, s.actions);
    }
  }
  for (const p of c.panel) walkItem(ids, p);
  for (const e of c.editors) walkItem(ids, e);
  for (const m of c.menus) for (const it of m.items) {
    const cmd = c.commands.find((x) => x.id === it.command);
    if (cmd) walkItem(ids, cmd);
  }
  return ids;
}

// ---------------- 导出 ----------------

export function ExportView() {
  const wb = useWorkbench();
  const doc = useDesign((s) => s.doc);
  const a = doc.config.app;
  const errs = validateDoc(doc);
  const [last, setLast] = useState<string | null>(null);
  const setApp = (patch: Partial<UiConfig["app"]>) => setCfg("app", { ...a, ...patch }, "app:" + Object.keys(patch)[0]);
  return (
    <div className="ut-view">
      <Section title="应用信息">
        <Field label="窗口标题">
          <TextField value={a.title} onChange={(title) => setApp({ title })} />
        </Field>
        <Field label="工程名" hint="npm 包名 / 压缩包与文件夹名">
          <TextField value={a.name} mono onChange={(name) => setApp({ name: name.toLowerCase().replace(/\s+/g, "-") })} />
        </Field>
        <Field label="应用标识" hint="Tauri identifier，反向域名">
          <TextField value={a.identifier} mono onChange={(identifier) => setApp({ identifier })} />
        </Field>
        <Field label="版本">
          <TextField value={a.version} mono onChange={(version) => setApp({ version })} />
        </Field>
        <Field label="说明">
          <TextField value={a.description} onChange={(description) => setApp({ description })} />
        </Field>
        <Field label="应用图标">
          <IconPicker value={a.icon} onChange={(icon) => setApp({ icon })} />
        </Field>
        {errs.map((e) => (
          <div key={e} className="ut-error">
            {e}
          </div>
        ))}
      </Section>
      <Section title="导出">
        <div className="ut-col">
          <Button
            primary
            disabled={errs.length > 0}
            onClick={async () => {
              const p = await exportProject(wb);
              if (p) setLast(p);
            }}
          >
            导出工程 zip（Ctrl+Shift+E）
          </Button>
          <div className="ut-row">
            <Button onClick={() => void saveDesign(wb)}>保存设计…</Button>
            <Button onClick={() => void openDesign(wb)}>打开设计…</Button>
          </div>
          {last && <div className="ut-ok">已导出：{last}</div>}
        </div>
        <div className="ut-note">
          压缩包内是完整工程（{projectSummary(doc).files} 个文件）：界面 src/、Tauri 外壳 src-tauri/、Rust 内核 core/。解压后：
          <pre className="ut-pre">npm install{"\n"}npm run dev        # 浏览器看界面（模拟内核）{"\n"}npm run tauri dev  # 桌面应用</pre>
          设计结果只在 src/ui.config.json 一个文件里；以后改界面，在 UITool 打开它、调好后覆盖回去即可。
        </div>
      </Section>
    </div>
  );
}

// ---------------- 底部：JSON / 说明 ----------------

export function JsonView() {
  const wb = useWorkbench();
  const c = useDesign((s) => s.doc.config);
  const text = useMemo(() => JSON.stringify(c, null, 2), [c]);
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="ut-json">
      <div className="ut-row ut-pad">
        <Button onClick={() => copyText(text).then(() => wb.notify("info", "已复制 ui.config.json"))}>复制</Button>
        <Button
          disabled={draft == null}
          onClick={() => {
            try {
              const next = migrateConfig(JSON.parse(draft!));
              design.setConfig(() => next);
              setDraft(null);
              wb.notify("success", "已应用 JSON 修改");
            } catch (e) {
              wb.notify("error", "JSON 有误", String((e as Error).message));
            }
          }}
        >
          应用修改
        </Button>
        {draft != null && <Button onClick={() => setDraft(null)}>放弃修改</Button>}
        <span className="ut-dim">导出工程里的 src/ui.config.json 就是这份内容。</span>
      </div>
      <textarea className="ut-json-text" spellCheck={false} value={draft ?? text} onChange={(e) => setDraft(e.target.value)} />
    </div>
  );
}

export function GuideView() {
  return (
    <div className="ut-guide">
      <h3>用法</h3>
      <ol>
        <li>左侧「预设」按工作类型选一套。点中的成为主方案，同类型另外两套自动附上，导出后可在「视图 → 界面方案」切换。</li>
        <li>在中间预览里点一个区域，右侧「属性」改它的显隐、位置、尺寸、条目和颜色；分割条可直接拖。</li>
        <li>「主题与配色」选主题、换强调色、逐键覆盖颜色，或导入 VSCode 主题 JSON。</li>
        <li>「部件内容」编辑菜单、工具栏、状态栏、命令；命令填「内核方法」就转给 Rust 内核。</li>
        <li>「文件 → 导出工程 zip」导出。解压后 npm install → npm run tauri dev。读 hy3d / HyMd 用左侧「连接」。</li>
      </ol>
      <h3>分离约定</h3>
      <p>界面只通过 core.call / core.on 调内核；内核是独立 Rust crate（core/），不依赖 Tauri。设计结果只有 src/ui.config.json。</p>
      <h3>hy 硬规则</h3>
      <p>工具栏上侧 / 侧面可切换（HR1）；命令提示栏只手动开闭（HR2）；顶栏 28px（HR3）；图标称「工具图标」。</p>
      <h3>快捷键</h3>
      <p>Ctrl+Z / Ctrl+Y 撤销重做 · Ctrl+E 选择 / 试用 · Esc 取消选中 · Ctrl+S 保存设计 · Ctrl+Shift+E 导出 · Ctrl+Shift+P 命令面板</p>
    </div>
  );
}
