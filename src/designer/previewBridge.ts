import type { WorkbenchApi } from "@tpl/workbench/context";

/** 预览里那份工作台。弹窗页用它打开配置里的对话框。 */
export const previewBridge: { current: WorkbenchApi | null; pending: string | null } = { current: null, pending: null };
