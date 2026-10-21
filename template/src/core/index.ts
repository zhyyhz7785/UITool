/**
 * core：界面调用内核的唯一入口。
 *   core.call("workspace.tree")            调方法，返回 Promise
 *   core.on("task.progress", (e) => …)     订阅内核事件，返回取消函数
 * 在 Tauri 里走 invoke("core_call") + 事件 "core://event"；浏览器里（npm run dev）自动换成 mock.ts。
 * 设计器自己的桌面壳没有 core_call，预览里的界面仍用 mock（VITE_UIT_DESIGNER=1）。导出工程不设这个变量，桌面端继续走真实内核。
 */
import type { CoreEvent, CoreEvents, CoreMethod, CoreMethods } from "./contract";
import { createMockTransport } from "./mock";
import { createTauriTransport, isTauri } from "./tauri";

export type Unsubscribe = () => void;

export interface Transport {
  kind: "tauri" | "mock";
  call(method: string, params?: unknown): Promise<unknown>;
  on(event: string, handler: (data: unknown) => void): Unsubscribe;
}

const designerHost = import.meta.env.VITE_UIT_DESIGNER === "1";
const transport: Transport = !designerHost && isTauri() ? createTauriTransport() : createMockTransport();

type Params<M extends CoreMethod> = CoreMethods[M]["params"];

function call<M extends CoreMethod>(method: M, ...args: Params<M> extends void ? [] : [Params<M>]): Promise<CoreMethods[M]["result"]>;
function call<T = unknown>(method: string, params?: unknown): Promise<T>;
function call(method: string, params?: unknown): Promise<unknown> {
  return transport.call(method, params);
}

function on<E extends CoreEvent>(event: E, handler: (data: CoreEvents[E]) => void): Unsubscribe;
function on<T = unknown>(event: string, handler: (data: T) => void): Unsubscribe;
function on(event: string, handler: (data: never) => void): Unsubscribe {
  return transport.on(event, handler as (data: unknown) => void);
}

export const core = { kind: transport.kind, call, on };
export type { CoreError, CoreEvents, CoreMethods } from "./contract";
