import { useEffect, useState, type ReactElement } from "react";
import { core } from "../core";
import type { TreeNode } from "../core/contract";
import { Icon } from "../icons/Icon";
import { useWorkbench } from "../workbench/context";
import type { ViewProps } from "../workbench/types";

/** 资源管理器：目录树来自内核 workspace.tree，点文件在编辑区打开。 */
export function Explorer(_: ViewProps) {
  const wb = useWorkbench();
  const [tree, setTree] = useState<TreeNode[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Set<string>>(() => new Set(["src"]));
  const [sectionOpen, setSectionOpen] = useState(true);
  const selected = wb.state.activeEditor;

  useEffect(() => {
    core.call("workspace.tree").then(setTree, (e) => setError(e?.message ?? String(e)));
  }, []);

  const toggle = (path: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (!next.delete(path)) next.add(path);
      return next;
    });
  const rows: ReactElement[] = [];
  const walk = (nodes: TreeNode[], depth: number) => {
    for (const n of nodes) {
      const isDir = n.kind === "dir";
      const expanded = open.has(n.path);
      rows.push(
        <div
          key={n.path}
          className={"wb-tree-row" + (selected === "file:" + n.path ? " selected" : "")}
          style={{ paddingLeft: 8 + depth * 12 }}
          tabIndex={0}
          onClick={() => {
            if (isDir) toggle(n.path);
            else wb.openEditor({ id: "file:" + n.path, title: n.name, icon: "file-text", view: "text", data: { path: n.path } });
          }}
        >
          <Icon name={isDir ? (expanded ? "chevron-down" : "chevron-right") : undefined} size={14} style={{ visibility: isDir ? "visible" : "hidden" }} />
          <Icon name={isDir ? "folder" : "file"} size={14} />
          <span className="wb-tree-label">{n.name}</span>
        </div>
      );
      if (isDir && expanded && n.children) walk(n.children, depth + 1);
    }
  };
  if (tree && sectionOpen) walk(tree, 0);

  return (
    <div>
      <div className="wb-section-head" onClick={() => setSectionOpen(!sectionOpen)}>
        <Icon name={sectionOpen ? "chevron-down" : "chevron-right"} size={14} />
        {wb.config.app.name}
      </div>
      {error && <div className="wb-empty">读取失败：{error}</div>}
      {!tree && !error && <div className="wb-empty">加载中…</div>}
      {rows}
    </div>
  );
}
