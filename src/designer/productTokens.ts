/** 产品里已经在用的 CSS 变量。这里只列可以改的名字，不写第二套默认值。 */
export interface ProductToken {
  id: string;
  label: string;
  group: "尺寸" | "图标" | "文字" | "间距" | "边框" | "配色" | "布局";
}

export const PRODUCT_TOKENS: ProductToken[] = [
  { id: "--titlebar-h", label: "标题栏高度", group: "尺寸" },
  { id: "--ribbon-h", label: "工具栏高度", group: "尺寸" },
  { id: "--h-title", label: "标题高度", group: "尺寸" },
  { id: "--h-ctl", label: "控件高度", group: "尺寸" },
  { id: "--hy-icon", label: "图标大小", group: "图标" },
  { id: "--ribbon-small-icon", label: "小图标", group: "图标" },
  { id: "--ribbon-large-icon", label: "大图标", group: "图标" },
  { id: "--hy-cmd-fs", label: "命令文字大小", group: "文字" },
  { id: "--fs-ui", label: "界面字号", group: "文字" },
  { id: "--hy-cmd-lh", label: "文字行高", group: "文字" },
  { id: "--hy-cmd-gap", label: "图标与文字间距", group: "间距" },
  { id: "--gap", label: "控件间距", group: "间距" },
  { id: "--chrome-pad", label: "内边距", group: "间距" },
  { id: "--dock-pad", label: "侧栏内边距", group: "间距" },
  { id: "--r-ctl", label: "圆角", group: "边框" },
  { id: "--border", label: "边框颜色", group: "边框" },
  { id: "--bg-window", label: "窗口背景", group: "配色" },
  { id: "--bg-panel", label: "面板背景", group: "配色" },
  { id: "--text", label: "前景", group: "配色" },
  { id: "--accent", label: "选中", group: "配色" },
  { id: "--bg-hover", label: "悬停", group: "配色" },
  { id: "--obs-tab-h", label: "HyMd 页签高度", group: "尺寸" },
  { id: "--obs-row-h", label: "HyMd 行高", group: "尺寸" },
  { id: "--left-dock-w", label: "左侧栏宽度", group: "布局" },
  { id: "--right-dock-w", label: "右侧栏宽度", group: "布局" },
  { id: "--obs-gap", label: "HyMd 间距", group: "间距" },
  { id: "--obs-pad", label: "HyMd 内边距", group: "间距" },
  { id: "--bg", label: "HyMd 背景", group: "配色" },
  { id: "--text-muted", label: "次要文字", group: "配色" },
  { id: "--list-hover", label: "列表悬停", group: "配色" },
  { id: "--list-active", label: "列表选中", group: "配色" }
];

export function tokenGroups(): ProductToken["group"][] {
  return ["尺寸", "图标", "文字", "间距", "边框", "配色", "布局"];
}
