import type { ViewRegistry } from "../workbench/types";
import { Outline, Placeholder, Problems, Properties, Search, Terminal, TextEditor, Welcome } from "./Basic";
import { Explorer } from "./Explorer";
import { CanvasView, DocumentView, MonitorView, ResultTable, SheetView, TimelineView, Viewport2d, Viewport3d } from "./Mock";
import { CommandLineView, LayersView } from "./Cad";
import { Output } from "./Output";
import { OcrView } from "./Ocr";
import { BacklinksView, BookmarksView, DocMetaView, GitGraphView, LocalGraphView, PaperView, RefsView, ScmView, SettingsView, TagsView, ThemeView } from "./Writing";
import "./views.css";

/**
 * 视图登记表：ui.config.json 里 activity / auxiliary / panel / editors 的 view 字段对应这里的 key。
 * 新视图：写组件 → 在这里加一行 → 在 UITool 或 ui.config.json 里引用。
 */
export const views: ViewRegistry = {
  explorer: Explorer,
  search: Search,
  outline: Outline,
  properties: Properties,
  problems: Problems,
  output: Output,
  terminal: Terminal,
  welcome: Welcome,
  text: TextEditor,
  placeholder: Placeholder,
  viewport2d: Viewport2d,
  layers: LayersView,
  commandline: CommandLineView,
  viewport3d: Viewport3d,
  canvas: CanvasView,
  timeline: TimelineView,
  monitor: MonitorView,
  sheet: SheetView,
  document: DocumentView,
  resultTable: ResultTable,
  refs: RefsView,
  docMeta: DocMetaView,
  backlinks: BacklinksView,
  localGraph: LocalGraphView,
  bookmarks: BookmarksView,
  tags: TagsView,
  scm: ScmView,
  paper: PaperView,
  settings: SettingsView,
  gitGraph: GitGraphView,
  theme: ThemeView,
  ocr: OcrView
};
