/**
 * 颜色注册表：键名沿用 VSCode 主题（workbench colors），另加一组 base.* 基础键。
 * 主题文件只需给出部分键，缺的键按这里的默认值逐级派生，和 VSCode 的做法一致。
 * 默认值写法：
 *   "#RRGGBB" / "rgba(...)" / "transparent"  字面颜色
 *   "base.accent"                              引用另一个键
 *   alpha("base.accent", .5) 等函数              由其它键计算
 * 组件只用 var(--vscode-<键名把 . 换成 ->)，不写死色值。
 */
import { luma, mix, parseColor, withAlpha, type RGBA } from "./color";

export type ThemeType = "dark" | "light";
export type Getter = (key: string) => RGBA | null;
export type ColorDefault = string | null | ((get: Getter, type: ThemeType) => RGBA | null);

export interface ColorKey {
  id: string;
  group: string;
  desc: string;
  dark: ColorDefault;
  light: ColorDefault;
}

export const alpha = (key: string, f: number | [number, number]): ColorDefault => (get, type) => {
  const c = get(key);
  return c && withAlpha(c, Array.isArray(f) ? (type === "dark" ? f[0] : f[1]) : f);
};
export const mixWith = (key: string, target: string, t: number | [number, number]): ColorDefault => (get, type) => {
  const c = get(key);
  const to = parseColor(target) ?? get(target);
  return c && to && mix(c, to, Array.isArray(t) ? (type === "dark" ? t[0] : t[1]) : t);
};
export const readableOn = (key: string): ColorDefault => (get) => {
  const c = get(key);
  return c ? (luma(c) > 0.62 ? [17, 17, 17, 1] : [255, 255, 255, 1]) : null;
};

const list: ColorKey[] = [];
function k(group: string, id: string, desc: string, dark: ColorDefault, light: ColorDefault = dark) {
  list.push({ id, group, desc, dark, light });
}

// ---- 基础（hy 令牌对应的语义色；其余键都从这里派生）----
k("基础", "base.accent", "强调色。只改这一项，按钮、焦点、徽标、选中、状态栏等跟着变", "#0A84FF", "#0071E3");
k("基础", "base.accentHover", "强调色悬停", mixWith("base.accent", "#FFFFFF", [0.18, 0.08]));
k("基础", "base.accentPress", "强调色按下", mixWith("base.accent", "#000000", [0.12, 0.14]));
k("基础", "base.accentSoft", "强调色浅底（选中行等）", alpha("base.accent", [0.22, 0.12]));
k("基础", "base.onAccent", "强调色上的文字", readableOn("base.accent"));
k("基础", "base.window", "窗口底色", "#181818", "#F5F5F7");
k("基础", "base.header", "顶栏 / 页签条底色", "#1F1F1F", "#FFFFFF");
k("基础", "base.panel", "面板底色", "#181818", "#FFFFFF");
k("基础", "base.raised", "浮起层（菜单、弹窗）", "#252526", "#FFFFFF");
k("基础", "base.input", "输入框底色", "#1F1F1F", "#FFFFFF");
k("基础", "base.editor", "文档 / 编辑区底色", "#1F1F1F", "#FFFFFF");
k("基础", "base.sidebar", "侧栏底色", "#181818", "#F0F0F2");
k("基础", "base.activity", "活动栏底色", "#181818", "#E8E8EC");
k("基础", "base.canvas", "画布 / 视口底色", "#141414", "#1A1A1A");
k("基础", "base.hover", "悬停叠加", "rgba(255,255,255,.06)", "rgba(0,0,0,.05)");
k("基础", "base.active", "按下 / 非焦点选中叠加", "rgba(255,255,255,.10)", "rgba(0,0,0,.09)");
k("基础", "base.control", "控件底色", "#2B2B2B", "#F0F0F2");
k("基础", "base.controlHover", "控件悬停", "#333333", "#E5E5EA");
k("基础", "base.status", "状态栏底色（默认跟强调色）", "base.accent");
k("基础", "base.statusForeground", "状态栏文字", "base.onAccent");
k("基础", "base.border", "分隔线", "#2B2B2B", "#E5E5E5");
k("基础", "base.borderStrong", "强分隔线 / 控件边框", "#3C3C3C", "#D2D2D7");
k("基础", "base.success", "成功", "#30D158", "#248A3D");
k("基础", "base.scrim", "遮罩", "rgba(0,0,0,.5)", "rgba(0,0,0,.35)");
k("基础", "foreground", "主文字", "#E6E6E6", "#1D1D1F");
k("基础", "descriptionForeground", "次要文字", "#A6A6A6", "#6E6E73");
k("基础", "disabledForeground", "弱化文字", "#7A7A7A", "#86868B");
k("基础", "errorForeground", "错误", "#FF453A", "#FF3B30");
k("基础", "editorWarning.foreground", "警告", "#FFB340", "#C77C02");
k("基础", "icon.foreground", "图标", "foreground");
k("基础", "focusBorder", "焦点框", "base.accent");
k("基础", "widget.border", "浮层边框", "base.border");
k("基础", "widget.shadow", "浮层阴影色", "rgba(0,0,0,.36)", "rgba(0,0,0,.16)");
k("基础", "selection.background", "文本选区", "base.accentSoft");
k("基础", "sash.hoverBorder", "分割条悬停", "base.accent");
k("基础", "scrollbarSlider.background", "滚动条", "rgba(160,160,160,.30)", "rgba(100,100,100,.35)");
k("基础", "scrollbarSlider.hoverBackground", "滚动条悬停", "rgba(160,160,160,.50)", "rgba(100,100,100,.55)");
k("基础", "scrollbarSlider.activeBackground", "滚动条拖动", "scrollbarSlider.hoverBackground");
k("基础", "textLink.foreground", "链接", "base.accent");
k("基础", "textCodeBlock.background", "代码块底色", "base.control");
k("基础", "progressBar.background", "进度条", "base.accent");
k("基础", "badge.background", "徽标底色", "base.accent");
k("基础", "badge.foreground", "徽标文字", "base.onAccent");
k("基础", "toolbar.hoverBackground", "图标按钮悬停", "base.hover");
k("基础", "toolbar.activeBackground", "图标按钮按下", "base.active");
k("基础", "keybindingLabel.background", "快捷键标签底色", "base.control");
k("基础", "keybindingLabel.foreground", "快捷键标签文字", "descriptionForeground");
k("基础", "keybindingLabel.border", "快捷键标签边框", "base.border");

// ---- 按钮 / 输入 ----
k("按钮", "button.background", "主按钮", "base.accent");
k("按钮", "button.foreground", "主按钮文字", "base.onAccent");
k("按钮", "button.hoverBackground", "主按钮悬停", "base.accentHover");
k("按钮", "button.secondaryBackground", "次按钮", "base.control");
k("按钮", "button.secondaryForeground", "次按钮文字", "foreground");
k("按钮", "button.secondaryHoverBackground", "次按钮悬停", "base.controlHover");
k("输入", "input.background", "输入框", "base.input");
k("输入", "input.foreground", "输入框文字", "foreground");
k("输入", "input.border", "输入框边框", "base.borderStrong");
k("输入", "input.placeholderForeground", "占位文字", "disabledForeground");
k("输入", "inputOption.activeBorder", "输入选项激活边框", "base.accent");
k("输入", "inputOption.activeBackground", "输入选项激活底色", "base.accentSoft");
k("输入", "dropdown.background", "下拉框", "base.input");
k("输入", "dropdown.foreground", "下拉框文字", "foreground");
k("输入", "dropdown.border", "下拉框边框", "base.borderStrong");
k("输入", "checkbox.background", "复选框", "base.input");
k("输入", "checkbox.border", "复选框边框", "base.borderStrong");
k("输入", "checkbox.foreground", "复选框勾", "foreground");

// ---- 列表 / 树 ----
k("列表", "list.activeSelectionBackground", "选中行", "base.accentSoft");
k("列表", "list.activeSelectionForeground", "选中行文字", "foreground");
k("列表", "list.inactiveSelectionBackground", "非焦点选中行", "base.active");
k("列表", "list.hoverBackground", "悬停行", "base.hover");
k("列表", "list.focusOutline", "焦点行描边", "focusBorder");
k("列表", "list.highlightForeground", "匹配高亮", "base.accent");
k("列表", "tree.indentGuidesStroke", "树缩进线", "base.borderStrong");

// ---- 标题栏 / 菜单 ----
k("标题栏", "titleBar.activeBackground", "标题栏", "base.header");
k("标题栏", "titleBar.activeForeground", "标题栏文字", "foreground");
k("标题栏", "titleBar.inactiveBackground", "失焦标题栏", "titleBar.activeBackground");
k("标题栏", "titleBar.inactiveForeground", "失焦标题栏文字", "descriptionForeground");
k("标题栏", "titleBar.border", "标题栏底边", "base.border");
k("标题栏", "commandCenter.background", "命令中心", "base.control");
k("标题栏", "commandCenter.foreground", "命令中心文字", "descriptionForeground");
k("标题栏", "commandCenter.border", "命令中心边框", "base.border");
k("标题栏", "commandCenter.activeBackground", "命令中心悬停", "base.controlHover");
k("菜单", "menubar.selectionBackground", "菜单栏选中", "base.hover");
k("菜单", "menubar.selectionForeground", "菜单栏选中文字", "foreground");
k("菜单", "menu.background", "菜单", "base.raised");
k("菜单", "menu.foreground", "菜单文字", "foreground");
k("菜单", "menu.selectionBackground", "菜单选中", "base.accent");
k("菜单", "menu.selectionForeground", "菜单选中文字", "base.onAccent");
k("菜单", "menu.separatorBackground", "菜单分隔线", "base.border");
k("菜单", "menu.border", "菜单边框", "base.borderStrong");

// ---- 工具栏（hy 硬规则：上侧 / 侧面可切）----
k("工具栏", "toolbar.background", "主工具栏底色", "base.header");
k("工具栏", "toolbar.border", "主工具栏边线", "base.border");
k("工具栏", "toolbar.activeForeground", "按下的工具", "base.accent");

// ---- 活动栏 / 侧栏 ----
k("活动栏", "activityBar.background", "活动栏", "base.activity");
k("活动栏", "activityBar.foreground", "当前项图标", "foreground");
k("活动栏", "activityBar.inactiveForeground", "其它项图标", "disabledForeground");
k("活动栏", "activityBar.activeBorder", "当前项指示条", "base.accent");
k("活动栏", "activityBar.activeBackground", "当前项底色", "transparent");
k("活动栏", "activityBar.border", "活动栏边线", "base.border");
k("活动栏", "activityBarBadge.background", "活动栏徽标", "base.accent");
k("活动栏", "activityBarBadge.foreground", "活动栏徽标文字", "base.onAccent");
k("侧栏", "sideBar.background", "侧栏", "base.sidebar");
k("侧栏", "sideBar.foreground", "侧栏文字", "foreground");
k("侧栏", "sideBar.border", "侧栏边线", "base.border");
k("侧栏", "sideBarTitle.foreground", "侧栏标题", "descriptionForeground");
k("侧栏", "sideBarSectionHeader.background", "分节标题底色", "transparent");
k("侧栏", "sideBarSectionHeader.foreground", "分节标题文字", "foreground");
k("侧栏", "sideBarSectionHeader.border", "分节标题边线", "base.border");

// ---- 编辑区 / 页签 ----
k("页签", "editorGroupHeader.tabsBackground", "页签条", "base.panel");
k("页签", "editorGroupHeader.tabsBorder", "页签条底边", "base.border");
k("页签", "tab.activeBackground", "当前页签", "base.editor");
k("页签", "tab.activeForeground", "当前页签文字", "foreground");
k("页签", "tab.inactiveBackground", "其它页签", "editorGroupHeader.tabsBackground");
k("页签", "tab.inactiveForeground", "其它页签文字", "descriptionForeground");
k("页签", "tab.hoverBackground", "页签悬停", "base.hover");
k("页签", "tab.border", "页签间隔线", "base.border");
k("页签", "tab.activeBorderTop", "当前页签顶线", "base.accent");
k("编辑器", "editor.background", "编辑区", "base.editor");
k("编辑器", "editor.foreground", "编辑区文字", "foreground");
k("编辑器", "editorLineNumber.foreground", "行号", "disabledForeground");
k("编辑器", "editorLineNumber.activeForeground", "当前行号", "foreground");
k("编辑器", "editor.lineHighlightBackground", "当前行", "base.hover");
k("编辑器", "editor.selectionBackground", "选区", "base.accentSoft");
k("编辑器", "editorCursor.foreground", "光标", "base.accent");
k("编辑器", "editorWidget.background", "编辑区浮件", "base.raised");
k("编辑器", "editorWidget.border", "编辑区浮件边框", "base.border");
k("编辑器", "editorGroup.border", "编辑组分隔", "base.border");
k("编辑器", "breadcrumb.background", "面包屑", "editor.background");
k("编辑器", "breadcrumb.foreground", "面包屑文字", "descriptionForeground");
k("编辑器", "breadcrumb.focusForeground", "面包屑焦点", "foreground");
k("编辑器", "canvas.background", "画布 / 视口", "base.canvas");

// ---- 面板 ----
k("面板", "panel.background", "底部面板", "base.panel");
k("面板", "panel.border", "面板边线", "base.border");
k("面板", "panelTitle.activeForeground", "当前面板页签", "foreground");
k("面板", "panelTitle.inactiveForeground", "其它面板页签", "descriptionForeground");
k("面板", "panelTitle.activeBorder", "当前面板页签下划线", "base.accent");
k("面板", "terminal.background", "终端", "panel.background");
k("面板", "terminal.foreground", "终端文字", "foreground");

// ---- 状态栏 ----
k("状态栏", "statusBar.background", "状态栏", "base.status");
k("状态栏", "statusBar.foreground", "状态栏文字", "base.statusForeground");
k("状态栏", "statusBar.border", "状态栏顶边", "transparent");
k("状态栏", "statusBarItem.hoverBackground", "状态栏项悬停", alpha("statusBar.foreground", 0.14));
k("状态栏", "statusBarItem.remoteBackground", "最左侧强调项", "base.accentPress");
k("状态栏", "statusBarItem.remoteForeground", "最左侧强调项文字", "base.onAccent");

// ---- 快速输入 / 通知 ----
k("快速输入", "quickInput.background", "命令面板", "base.raised");
k("快速输入", "quickInput.foreground", "命令面板文字", "foreground");
k("快速输入", "quickInputList.focusBackground", "命令面板选中", "base.accentSoft");
k("快速输入", "quickInputList.focusForeground", "命令面板选中文字", "foreground");
k("快速输入", "pickerGroup.foreground", "分组标题", "base.accent");
k("快速输入", "pickerGroup.border", "分组分隔线", "base.border");
k("通知", "notifications.background", "通知", "base.raised");
k("通知", "notifications.foreground", "通知文字", "foreground");
k("通知", "notifications.border", "通知边框", "base.borderStrong");
k("通知", "notificationsInfoIcon.foreground", "信息图标", "base.accent");
k("通知", "notificationsWarningIcon.foreground", "警告图标", "editorWarning.foreground");
k("通知", "notificationsErrorIcon.foreground", "错误图标", "errorForeground");
k("通知", "notificationsSuccessIcon.foreground", "成功图标", "base.success");
k("通知", "settings.modifiedItemIndicator", "已修改设置指示条", "base.accent");

export const colorRegistry: readonly ColorKey[] = list;
export const colorKeyMap: ReadonlyMap<string, ColorKey> = new Map(list.map((c) => [c.id, c]));
export const colorGroups: readonly string[] = [...new Set(list.map((c) => c.group))];

/** 每个界面部件相关的颜色键前缀，设计器和设置页用来筛选。 */
export const partColorPrefixes: Record<string, string[]> = {
  titlebar: ["titleBar.", "commandCenter.", "menubar.", "menu."],
  toolbar: ["toolbar."],
  activitybar: ["activityBar.", "activityBarBadge."],
  sidebar: ["sideBar.", "sideBarTitle.", "sideBarSectionHeader.", "list.", "tree."],
  auxiliarybar: ["sideBar.", "sideBarTitle.", "sideBarSectionHeader."],
  editor: ["editor.", "editorLineNumber.", "editorCursor.", "editorWidget.", "editorGroup.", "editorGroupHeader.", "tab.", "breadcrumb.", "canvas."],
  panel: ["panel.", "panelTitle.", "terminal."],
  statusbar: ["statusBar.", "statusBarItem."]
};

export function cssVarName(key: string): string {
  return "--vscode-" + key.replace(/\./g, "-");
}
