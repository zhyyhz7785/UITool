import { useEffect, useState } from "react";
import { Icon } from "../../icons/Icon";
import { AppMark } from "../AppMark";
import { IconScope } from "../../icons/Icon";
import { appWindow } from "../../platform/window";
import { windowAction } from "../commands";
import { useWorkbench } from "../context";
import { ItemBar } from "./ItemBar";
import { MenuBar } from "./MenuBar";

/** 自绘标题栏，高度 var(--h-title)=28px（hy 硬规则 HR3）。空白处可拖动窗口、双击最大化。 */
export function TitleBar() {
  const wb = useWorkbench();
  const T = wb.config.layout.titleBar;
  const [maximized, setMaximized] = useState(false);
  const isApp = wb.mode === "app";
  useEffect(() => {
    if (!isApp) return;
    let off: (() => void) | undefined;
    void appWindow.onMaximizedChange(setMaximized).then((f) => (off = f));
    return () => off?.();
  }, [isApp]);
  const drag = isApp ? { "data-tauri-drag-region": true } : {};
  const active = wb.state.editors.find((e) => e.id === wb.state.activeEditor);
  const docName = active?.title ?? "";
  const appName = wb.config.app.title;
  const docTitle = T.search && active ? `${active.title} — ${appName}` : appName;
  const centerText = fillTitle(T.titleText, docName, appName, T.commandCenter ? appName : docTitle);
  const win = T.winControls;

  return (
    <IconScope area="titlebar">
      <div className="wb-titlebar" data-part="titlebar" data-row="title" {...drag}>
        <div className="wb-titlebar-left" {...drag}>
          {T.appIcon && (
            <span className="wb-titlebar-app" data-zone="appicon" data-item="appicon" {...drag}>
              <span data-sub="icon">
                <AppMark size={16} />
              </span>
            </span>
          )}
          <ItemBar items={T.left} zone="title-left" area="titlebar" />
          {T.menu === "inline" && <MenuBar />}
        </div>
        <div className="wb-titlebar-center" data-zone="title-center" {...drag}>
          {T.commandCenter ? (
            <button type="button" className="wb-commandcenter" data-zone="title-center" data-item="command-center" onClick={() => void wb.execute("workbench.action.showCommands")}>
              <span data-sub="icon">
                <Icon name="search" size={13} />
              </span>
              <span data-sub="text">{centerText}</span>
            </button>
          ) : (
            <span className="wb-titlebar-title" data-item="title-text" {...drag}>
              <span data-sub="text">{centerText}</span>
            </span>
          )}
          <ItemBar items={T.center ?? []} zone="title-center" area="titlebar" />
        </div>
        <div className="wb-titlebar-right">
          {T.search && (
            <input
              className="wb-title-search"
              type="search"
              placeholder="搜索命令…"
              aria-label="搜索命令"
              onKeyDown={(e) => {
                if (e.key === "Enter") void wb.execute("workbench.action.showCommands");
              }}
            />
          )}
          <ItemBar items={T.right} zone="title-right" area="titlebar" />
          <div className="wb-winctl" data-zone="winctl">
            {win?.min !== false && (
              <button type="button" data-item="min" title="最小化" onClick={() => void windowAction(wb, appWindow.minimize)}>
                <span data-sub="icon">
                  <Icon name="minimize" size={14} />
                </span>
              </button>
            )}
            {win?.max !== false && (
              <button type="button" data-item="max" title={maximized ? "还原" : "最大化"} onClick={() => void windowAction(wb, appWindow.toggleMaximize)}>
                <span data-sub="icon">
                  <Icon name={maximized ? "restore" : "maximize"} size={14} />
                </span>
              </button>
            )}
            <button type="button" data-item="close" className="close" title="关闭" onClick={() => void windowAction(wb, appWindow.close)}>
              <span data-sub="icon">
                <Icon name="15-close" size={14} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </IconScope>
  );
}

function fillTitle(template: string | undefined, doc: string, app: string, fallback: string) {
  if (!template) return fallback;
  return template.replaceAll("{doc}", doc).replaceAll("{app}", app);
}
