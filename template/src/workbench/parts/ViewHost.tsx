import { Component, type ReactNode } from "react";
import { useWorkbench } from "../context";

/** 按 view id 找组件渲染；没注册的走 placeholder，出错时只坏这一块。 */
export function ViewHost({ view, id, data }: { view: string; id: string; data?: unknown }) {
  const wb = useWorkbench();
  const View = wb.views[view] ?? wb.views.placeholder;
  if (!View) return <div className="wb-empty">视图 {view} 未注册</div>;
  return (
    <ViewBoundary key={view + ":" + id}>
      <View id={id} data={data ?? (wb.views[view] ? undefined : { missing: view })} />
    </ViewBoundary>
  );
}

class ViewBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? <div className="wb-empty">视图出错：{this.state.error.message}</div> : this.props.children;
  }
}
