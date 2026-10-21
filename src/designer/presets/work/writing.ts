import type { MenuItem, SideContainer, ToolItem } from "@tpl/workbench/types";
import { baseLayout, box, chip, dialog, editor, look, okCancel, row, section, stack, tab, zones, type WorkTypeDef } from "../kit";
import { hymdCommands, hymdMenus, type HymdMenuEntry } from "./writing.hymdCommands";

function menuItem(x: HymdMenuEntry): MenuItem {
  if (x === "sep") return { separator: true };
  if (typeof x === "string") return { command: x };
  return { id: `@${x.sub}`, command: x.command, title: `${x.title} ›` };
}

const menus = hymdMenus.map((m) => ({ id: m.id, title: m.title, items: m.items.map(menuItem) }));

const dialogs = [
  dialog({
    id: "cite",
    title: "插入引用",
    command: "hymd.refs.zoteroCite",
    groups: ["文献", "显示"],
    fields: [
      { id: "q", label: "检索", type: "text", group: "文献", placeholder: "作者、题名或 citekey" },
      {
        id: "key",
        label: "条目",
        type: "select",
        group: "文献",
        value: "wang2020",
        options: [
          { value: "wang2020", label: "wang2020 · 王某某. 混凝土结构基本原理" },
          { value: "lee2019", label: "lee2019 · Lee. Seismic design of tall buildings" },
          { value: "gb50010", label: "gb50010 · GB 50010—2010" }
        ]
      },
      { id: "locator", label: "页码", type: "text", group: "显示", placeholder: "如 42" },
      { id: "suppress", label: "省略作者", type: "toggle", group: "显示", value: false }
    ],
    actions: okCancel("插入 [@key]")
  }),
  dialog({
    id: "refstyle",
    title: "参考文献样式",
    command: "hymd.refs.style",
    groups: ["样式"],
    fields: [
      {
        id: "style",
        label: "著录格式",
        type: "select",
        group: "样式",
        value: "gb7714",
        options: [
          { value: "gb7714", label: "GB/T 7714" },
          { value: "ieee", label: "IEEE" }
        ]
      },
      { id: "link", label: "正文编号可点回文献表", type: "toggle", group: "样式", value: true }
    ],
    actions: okCancel("应用")
  }),
  dialog({
    id: "export",
    title: "导出",
    command: "hymd.export.all",
    groups: ["格式", "选项"],
    fields: [
      {
        id: "format",
        label: "格式",
        type: "select",
        group: "格式",
        value: "all",
        options: [
          { value: "all", label: "全部（docx + pptx + pdf）" },
          { value: "docx", label: "Word (docx)" },
          { value: "pptx", label: "PowerPoint (pptx)" },
          { value: "pdf", label: "PDF" }
        ]
      },
      { id: "path", label: "位置", type: "text", group: "格式" },
      { id: "toc", label: "包含目录", type: "toggle", group: "选项", value: true },
      { id: "refs", label: "包含参考文献", type: "toggle", group: "选项", value: true }
    ],
    actions: okCancel("导出")
  })
];

/**
 * HyMd 实际有的视图（id 与 HyMd `skins/design/views.ts` 一致）。三套方案摆放不同，集合相同。
 * 左侧四个容器 = HyMd 侧栏 explorer / search / scm / paper；底栏五个 = HyMd Panel 的五个页签。
 */
const views = [
  "backlinks",
  "bookmarks",
  "docMeta",
  "document",
  "explorer",
  "gitGraph",
  "localGraph",
  "outline",
  "output",
  "paper",
  "problems",
  "refs",
  "scm",
  "search",
  "settings",
  "tags",
  "terminal",
  "theme"
];

const doc = editor("doc", "混凝土结构笔记.hy.md", "code", "document");
const note = editor("note", "文献摘录.hy.md", "code", "document");

/** 与 HyMd `parts/Panel.tsx` 的 TAB_IDS 同序。 */
function panelTabs() {
  return [
    tab("terminal", "终端", "term", "terminal"),
    tab("problems", "问题", "error", "problems"),
    tab("output", "输出", "term", "output"),
    tab("settings", "设置", "settings", "settings"),
    tab("gitGraph", "Git 图表", "columns", "gitGraph")
  ];
}

function iconOnly(c: SideContainer): SideContainer {
  return { ...c, header: "icon" };
}

function related() {
  return stack("related", "关联", "link", [
    section("backlinks", "反向链接", "link", "backlinks"),
    section("localGraph", "局部图谱", "line", "localGraph"),
    section("tags", "标签", "highlight", "tags", "bottom"),
    section("bookmarks", "书签", "15-pin", "bookmarks", "bottom")
  ]);
}

const theme = () => box("theme", "主题", "theme", "theme");

const item = (id: string, command: string, icon: string): ToolItem => ({ id, command, icon });

/** C：Obsidian 式。左功能区 = 侧面工具栏（HyMd Ribbon），左右停靠都是图标页签。 */
function research() {
  const layout = baseLayout();
  layout.dialogStyle = "sheet";
  layout.activityBar.visible = false;
  layout.titleBar.commandCenter = false;
  layout.auxiliaryBar.visible = true;
  layout.auxiliaryBar.width = 280;
  layout.panel.visible = false;
  layout.editor.tabs = true;
  layout.primarySideBar.width = 240;
  const ribbon = row("ribbon", "功能区", [
    "workbench.action.toggleSidebarVisibility",
    "workbench.action.quickOpen",
    "hymd.graph.open",
    "hymd.image.properties",
    "paper.open",
    "workbench.action.showCommands"
  ]);
  ribbon.end = [
    item("ribbon-pos", "workbench.action.toggleToolbarPosition", "dock"),
    item("ribbon-aux", "workbench.action.toggleAuxiliaryBar", "sideright"),
    item("ribbon-settings", "workbench.action.openSettings", "settings")
  ];
  layout.toolbars.side = { visible: true, position: "left", style: "icon", rows: [ribbon] };
  return {
    ...look("hy-dark", "compact", "#8A5CF5"),
    layout,
    activity: [
      iconOnly(box("files", "文件", "home", "explorer")),
      iconOnly(box("search", "搜索", "search", "search")),
      iconOnly(box("bookmarks", "书签", "15-pin", "bookmarks")),
      iconOnly(box("scm", "源代码管理", "history", "scm")),
      iconOnly(box("paper", "论文", "footnote", "paper"))
    ],
    auxiliary: [
      iconOnly(box("backlinks", "反向链接", "link", "backlinks")),
      iconOnly(box("outline", "大纲", "toc", "outline")),
      iconOnly(box("refs", "文献", "footnote", "refs")),
      iconOnly(box("localGraph", "局部图谱", "line", "localGraph")),
      iconOnly(box("tags", "标签", "highlight", "tags")),
      iconOnly(box("docMeta", "属性", "props", "docMeta")),
      iconOnly(theme())
    ],
    panel: panelTabs(),
    editors: [doc, note],
    statusBar: zones([chip("words", "1 284 字"), chip("backlinks", "反向链接 2")], [chip("style", "GB/T 7714", "list")])
  };
}

/** A：VS Code 式。活动栏竖条切资源管理器 / 搜索 / 源代码管理 / 论文，右侧文献 + 属性。 */
function vscode() {
  const layout = baseLayout();
  layout.activityBar.visible = true;
  layout.activityBar.position = "side";
  layout.activityBar.bottom = [item("ab-graph", "hymd.graph.open", "line"), item("ab-settings", "workbench.action.openSettings", "settings")];
  layout.titleBar.commandCenter = true;
  layout.auxiliaryBar.visible = true;
  layout.auxiliaryBar.width = 300;
  layout.panel.visible = true;
  layout.panel.size = 200;
  layout.editor.tabs = true;
  layout.editor.breadcrumbs = true;
  layout.primarySideBar.width = 260;
  return {
    ...look("hy-dark", "compact", "#0078D4"),
    layout,
    activity: [
      stack("explorer", "资源管理器", "home", [section("files", "文件夹", "home", "explorer"), section("outline", "大纲", "toc", "outline", "bottom")]),
      box("search", "搜索", "search", "search"),
      box("scm", "源代码管理", "history", "scm"),
      box("paper", "论文", "footnote", "paper")
    ],
    auxiliary: [
      stack("refs", "文献", "footnote", [section("refs", "文献", "footnote", "refs"), section("docMeta", "文档属性", "props", "docMeta", "bottom")]),
      related(),
      theme()
    ],
    panel: panelTabs(),
    editors: [doc],
    statusBar: zones([chip("branch", "main", "history"), chip("problems", "0 问题", "error")], [chip("style", "GB/T 7714", "list"), chip("words", "1 284 字"), chip("enc", "UTF-8")])
  };
}

/** B：Apple / Notion 式。无活动栏，左侧栏顶部图标页签，正文居中，右侧检查器。 */
function plain() {
  const layout = baseLayout();
  layout.dialogStyle = "sheet";
  layout.activityBar.visible = false;
  layout.titleBar.commandCenter = false;
  layout.auxiliaryBar.visible = true;
  layout.auxiliaryBar.width = 260;
  layout.panel.visible = false;
  layout.editor.tabs = false;
  layout.primarySideBar.width = 220;
  return {
    ...look("hy-white", "comfortable", "#0A84FF"),
    layout,
    activity: [
      iconOnly(box("explorer", "页面", "home", "explorer")),
      iconOnly(box("search", "搜索", "search", "search")),
      iconOnly(box("scm", "源代码管理", "history", "scm")),
      iconOnly(box("paper", "论文", "footnote", "paper"))
    ],
    auxiliary: [box("outline", "目录", "toc", "outline"), box("refs", "文献", "footnote", "refs"), box("docMeta", "信息", "props", "docMeta"), related(), theme()],
    panel: panelTabs(),
    editors: [doc],
    statusBar: zones([], [chip("words", "1 284 字"), chip("style", "GB/T 7714", "list")])
  };
}

export const writing: WorkTypeDef = {
  id: "writing",
  name: "文档写作",
  summary: "照 HyMd 实际界面：94 条工作台命令 + 30 条正文插入命令，7 组菜单，视图与 HyMd 一一对应。设计导出后 HyMd 按它渲染。",
  views,
  commands: hymdCommands,
  menus,
  dialogs,
  schemes: [
    {
      id: "writing-best",
      tier: "best",
      name: "三栏研究台",
      desc: "左功能区 + 左停靠（文件、搜索、书签、源代码管理、论文）；右停靠图标页签（反向链接、大纲、文献、局部图谱、标签、属性、主题）。",
      source: "13-软件模板/02-HyMd侧/C-Obsidian式多窗格研究台.html（文献页 p-refs、Zotero、view.refs）→ HyMd 皮肤 obsidian",
      reason: "文献、大纲和反向链接同时在右侧",
      score: { efficiency: 52, aesthetic: 22, learn: 13 },
      ui: research()
    },
    {
      id: "writing-good",
      tier: "good",
      name: "VSCode 式工作台",
      desc: "活动栏竖条切资源管理器、搜索、源代码管理、论文；右侧文献 + 文档属性，另有关联、主题；底栏五个页签。",
      source: "13-软件模板/02-HyMd侧/A-VSCode式工作台.html（文献库 p-refs、文献详情 p-refcard、GB/T 7714）→ HyMd 皮肤 vscode",
      reason: "文献详情要开右侧栏，其余视图在底栏页签",
      score: { efficiency: 46, aesthetic: 18, learn: 12 },
      ui: vscode()
    },
    {
      id: "writing-basic",
      tier: "basic",
      name: "简洁文档",
      desc: "白底，无活动栏。左侧栏顶部图标页签，正文居中，右侧检查器分目录、文献、信息、关联、主题；底栏默认收起。",
      source: "13-软件模板/02-HyMd侧/B-Apple-Notion式简洁文档.html（检查器文献页 p-refs、Zotero、DOI）→ HyMd 皮肤 notion",
      reason: "文献收在检查器里，默认不铺开工作台",
      score: { efficiency: 34, aesthetic: 23, learn: 14 },
      ui: plain()
    }
  ]
};
