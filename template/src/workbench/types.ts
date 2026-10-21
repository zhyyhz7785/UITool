import type { ComponentType } from "react";
import type { Density, ThemeSelection } from "../theme/resolve";

/**
 * ui.config.json 的结构（v2）。UITool 设计器产出这份文件；界面只读它来决定布局、尺寸、配色、各区域的按钮和菜单。
 * 行为不在这里：命令要么转给内核（core 字段），要么在 App.tsx 里注册前端处理函数。
 */
export type DialogStyle = "modal" | "sheet" | "wizard";
export type SchemeTier = "best" | "good" | "basic";

/** 一套界面方案里会变的部分。命令、菜单、弹窗定义不在这里，同一工作类型共用。 */
export interface SchemeUi {
  theme: ThemeSelection;
  density: Density;
  icons: IconConfig;
  layout: LayoutConfig;
  activity: SideContainer[];
  auxiliary: SideContainer[];
  panel: PaneTab[];
  editors: EditorItem[];
  statusBar: ItemZones;
}

export interface UiScheme {
  id: string;
  tier: SchemeTier;
  name: string;
  desc: string;
  /** 效率 + 审美 + 学习，见 Docs/Research/工作类型三档评定.md */
  score: number;
  source?: string;
  /** 用户选定并在调整的那一套 */
  tuned?: boolean;
  ui: SchemeUi;
  /** 运行中切换走之后留下的呈现（含拖过的尺寸），不影响 ui 里的设计值 */
  live?: SchemeUi;
  /** 这一档自己的顶栏菜单。切换方案时换上；没有就保持当前菜单。 */
  menus?: Menu[];
}

export type DialogFieldType = "text" | "number" | "select" | "toggle" | "color" | "table";

export interface DialogField {
  id: string;
  label: string;
  type: DialogFieldType;
  group?: string;
  placeholder?: string;
  value?: string | number | boolean;
  options?: { value: string; label: string }[];
  columns?: string[];
  rows?: string[][];
}

export interface DialogAction {
  id: string;
  label: string;
  primary?: boolean;
  /** 菜单里的分隔线。为真时不显示成按钮 */
  separator?: boolean;
}

/** 预览怎么画。不填当作 form（表单）。 */
export type DialogKind = "form" | "menu" | "list" | "banner" | "system";

export interface DialogDef {
  id: string;
  title: string;
  /** 菜单和命令面板里的命令，执行即打开此弹窗 */
  command: string;
  style?: DialogStyle;
  /** 预览形态。form 表单，menu 菜单，list 可筛选列表，banner 顶栏提示条，system 系统框示意 */
  kind?: DialogKind;
  /** 弹窗列表里的分组名 */
  folder?: string;
  /** 抄录来源，设计器里只读 */
  source?: string;
  groups?: string[];
  /** 字段上面的说明。关于、选项这类没有输入项的弹窗用它 */
  body?: string;
  fields: DialogField[];
  actions: DialogAction[];
}

/** 副页面上一块分区里的一条文案。group 是功能区分组名，如绘图、修改。 */
export interface SidePageItem {
  id: string;
  label: string;
  group?: string;
}

/**
 * 分区在窗口里怎么画。
 * ribbon 横条按钮，tabs 页签，swatches 样式条，search 检索框，list 竖排条目，
 * canvas 画板，status 底栏，paper 纸面，grid 格子，aside 侧栏。
 */
export type SidePagePresent = "ribbon" | "tabs" | "swatches" | "search" | "list" | "canvas" | "status" | "paper" | "grid" | "aside";

export interface SidePageRegion {
  id: string;
  title: string;
  present: SidePagePresent;
  /** 只在这个页签被点中时显示。值是页签上的文案。 */
  tab?: string;
  /** aside 或侧栏页签放在右侧。缺省在左。 */
  place?: "start" | "end";
  /** ribbon 贴在窗口底部，如计算条。 */
  edge?: "bottom";
  items: SidePageItem[];
}

/** 预设点不开、要单独调整的整页。不进方案快照。 */
export interface SidePageDef {
  id: string;
  title: string;
  source: string;
  regions: SidePageRegion[];
}

export interface UiConfig {
  version: 2;
  app: AppMeta;
  theme: ThemeSelection;
  density: Density;
  layout: LayoutConfig;
  /** 工作类型 id。同一类型的方案共用命令、菜单、视图和弹窗 */
  workType?: string;
  /** 当前界面方案 id，对应 schemes */
  scheme?: string;
  schemes?: UiScheme[];
  dialogs?: DialogDef[];
  /** 预设点不开的整页。和弹窗一样不进方案快照。 */
  sidePages?: SidePageDef[];
  /** 图标风格：全局一套，区域可单独覆盖，单个语义图标可再替换 */
  icons: IconConfig;
  /** 活动栏条目，每项是主侧栏的一个视图容器（里面再分上下分区） */
  activity: SideContainer[];
  /** 辅助侧栏的视图容器 */
  auxiliary: SideContainer[];
  /** 面板页签 */
  panel: PaneTab[];
  /** 启动时打开的编辑器页签 */
  editors: EditorItem[];
  menus: Menu[];
  /** 状态栏：左 / 中 / 右 */
  statusBar: ItemZones;
  commands: CommandDef[];
}

export interface AppMeta {
  name: string;
  title: string;
  identifier: string;
  version: string;
  description: string;
  icon: string;
  /** 应用图标图片。有它时，标题栏、关于和空编辑区用这张图，不再用 icon 那个笔画图标。 */
  iconImage?: string;
}

export type IconStyleId = "hy" | "lucide" | "tabler" | "phosphor" | "fluent" | "material" | "codicons";

/** 图标风格可以单独指定的功能区域 */
export type IconArea = "titlebar" | "menu" | "toolbar" | "activitybar" | "sidebar" | "editor" | "panel" | "statusbar";

export interface IconConfig {
  style: IconStyleId;
  areas: Partial<Record<IconArea, IconStyleId>>;
  /** 语义图标 id → 替换成的图标（另一种风格的同名图标，或 lu: / ta: 全库引用） */
  overrides: Record<string, string>;
}

/** 按钮上画图标、文字，或两者一起。 */
export type ItemDisplay = "both" | "icon" | "text";

/** 一颗可摆放的按钮或状态项。 */
export interface ToolItem {
  id: string;
  command?: string;
  /** 语义图标 id（如 save），或 lu: / ta: 直接引用 */
  icon?: string;
  text?: string;
  tooltip?: string;
  separator?: boolean;
  kind?: "normal" | "accent";
  /** 缺省：有图标就画图标，有文字就画文字。 */
  display?: ItemDisplay;
  /** 右键拉出的其它命令。 */
  menu?: string[];
}

/** 一条按钮带的三个区：从左（上）排 / 中间排 / 从右（下）排。 */
export interface ItemZones {
  start: ToolItem[];
  center: ToolItem[];
  end: ToolItem[];
}

/** 功能区面板上的一颗按钮。menu 是下拉里的其它命令，不含自己。 */
export interface ToolSlot {
  command: string;
  size: "big" | "small";
  menu?: string[];
  /** 面上显示的字。缺省用命令名。 */
  text?: string;
  /** 这颗按钮自己的图标。缺省用命令的图标。 */
  icon?: string;
  display?: ItemDisplay;
  /** arrow 点箭头下拉；right 右键拉出。缺省 arrow。 */
  menuOn?: "arrow" | "right";
}

/** 功能区一页里的一块面板。commands 是全部命令。slots 是面上的按钮，没有列进 slots 的命令进面板底部的下拉。 */
export interface ToolGroup {
  id: string;
  title: string;
  commands: string[];
  slots?: ToolSlot[];
  /** 面板名旁边的启动命令 */
  launcher?: string;
}

/** 工具栏的一排。ribbon 时 title 是页签名。有 groups 时按面板分列，不再用左 / 中 / 右。 */
export interface ToolRow extends ItemZones {
  id: string;
  title?: string;
  groups?: ToolGroup[];
}

export type ToolbarStyle = "icon" | "labeled" | "ribbon";

export interface ToolbarConfig {
  visible: boolean;
  rows: ToolRow[];
  /** icon 只有图标；labeled 图标加文字；ribbon 每排一个页签（用在上侧） */
  style?: ToolbarStyle;
}

export interface SideToolbarConfig extends ToolbarConfig {
  position: "left" | "right";
}

export interface LayoutConfig {
  titleBar: {
    /** custom：自绘标题栏（无系统边框）；native：系统标题栏 */
    style: "custom" | "native";
    /** inline 嵌在标题栏里；ownrow 单独一行；hidden 不显示 */
    menu: "inline" | "ownrow" | "hidden";
    commandCenter: boolean;
    /** 标题栏右侧的搜索框。和中间的命令中心分开，可以同时关着命令中心、开着搜索框。 */
    search?: boolean;
    /** 标题栏左侧的应用图标 */
    appIcon: boolean;
    left: ToolItem[];
    /** 标题栏中间、命令中心或标题文字旁边的按钮 */
    center?: ToolItem[];
    right: ToolItem[];
    /** 中间标题。可用 {doc}、{app}。缺省用应用标题或文档名。 */
    titleText?: string;
    /** 最小化和最大化。缺省都显示。关闭按钮始终保留。 */
    winControls?: { min: boolean; max: boolean };
  };
  activityBar: { visible: boolean; position: "side" | "top"; bottom: ToolItem[] };
  primarySideBar: { visible: boolean; position: "left" | "right"; width: number };
  auxiliaryBar: { visible: boolean; width: number };
  panel: {
    visible: boolean;
    position: "bottom" | "right";
    size: number;
    /** 底部时的横向对齐：居中只占编辑区，拉通整窗，靠左 / 靠右 */
    align: "center" | "justify" | "left" | "right";
    actions: ToolItem[];
  };
  editor: {
    tabs: boolean;
    breadcrumbs: boolean;
    tabActions: ToolItem[];
    breadcrumbActions: ToolItem[];
  };
  statusBar: { visible: boolean };
  /** 上侧和侧面可以同时开。只开一处时 Ctrl+Shift+T 把整条移到另一侧（HR1） */
  toolbars: { top: ToolbarConfig; side: SideToolbarConfig };
  /** 本方案里配置弹窗的默认呈现。单个弹窗可以用 DialogDef.style 覆盖 */
  dialogStyle?: DialogStyle;
}

/** 侧栏里上下堆叠的一个分区。 */
export interface ViewSection {
  id: string;
  title: string;
  view: string;
  icon?: string;
  /** top 排在上组（从上往下），bottom 排在下组 */
  anchor: "top" | "bottom";
  collapsed?: boolean;
  /** 高度；不设则弹性占满 */
  size?: number;
  header: boolean;
  actions: ToolItem[];
}

/** 主侧栏或辅助侧栏的一个视图容器。 */
export interface SideContainer {
  id: string;
  title: string;
  icon: string;
  badge?: number;
  /** show 标题+图标，icon 只显示图标，hidden 不显示标题栏 */
  header: "show" | "icon" | "hidden";
  headerActions: ToolItem[];
  /** 下组的方向：down 从上往下，up 从下往上 */
  bottomOrder: "down" | "up";
  /** 隐身：标题按钮平时看不见，鼠标移到标题栏才显现。 */
  ghost?: boolean;
  sections: ViewSection[];
}

export interface PaneTab {
  id: string;
  title: string;
  icon: string;
  view: string;
  badge?: number;
}

export interface EditorItem {
  id: string;
  title: string;
  icon?: string;
  view: string;
  data?: unknown;
  dirty?: boolean;
}

/** 色板里的一格。color 为空表示默认或无。 */
export interface MenuSwatch {
  id: string;
  label: string;
  color: string;
}

export interface MenuItem {
  id?: string;
  command?: string;
  title?: string;
  separator?: boolean;
  display?: ItemDisplay;
  /** 子菜单。 */
  items?: MenuItem[];
  /** 色块。和 items 分开：色板不是一串命令。 */
  swatches?: MenuSwatch[];
}

export interface Menu {
  id: string;
  title: string;
  items: MenuItem[];
  /** 隐身：不排进标题栏。进入当前模块仍能看到。 */
  ghost?: boolean;
}

export interface CommandDef {
  id: string;
  title: string;
  category?: string;
  icon?: string;
  keybinding?: string;
  /** 转给内核的方法名，执行命令即 core.call(core, params) */
  core?: string;
  params?: unknown;
}

export type PartId = "titlebar" | "toolbar" | "activitybar" | "sidebar" | "editor" | "panel" | "auxiliarybar" | "statusbar";

export interface ViewProps {
  id: string;
  data?: unknown;
}

export type ViewRegistry = Record<string, ComponentType<ViewProps>>;

export type CommandHandler = (args?: unknown) => unknown | Promise<unknown>;

export const ICON_STYLES: { id: IconStyleId; name: string }[] = [
  { id: "hy", name: "hy 推荐" },
  { id: "lucide", name: "Lucide" },
  { id: "tabler", name: "Tabler" },
  { id: "phosphor", name: "Phosphor" },
  { id: "fluent", name: "Fluent" },
  { id: "material", name: "Material" },
  { id: "codicons", name: "Codicons" }
];

export const ICON_AREAS: { id: IconArea; name: string }[] = [
  { id: "titlebar", name: "标题栏" },
  { id: "menu", name: "菜单" },
  { id: "toolbar", name: "工具栏" },
  { id: "activitybar", name: "活动栏" },
  { id: "sidebar", name: "侧栏" },
  { id: "editor", name: "编辑区" },
  { id: "panel", name: "面板" },
  { id: "statusbar", name: "状态栏" }
];
