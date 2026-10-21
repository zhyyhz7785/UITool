import type { WorkbenchApi } from "@tpl/workbench/context";
import { usePersistentConfig } from "@tpl/workbench/persist";
import type { CommandHandler, ViewRegistry } from "@tpl/workbench/types";
import { Workbench } from "@tpl/workbench/Workbench";
import { useEffect, useMemo, useRef } from "react";
import { exportProject, newDesign, openDesign, saveDesign } from "./actions";
import { designerConfig } from "./designerConfig";
import { PART_NAMES } from "./partSettings";
import { design, useDesign } from "./store";
import { PreviewView } from "./views/PreviewView";
import { PartsView, PropertiesView } from "./inspector";
import { LinkView } from "./link/LinkView";
import { DialogsView, ExportView, GuideView, IconsView, JsonView, LayoutView, PresetsView, ThemeView } from "./views/SideViews";
import { Hy3dIconsView } from "./views/Hy3dIcons";

const views: ViewRegistry = {
  presets: PresetsView,
  layoutView: LayoutView,
  themeView: ThemeView,
  partsView: PartsView,
  iconsView: IconsView,
  exportView: ExportView,
  linkView: LinkView,
  dialogsView: DialogsView,
  propertiesView: PropertiesView,
  previewView: PreviewView,
  jsonView: JsonView,
  guideView: GuideView,
  hy3dIcons: Hy3dIconsView
};

export function Designer() {
  const [chrome, setChrome] = usePersistentConfig(designerConfig);
  useEffect(() => {
    const hasHy3d = chrome.activity.some((a) => a.id === "hy3d-icons");
    const dialogs = chrome.activity.find((a) => a.id === "dialogs");
    const titleStale = !!dialogs && (dialogs.title !== "副页面" || dialogs.sections.some((s) => s.view === "dialogsView" && s.title !== "副页面"));
    if (hasHy3d && dialogs && !titleStale) return;
    let activity = chrome.activity;
    if (!hasHy3d) {
      activity = [
        ...activity,
        {
          id: "hy3d-icons",
          title: "hy3d 图标",
          icon: "shapes",
          header: "show",
          headerActions: [],
          bottomOrder: "down",
          sections: [{ id: "hy3d-icons", title: "hy3d 图标", view: "hy3dIcons", icon: "shapes", anchor: "top", header: false, actions: [] }]
        }
      ];
    }
    const fresh = designerConfig.activity.find((a) => a.id === "dialogs");
    if (!dialogs && fresh) activity = [...activity, fresh];
    if (titleStale) {
      activity = activity.map((a) =>
        a.id === "dialogs"
          ? { ...a, title: "副页面", sections: a.sections.map((s) => (s.view === "dialogsView" ? { ...s, title: "副页面" } : s)) }
          : a
      );
    }
    setChrome({ ...chrome, activity });
  }, [chrome, setChrome]);
  const api = useRef<WorkbenchApi | null>(null);
  const selected = useDesign((s) => s.selected);
  const pageId = useDesign((s) => s.pageId);
  const sidePages = useDesign((s) => s.doc.config.sidePages);
  const multi = useDesign((s) => s.multi);
  const selecting = useDesign((s) => s.selecting);
  const past = useDesign((s) => s.past.length);
  const future = useDesign((s) => s.future.length);

  const handlers = useMemo<Record<string, CommandHandler>>(
    () => ({
      "ut.new": () => api.current && newDesign(api.current),
      "ut.open": () => api.current && openDesign(api.current),
      "ut.save": () => api.current && saveDesign(api.current),
      "ut.export": () => api.current && exportProject(api.current),
      "ut.undo": () => design.undo(),
      "ut.redo": () => design.redo(),
      "ut.toggleSelect": () => design.setSelecting(!design.get().selecting),
      "ut.clearSelection": () => {
        const s = design.get();
        if (s.pageId) {
          design.selectSidePage(null);
          return;
        }
        if (s.dialogId) {
          design.selectDialog(null);
          return;
        }
        if (s.multi.length) {
          design.clearMulti();
          return;
        }
        const cur = s.selected;
        if (!cur) return;
        if (cur.sub) design.select({ part: cur.part, zone: cur.zone, item: cur.item });
        else if (cur.item) design.select({ part: cur.part, zone: cur.zone });
        else if (cur.zone) design.select({ part: cur.part });
        else design.select(null);
      },
      "ut.guide": () => {
        const wb = api.current;
        if (!wb) return;
        if (!wb.config.layout.panel.visible) wb.togglePart("panel");
        wb.setActivePanel("guide");
      }
    }),
    []
  );

  useEffect(() => {
    const wb = api.current;
    if (!wb) return;
    wb.setStatus("mode", { text: selecting ? "选择区域" : "试用", icon: selecting ? "pointer" : "play" });
    const sub = selected?.sub === "icon" ? " · 图标" : selected?.sub === "text" ? " · 文字" : "";
    const page = pageId ? sidePages?.find((p) => p.id === pageId) : undefined;
    wb.setStatus("selected", {
      text: page
        ? `副页面：${page.title}`
        : multi.length >= 2
          ? `多选 ${multi.length}`
          : selected
            ? `选中：${PART_NAMES[selected.part]}${selected.item ? " · 项" : selected.row ? " · 一排" : selected.zone ? " · 区域" : ""}${sub}`
            : "未选中"
    });
    wb.setStatus("history", { text: `撤销 ${past} · 重做 ${future}` });
    if ((selected || pageId) && !wb.config.layout.auxiliaryBar.visible) wb.togglePart("auxiliarybar");
  }, [selected, pageId, sidePages, multi.length, selecting, past, future]);

  return <Workbench config={chrome} defaultConfig={designerConfig} onConfigChange={setChrome} views={views} handlers={handlers} apiRef={api} className="ut-root" />;
}
