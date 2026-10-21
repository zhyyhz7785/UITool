import { appWindow } from "../platform/window";
import type { WorkbenchApi } from "./context";
import { switchScheme, TIER_NAME } from "./schemes";

export interface BuiltinCommand {
  title: string;
  category?: string;
  icon?: string;
  keybinding?: string;
  run: (api: WorkbenchApi, args?: unknown) => unknown;
}

/** 工作台自带的命令。ui.config.json 的 commands 里写同 id 可以改标题、图标、快捷键。 */
export const builtinCommands: Record<string, BuiltinCommand> = {
  "workbench.action.showCommands": {
    title: "显示所有命令",
    category: "视图",
    icon: "search",
    keybinding: "Ctrl+Shift+P",
    run: async (api) => {
      const items = api.commands
        .filter((c) => c.id !== "workbench.action.showCommands")
        .map((c) => ({ id: c.id, label: c.category ? `${c.category}: ${c.title}` : c.title, icon: c.icon, keybinding: c.keybinding }));
      const pick = await api.quickPick({ items, placeholder: "输入命令名称" });
      if (pick) await api.execute(pick.id);
    }
  },
  "workbench.action.quickOpen": {
    title: "转到文件…",
    category: "视图",
    keybinding: "Ctrl+P",
    run: (api) => api.execute("workbench.action.showCommands")
  },
  "workbench.action.toggleSidebarVisibility": { title: "切换主侧栏", category: "视图", icon: "sideleft", keybinding: "Ctrl+B", run: (api) => api.togglePart("sidebar") },
  "workbench.action.toggleAuxiliaryBar": { title: "切换辅助侧栏", category: "视图", icon: "sideright", keybinding: "Ctrl+Alt+B", run: (api) => api.togglePart("auxiliarybar") },
  "workbench.action.togglePanel": { title: "切换面板", category: "视图", icon: "bottom", keybinding: "Ctrl+J", run: (api) => api.togglePart("panel") },
  "workbench.action.toggleStatusbarVisibility": { title: "切换状态栏", category: "视图", run: (api) => api.togglePart("statusbar") },
  "workbench.action.toggleActivityBarVisibility": { title: "切换活动栏", category: "视图", run: (api) => api.togglePart("activitybar") },
  "workbench.action.toggleToolbar": { title: "切换工具栏", category: "视图", run: (api) => api.togglePart("toolbar") },
  "workbench.action.toggleToolbarPosition": {
    title: "工具栏：上侧 / 侧面",
    category: "视图",
    keybinding: "Ctrl+Shift+T",
    run: (api) =>
      api.updateConfig((c) => {
        const t = c.layout.toolbars;
        const topOn = t.top.visible && t.top.rows.length > 0;
        const sideOn = t.side.visible && t.side.rows.length > 0;
        // 只开了一处时，把这一处整个移到另一侧（HR1）
        if (topOn && !sideOn) return { ...c, layout: { ...c.layout, toolbars: { top: { ...t.top, visible: false }, side: { ...t.side, visible: true, rows: t.top.rows } } } };
        if (sideOn && !topOn) return { ...c, layout: { ...c.layout, toolbars: { side: { ...t.side, visible: false }, top: { ...t.top, visible: true, rows: t.side.rows } } } };
        return { ...c, layout: { ...c.layout, toolbars: { top: { visible: !t.top.visible, rows: t.top.rows }, side: { ...t.side, visible: !t.side.visible } } } };
      })
  },
  "workbench.action.toggleSideToolbar": {
    title: "切换侧面工具栏",
    category: "视图",
    run: (api) => api.updateConfig((c) => ({ ...c, layout: { ...c.layout, toolbars: { ...c.layout.toolbars, side: { ...c.layout.toolbars.side, visible: !c.layout.toolbars.side.visible } } } }))
  },
  "workbench.action.cyclePanelAlign": {
    title: "面板对齐：居中 / 拉通 / 靠左 / 靠右",
    category: "视图",
    run: (api) =>
      api.updateConfig((c) => {
        const order = ["center", "justify", "left", "right"] as const;
        const i = order.indexOf(c.layout.panel.align);
        return { ...c, layout: { ...c.layout, panel: { ...c.layout.panel, align: order[(i + 1) % order.length] } } };
      })
  },
  "workbench.action.togglePanelPosition": {
    title: "面板：底部 / 右侧",
    category: "视图",
    run: (api) =>
      api.updateConfig((c) => ({ ...c, layout: { ...c.layout, panel: { ...c.layout.panel, position: c.layout.panel.position === "bottom" ? "right" : "bottom" } } }))
  },
  "workbench.action.toggleSidebarPosition": {
    title: "主侧栏：左 / 右",
    category: "视图",
    run: (api) =>
      api.updateConfig((c) => ({
        ...c,
        layout: { ...c.layout, primarySideBar: { ...c.layout.primarySideBar, position: c.layout.primarySideBar.position === "left" ? "right" : "left" } }
      }))
  },
  "workbench.action.selectTheme": {
    title: "颜色主题",
    category: "首选项",
    icon: "palette",
    run: async (api) => {
      const items = api.themes.map((t) => ({ id: t.id, label: t.name, description: t.type === "dark" ? "深色" : "浅色", group: t.type === "dark" ? "深色主题" : "浅色主题" }));
      items.sort((a, b) => (a.group === b.group ? 0 : a.group === "深色主题" ? -1 : 1));
      const pick = await api.quickPick({ items, placeholder: "选择颜色主题（上下键实时预览）", activeId: api.config.theme.id, onFocus: (it) => api.setPreviewTheme(it.id) });
      api.setPreviewTheme(null);
      if (pick) api.updateConfig((c) => ({ ...c, theme: { ...c.theme, id: pick.id } }));
    }
  },
  "workbench.action.selectScheme": {
    title: "界面方案",
    category: "视图",
    icon: "layout",
    run: async (api) => {
      const schemes = api.config.schemes ?? [];
      if (!schemes.length) {
        api.notify("info", "当前界面没有可切换的方案");
        return;
      }
      const pick = await api.quickPick({
        items: schemes.map((s) => ({ id: s.id, label: s.name, description: `${TIER_NAME[s.tier]} · ${s.score} 分`, detail: s.desc })),
        placeholder: "切换界面方案（命令和按钮不变）",
        activeId: api.config.scheme
      });
      if (pick) api.updateConfig((c) => switchScheme(c, pick.id, "session"));
    }
  },
  "workbench.action.selectSkin": { title: "界面皮肤", category: "首选项", icon: "theme", run: (api) => api.execute("workbench.action.selectScheme") },
  "workbench.action.resetLayout": { title: "重置布局", category: "视图", run: (api) => api.resetLayout() },
  "workbench.action.toggleDensity": {
    title: "切换紧凑 / 舒适",
    category: "首选项",
    run: (api) => api.updateConfig((c) => ({ ...c, density: c.density === "compact" ? "comfortable" : "compact" }))
  },
  "workbench.action.openSettings": { title: "设置", category: "首选项", icon: "settings", keybinding: "Ctrl+,", run: (api) => api.openDialog("settings") },
  "workbench.action.showAbout": { title: "关于", category: "帮助", icon: "info", run: (api) => api.openDialog("about") },
  "workbench.action.showWelcome": {
    title: "欢迎",
    category: "帮助",
    icon: "home",
    run: (api) => api.openEditor({ id: "welcome", title: "欢迎", icon: "home", view: "welcome" })
  },
  "workbench.action.closeActiveEditor": {
    title: "关闭编辑器",
    category: "视图",
    keybinding: "Ctrl+W",
    run: (api) => api.state.activeEditor && api.closeEditor(api.state.activeEditor)
  },
  "workbench.action.quit": { title: "退出", category: "文件", run: (api) => windowAction(api, appWindow.close) },
  "workbench.action.minimize": { title: "最小化窗口", category: "窗口", run: (api) => windowAction(api, appWindow.minimize) },
  "workbench.action.toggleMaximize": { title: "最大化 / 还原窗口", category: "窗口", run: (api) => windowAction(api, appWindow.toggleMaximize) }
};

export function windowAction(api: WorkbenchApi, fn: () => unknown) {
  if (api.mode === "app") return fn();
  api.notify("info", "预览中不操作窗口", "导出后的应用里，这个按钮会最小化 / 最大化 / 关闭窗口。");
}

// ---------- 快捷键 ----------

const EDIT_KEYS = new Set(["Ctrl+A", "Ctrl+C", "Ctrl+V", "Ctrl+X", "Ctrl+Z", "Ctrl+Y", "Ctrl+Shift+Z"]);

export function eventToKeybinding(e: KeyboardEvent): string | null {
  if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) return null;
  let key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  if (key === " ") key = "Space";
  if (key === "Esc") key = "Escape";
  const mods = [e.ctrlKey || e.metaKey ? "Ctrl" : "", e.shiftKey && (e.key.length > 1 || /[A-Z]/i.test(e.key)) ? "Shift" : "", e.altKey ? "Alt" : ""].filter(Boolean);
  return [...mods, key].join("+");
}

export function normalizeKeybinding(k: string): string {
  const parts = k.split("+").map((p) => p.trim());
  const key = parts.pop() ?? "";
  const mods = new Set(parts.map((p) => (p.toLowerCase() === "cmd" || p.toLowerCase() === "meta" ? "Ctrl" : p[0].toUpperCase() + p.slice(1).toLowerCase())));
  return [mods.has("Ctrl") && "Ctrl", mods.has("Shift") && "Shift", mods.has("Alt") && "Alt", key.length === 1 ? key.toUpperCase() : key].filter(Boolean).join("+");
}

export function isEditable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

export function shouldSkipInEditable(binding: string): boolean {
  return EDIT_KEYS.has(binding) || !binding.includes("+");
}
