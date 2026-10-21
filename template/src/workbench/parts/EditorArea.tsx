import { Icon } from "../../icons/Icon";
import { AppMark } from "../AppMark";
import { IconScope } from "../../icons/Icon";
import { useWorkbench } from "../context";
import { SidePageFace } from "../overlays/SidePageFace";
import { ItemBar } from "./ItemBar";
import { ViewHost } from "./ViewHost";

/** 编辑区：页签条 + 面包屑 + 当前编辑器。页签和面包屑右侧的按钮来自配置。 */
export function EditorArea() {
  const wb = useWorkbench();
  const { editors, activeEditor } = wb.state;
  const L = wb.config.layout.editor;
  const active = editors.find((e) => e.id === activeEditor);
  const sidePage = wb.state.sidePage ? wb.config.sidePages?.find((p) => p.id === wb.state.sidePage) : undefined;

  return (
    <IconScope area="editor">
      <div className="wb-editor" data-part="editor">
        {L.tabs && editors.length > 0 && (
          <div className="wb-tabs" role="tablist" data-zone="tabs">
            {editors.map((e) => (
              <div
                key={e.id}
                role="tab"
                className={"wb-tab" + (e.id === activeEditor ? " active" : "") + (e.dirty ? " dirty" : "")}
                data-item={e.id}
                onClick={() => wb.setActiveEditor(e.id)}
                onAuxClick={(ev) => ev.button === 1 && wb.closeEditor(e.id)}
                title={e.title}
              >
                {e.icon && (
                  <span data-sub="icon">
                    <Icon name={e.icon} size={14} />
                  </span>
                )}
                <span className="wb-tab-label" data-sub="text">
                  {e.title}
                </span>
                <button
                  type="button"
                  className="wb-tab-close"
                  title="关闭 (Ctrl+W)"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    wb.closeEditor(e.id);
                  }}
                >
                  <Icon name={e.dirty ? "circle-dot" : "x"} size={14} />
                </button>
              </div>
            ))}
            <div className="wb-tabs-fill" />
            <div className="wb-tabs-actions" data-zone="tab-actions">
              <ItemBar items={L.tabActions} zone="tab-actions" area="editor" />
            </div>
          </div>
        )}
        {L.breadcrumbs && active && (
          <div className="wb-breadcrumbs" data-zone="breadcrumbs">
            <span>{wb.config.app.name}</span>
            <Icon name="chevron-right" size={12} />
            <span className="cur">{active.title}</span>
            <span className="wb-sp" />
            <ItemBar items={L.breadcrumbActions} zone="crumb-actions" area="editor" />
          </div>
        )}
        <div className="wb-editor-body">
          {sidePage ? (
            <SidePageFace key={sidePage.id} page={sidePage} />
          ) : active ? (
            <ViewHost view={active.view} id={active.id} data={active.data} />
          ) : (
            <div className="wb-editor-empty">
              <AppMark size={96} strokeWidth={0.75} />
              <div className="wb-editor-empty-keys">
                <span>显示所有命令</span>
                <kbd>Ctrl+Shift+P</kbd>
                <span>切换主侧栏</span>
                <kbd>Ctrl+B</kbd>
                <span>切换面板</span>
                <kbd>Ctrl+J</kbd>
              </div>
            </div>
          )}
        </div>
      </div>
    </IconScope>
  );
}
