import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MutableRefObject, type ReactNode } from "react";
import { core } from "../core";
import { IconContext } from "../icons/Icon";
import { appWindow } from "../platform/window";
import { themeCssVars, type ThemeData } from "../theme/resolve";
import { builtinThemes, findTheme } from "../theme/themes";
import { builtinCommands, eventToKeybinding, isEditable, normalizeKeybinding, shouldSkipInEditable } from "./commands";
import { WorkbenchContext, type QuickPickItem, type ResolvedCommand, type UiState, type WorkbenchApi } from "./context";
import { AboutDialog } from "./overlays/AboutDialog";
import { FormDialog } from "./overlays/FormDialog";
import { Notifications } from "./overlays/Notifications";
import { QuickPick } from "./overlays/QuickPick";
import { SettingsDialog } from "./overlays/SettingsDialog";
import { resetSchemeLayout } from "./schemes";
import { ActivityBar } from "./parts/ActivityBar";
import { EditorArea } from "./parts/EditorArea";
import { MenuBar, MenuFocus } from "./parts/MenuBar";
import { Panel } from "./parts/Panel";
import { Sash } from "./parts/Sash";
import { SideBar } from "./parts/SideBar";
import { StatusBar } from "./parts/StatusBar";
import { TitleBar } from "./parts/TitleBar";
import { ToolBar } from "./parts/ToolBar";
import type { CommandHandler, PartId, UiConfig, ViewRegistry } from "./types";
import "./workbench.css";

export interface WorkbenchProps {
  config: UiConfig;
  /** 设计值，「重置布局」回到这里；不给则用首次传入的 config */
  defaultConfig?: UiConfig;
  /** 给了就是受控：布局拖动、切换显隐、换主题都通过它回写；不给则组件内部自管 */
  onConfigChange?: (config: UiConfig) => void;
  themes?: ThemeData[];
  views: ViewRegistry;
  /** 前端命令处理函数，优先于内置命令和 core 转发 */
  handlers?: Record<string, CommandHandler>;
  /** app：全局快捷键、同步窗口标题；embedded：嵌在别的页面里（例如设计器预览），快捷键只在聚焦时生效 */
  mode?: "app" | "embedded";
  scale?: number;
  className?: string;
  style?: CSSProperties;
  /** 拿到工作台接口，供组件树外的代码调用（通知、切视图、执行命令） */
  apiRef?: MutableRefObject<WorkbenchApi | null>;
  /** 预览只画这个部件。 */
  onlyPart?: PartId | null;
  /** 预览只画这个菜单。 */
  onlyMenu?: string | null;
}

type Resizable = "sidebar" | "aux" | "panel";

export function Workbench({ config, defaultConfig, onConfigChange, themes = builtinThemes, views, handlers, mode = "app", scale = 1, className, style, apiRef: externalApiRef, onlyPart, onlyMenu }: WorkbenchProps) {
  const [inner, setInner] = useState(config);
  const initial = useRef(defaultConfig ?? config);
  if (defaultConfig) initial.current = defaultConfig;
  const cfg = onConfigChange ? config : inner;
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  const rootRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState<Partial<Record<Resizable, number>>>({});

  const [state, setState] = useState<UiState>(() => ({
    activeActivity: config.activity[0]?.id ?? null,
    activeAux: config.auxiliary[0]?.id ?? null,
    activePanel: config.panel[0]?.id ?? null,
    editors: config.editors,
    activeEditor: config.editors[0]?.id ?? null,
    quickPick: null,
    dialog: null,
    sidePage: null,
    notices: [],
    status: {},
    previewTheme: null
  }));

  const editorsKey = JSON.stringify(cfg.editors);
  useEffect(() => {
    setState((s) => ({ ...s, editors: cfgRef.current.editors, activeEditor: cfgRef.current.editors[0]?.id ?? null }));
  }, [editorsKey]);

  const updateConfig = useCallback(
    (fn: (c: UiConfig) => UiConfig) => {
      const next = fn(cfgRef.current);
      cfgRef.current = next;
      if (onConfigChange) onConfigChange(next);
      else setInner(next);
    },
    [onConfigChange]
  );

  const commands = useMemo<ResolvedCommand[]>(() => {
    const map = new Map<string, ResolvedCommand>();
    for (const [id, b] of Object.entries(builtinCommands)) map.set(id, { id, title: b.title, category: b.category, icon: b.icon, keybinding: b.keybinding });
    for (const id of Object.keys(handlers ?? {})) if (!map.has(id)) map.set(id, { id, title: id });
    for (const d of cfg.commands) map.set(d.id, { ...map.get(d.id), ...d });
    return [...map.values()];
  }, [cfg.commands, handlers]);

  const themeId = state.previewTheme ?? cfg.theme.id;
  const theme = findTheme(themes, themeId);
  const vars = useMemo(() => themeCssVars(theme, cfg.theme, cfg.density), [theme, cfg.theme, cfg.density]);

  const noticeSeq = useRef(0);
  const apiRef = useRef<WorkbenchApi>(null as unknown as WorkbenchApi);

  const api: WorkbenchApi = {
    mode,
    config: cfg,
    state,
    themes,
    theme,
    views,
    commands,
    rootRef,
    scale,
    updateConfig,
    resetLayout: () => updateConfig((c) => resetSchemeLayout(c, initial.current.layout)),
    findCommand: (id) => commands.find((c) => c.id === id),
    async execute(id, args) {
      try {
        const handler = handlers?.[id];
        if (handler) return void (await handler(args));
        const builtin = builtinCommands[id];
        if (builtin) return void (await builtin.run(apiRef.current, args));
        const dialog = cfgRef.current.dialogs?.find((d) => d.command === id);
        if (dialog) {
          apiRef.current.openDialog(dialog.id);
          return;
        }
        const def = cfgRef.current.commands.find((c) => c.id === id);
        if (def?.core) {
          try {
            await core.call(def.core, args ?? def.params);
          } catch (e) {
            const msg = (e as { message?: string })?.message ?? String(e);
            apiRef.current.notify("warning", `「${def.title}」由内核方法 ${def.core} 处理`, msg);
          }
          return;
        }
        apiRef.current.notify("info", `命令「${def?.title ?? id}」还没有实现`, "在 App.tsx 的 handlers 里注册，或在 ui.config.json 里给它指定 core 方法。");
      } catch (e) {
        apiRef.current.notify("error", `命令 ${id} 出错`, String((e as Error)?.message ?? e));
      }
    },
    showActivity(id) {
      const visible = cfgRef.current.layout.primarySideBar.visible;
      if (visible && state.activeActivity === id) apiRef.current.togglePart("sidebar");
      else {
        setState((s) => ({ ...s, activeActivity: id }));
        if (!visible) apiRef.current.togglePart("sidebar");
      }
    },
    setActiveAux: (id) => setState((s) => ({ ...s, activeAux: id })),
    setActivePanel: (id) => setState((s) => ({ ...s, activePanel: id })),
    openEditor: (item) =>
      setState((s) => ({ ...s, editors: s.editors.some((e) => e.id === item.id) ? s.editors : [...s.editors, item], activeEditor: item.id })),
    closeEditor: (id) =>
      setState((s) => {
        const idx = s.editors.findIndex((e) => e.id === id);
        const editors = s.editors.filter((e) => e.id !== id);
        const activeEditor = s.activeEditor === id ? (editors[Math.min(idx, editors.length - 1)]?.id ?? null) : s.activeEditor;
        return { ...s, editors, activeEditor };
      }),
    setActiveEditor: (id) => setState((s) => ({ ...s, activeEditor: id })),
    notify(kind, message, detail) {
      const id = ++noticeSeq.current;
      setState((s) => ({ ...s, notices: [...s.notices.slice(-4), { id, kind, message, detail }] }));
      if (kind === "info" || kind === "success") setTimeout(() => apiRef.current.dismissNotice(id), 5000);
    },
    dismissNotice: (id) => setState((s) => ({ ...s, notices: s.notices.filter((n) => n.id !== id) })),
    quickPick: (req) =>
      new Promise<QuickPickItem | undefined>((resolve) =>
        setState((s) => {
          s.quickPick?.resolve(undefined);
          return { ...s, quickPick: { ...req, resolve } };
        })
      ),
    resolveQuickPick(item) {
      const qp = apiRef.current.state.quickPick;
      setState((s) => ({ ...s, quickPick: null }));
      qp?.resolve(item);
      rootRef.current?.focus({ preventScroll: true });
    },
    setStatus: (id, patch) =>
      setState((s) => {
        const status = { ...s.status };
        if (patch) status[id] = { ...status[id], ...patch };
        else delete status[id];
        return { ...s, status };
      }),
    openDialog: (dialog) => setState((s) => ({ ...s, dialog })),
    showSidePage: (sidePage) => setState((s) => (s.sidePage === sidePage ? s : { ...s, sidePage })),
    setPreviewTheme: (previewTheme) => setState((s) => ({ ...s, previewTheme })),
    togglePart(part: PartId) {
      updateConfig((c) => {
        const L = c.layout;
        const flip = <T extends { visible: boolean }>(o: T): T => ({ ...o, visible: !o.visible });
        const layout = { ...L };
        if (part === "sidebar") layout.primarySideBar = flip(L.primarySideBar);
        else if (part === "auxiliarybar") layout.auxiliaryBar = flip(L.auxiliaryBar);
        else if (part === "panel") layout.panel = flip(L.panel);
        else if (part === "statusbar") layout.statusBar = flip(L.statusBar);
        else if (part === "activitybar") layout.activityBar = flip(L.activityBar);
        else if (part === "toolbar") {
          const any = L.toolbars.top.visible || L.toolbars.side.visible;
          layout.toolbars = {
            top: { ...L.toolbars.top, visible: any ? false : true },
            side: { ...L.toolbars.side, visible: false }
          };
        }
        return { ...c, layout };
      });
    }
  };
  apiRef.current = api;
  if (externalApiRef) externalApiRef.current = api;

  // 快捷键
  const keymap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of commands) if (c.keybinding) m.set(normalizeKeybinding(c.keybinding), c.id);
    m.set("F1", "workbench.action.showCommands");
    return m;
  }, [commands]);
  useEffect(() => {
    const target: HTMLElement | Window | null = mode === "app" ? window : rootRef.current;
    if (!target) return;
    const onKey = (ev: Event) => {
      const e = ev as KeyboardEvent;
      if (e.defaultPrevented || apiRef.current.state.quickPick) return;
      const binding = eventToKeybinding(e);
      if (!binding) return;
      const id = keymap.get(binding);
      if (!id || (isEditable(e.target) && shouldSkipInEditable(binding))) return;
      e.preventDefault();
      e.stopPropagation();
      void apiRef.current.execute(id);
    };
    target.addEventListener("keydown", onKey);
    return () => target.removeEventListener("keydown", onKey);
  }, [keymap, mode]);

  useEffect(() => {
    if (mode === "app") void appWindow.setTitle(cfg.app.title);
  }, [mode, cfg.app.title]);

  // ---------- 布局 ----------
  const L = cfg.layout;
  const size = (k: Resizable, v: number) => live[k] ?? v;
  const commit = (k: Resizable, v: number) => {
    setLive((s) => ({ ...s, [k]: undefined }));
    updateConfig((c) => {
      const layout = { ...c.layout };
      if (k === "sidebar") layout.primarySideBar = { ...layout.primarySideBar, width: v };
      if (k === "aux") layout.auxiliaryBar = { ...layout.auxiliaryBar, width: v };
      if (k === "panel") layout.panel = { ...layout.panel, size: v };
      return { ...c, layout };
    });
  };
  const sash = (k: Resizable, axis: "x" | "y", sign: 1 | -1, value: number, min: number, max: number) => (
    <Sash key={`sash-${k}`} axis={axis} sign={sign} value={value} min={min} max={max} scale={scale} onChange={(v) => setLive((s) => ({ ...s, [k]: v }))} onCommit={(v) => commit(k, v)} />
  );

  const left = L.primarySideBar.position === "left";
  const showActivity = L.activityBar.visible && L.activityBar.position === "side" && cfg.activity.length > 0;
  const showSidebar = L.primarySideBar.visible && cfg.activity.length > 0;
  const showAux = L.auxiliaryBar.visible && cfg.auxiliary.length > 0;
  const showPanel = L.panel.visible && cfg.panel.length > 0;
  const sideW = size("sidebar", L.primarySideBar.width);
  const auxW = size("aux", L.auxiliaryBar.width);
  const panelS = size("panel", L.panel.size);

  const activity = showActivity && <ActivityBar key="activity" side={left ? "left" : "right"} />;
  const sidebar = showSidebar && (
    <div key="sidebar" className="wb-flexpart" style={{ width: sideW }}>
      <SideBar part="sidebar" />
    </div>
  );
  const aux = showAux && (
    <div key="aux" className="wb-flexpart" style={{ width: auxW }}>
      <SideBar part="auxiliarybar" />
    </div>
  );
  const panelBottom = L.panel.position === "bottom";
  const align = L.panel.align;
  const panelSash = showPanel ? sash("panel", panelBottom ? "y" : "x", -1, panelS, 80, 900) : null;
  const panelBox = showPanel && (
    <div key="panel" className="wb-flexpart" style={panelBottom ? { height: panelS } : { width: panelS }}>
      <Panel />
    </div>
  );
  const editor = <EditorArea key="editor" />;
  // 居中：面板只占编辑区；右侧位置：面板在编辑区右边。拉通 / 靠左 / 靠右在外层处理。
  const panelInCenter = showPanel && (!panelBottom || align === "center");
  const center = (
    <div key="center" className={"wb-center " + (panelInCenter && panelBottom ? "wb-col" : "wb-row")}>
      {editor}
      {panelInCenter && panelSash}
      {panelInCenter && panelBox}
    </div>
  );

  const sideSash = showSidebar && sash("sidebar", "x", left ? 1 : -1, sideW, 160, 640);
  const auxSash = showAux && sash("aux", "x", left ? -1 : 1, auxW, 160, 640);
  const row = left ? [activity, sidebar, sideSash, center, auxSash, aux] : [aux, auxSash, center, sideSash, sidebar, activity];

  // 靠左：面板铺在中线以左（含左侧栏）；靠右：铺在中线以右；拉通：整行下面铺满。
  let body: ReactNode = row;
  if (showPanel && panelBottom && align !== "center") {
    const centerAt = row.indexOf(center);
    if (align === "justify") {
      body = (
        <div key="justified" className="wb-center wb-col">
          <div className="wb-row wb-flexpart">{row}</div>
          {panelSash}
          {panelBox}
        </div>
      );
    } else {
      const cut = align === "left" ? centerAt + 1 : centerAt;
      const head = row.slice(0, cut);
      const tail = row.slice(cut);
      const stacked = (
        <div key="stacked" className="wb-center wb-col">
          <div className="wb-row wb-flexpart">{align === "left" ? head : tail}</div>
          {panelSash}
          {panelBox}
        </div>
      );
      body = align === "left" ? [...(stacked ? [stacked] : []), ...tail] : [...head, stacked];
    }
  }

  const showTopBar = L.toolbars.top.visible && L.toolbars.top.rows.length > 0;
  const showSideBar = L.toolbars.side.visible && L.toolbars.side.rows.length > 0;
  const toolbarPos = showTopBar && showSideBar ? "both" : showSideBar ? "side" : showTopBar ? "top" : "none";

  const title = (
    <>
      {L.titleBar.style === "custom" ? <TitleBar /> : L.titleBar.menu !== "hidden" && <MenuBar standalone />}
      {L.titleBar.style === "custom" && L.titleBar.menu === "ownrow" && <MenuBar standalone />}
    </>
  );
  const toolbars = (
    <>
      {showTopBar && <ToolBar which="top" />}
      {showSideBar && <ToolBar which="side" />}
    </>
  );
  const focused =
    onlyMenu ? <MenuFocus menuId={onlyMenu} /> :
    onlyPart === "titlebar" ? title :
    onlyPart === "toolbar" ? toolbars :
    onlyPart === "activitybar" ? <ActivityBar side={left ? "left" : "right"} /> :
    onlyPart === "sidebar" ? <div className="wb-only"><SideBar part="sidebar" /></div> :
    onlyPart === "auxiliarybar" ? <div className="wb-only"><SideBar part="auxiliarybar" /></div> :
    onlyPart === "editor" ? <EditorArea /> :
    onlyPart === "panel" ? <Panel /> :
    onlyPart === "statusbar" ? <StatusBar /> :
    null;

  return (
    <WorkbenchContext.Provider value={api}>
      <IconContext.Provider value={{ config: cfg.icons }}>
      <div
        ref={rootRef}
        className={"wb-root" + (className ? " " + className : "")}
        style={{ ...(vars as CSSProperties), ...style }}
        data-density={cfg.density}
        data-theme-type={theme.type}
        data-toolbar-pos={toolbarPos}
        data-panel-align={align}
        tabIndex={mode === "embedded" ? -1 : undefined}
      >
        {focused ?? (
          <>
            {title}
            {showTopBar && <ToolBar which="top" />}
            <div className="wb-main">
              {showSideBar && L.toolbars.side.position === "left" && <ToolBar which="side" />}
              {body}
              {showSideBar && L.toolbars.side.position === "right" && <ToolBar which="side" />}
            </div>
            {L.statusBar.visible && <StatusBar />}
          </>
        )}
        {state.quickPick && <QuickPick />}
        {state.dialog === "settings" && <SettingsDialog />}
        {state.dialog === "about" && <AboutDialog />}
        {state.dialog && state.dialog !== "settings" && state.dialog !== "about" && cfg.dialogs?.some((d) => d.id === state.dialog) && (
          <FormDialog key={state.dialog} def={cfg.dialogs.find((d) => d.id === state.dialog)!} />
        )}
        <Notifications />
      </div>
      </IconContext.Provider>
    </WorkbenchContext.Provider>
  );
}
