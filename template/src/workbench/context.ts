import { createContext, useContext, type RefObject } from "react";
import type { ThemeData } from "../theme/resolve";
import type { EditorItem, PartId, ToolItem, UiConfig, ViewRegistry } from "./types";

export interface ResolvedCommand {
  id: string;
  title: string;
  category?: string;
  icon?: string;
  keybinding?: string;
  core?: string;
}

export interface QuickPickItem {
  id: string;
  label: string;
  description?: string;
  detail?: string;
  icon?: string;
  keybinding?: string;
  group?: string;
}

export interface QuickPickRequest {
  items: QuickPickItem[];
  placeholder?: string;
  activeId?: string;
  onFocus?: (item: QuickPickItem) => void;
}

export interface Notice {
  id: number;
  kind: "info" | "success" | "warning" | "error";
  message: string;
  detail?: string;
}

/** settings、about，或 ui.config.json 里某个弹窗的 id */
export type DialogId = string | null;

export interface UiState {
  activeActivity: string | null;
  activeAux: string | null;
  activePanel: string | null;
  editors: EditorItem[];
  activeEditor: string | null;
  quickPick: (QuickPickRequest & { resolve: (item: QuickPickItem | undefined) => void }) | null;
  dialog: DialogId;
  /** 编辑区正在显示的副页面 id。空则显示原来的编辑器。 */
  sidePage: string | null;
  notices: Notice[];
  status: Record<string, Partial<ToolItem>>;
  /** 选主题时的实时预览 */
  previewTheme: string | null;
}

export interface WorkbenchApi {
  /** app：真正的应用窗口；embedded：嵌在设计器预览里，窗口操作不生效 */
  mode: "app" | "embedded";
  config: UiConfig;
  state: UiState;
  themes: ThemeData[];
  theme: ThemeData;
  views: ViewRegistry;
  commands: ResolvedCommand[];
  rootRef: RefObject<HTMLDivElement | null>;
  /** 预览被缩放时的比例，用于把鼠标坐标换算回界面坐标 */
  scale: number;
  updateConfig(fn: (c: UiConfig) => UiConfig): void;
  /** 布局回到设计值 */
  resetLayout(): void;
  execute(id: string, args?: unknown): Promise<void>;
  findCommand(id: string): ResolvedCommand | undefined;
  showActivity(id: string): void;
  setActiveAux(id: string): void;
  setActivePanel(id: string): void;
  openEditor(item: EditorItem): void;
  closeEditor(id: string): void;
  setActiveEditor(id: string): void;
  notify(kind: Notice["kind"], message: string, detail?: string): void;
  dismissNotice(id: number): void;
  quickPick(req: QuickPickRequest): Promise<QuickPickItem | undefined>;
  resolveQuickPick(item: QuickPickItem | undefined): void;
  setStatus(id: string, patch: Partial<ToolItem> | null): void;
  openDialog(id: DialogId): void;
  /** 在编辑区显示一页副页面。null 收回，露出原来的编辑器。 */
  showSidePage(id: string | null): void;
  setPreviewTheme(id: string | null): void;
  togglePart(part: PartId): void;
}

export const WorkbenchContext = createContext<WorkbenchApi | null>(null);

export function useWorkbench(): WorkbenchApi {
  const api = useContext(WorkbenchContext);
  if (!api) throw new Error("useWorkbench 必须在 <Workbench> 内使用");
  return api;
}
