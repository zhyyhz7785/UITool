import designed from "./ui.config.json";
import { views } from "./views";
import { migrateConfig } from "./workbench/migrate";
import { usePersistentConfig } from "./workbench/persist";
import type { CommandHandler } from "./workbench/types";
import { Workbench } from "./workbench/Workbench";

const defaultConfig = migrateConfig(designed);

/**
 * 前端命令处理函数。ui.config.json 里的命令执行顺序：
 *   这里注册的 handler → 工作台内置命令 → 配置里的 core 字段（转给内核）→ 提示未实现
 */
const handlers: Record<string, CommandHandler> = {
  // "edit.undo": () => editor.undo(),
};

export function App() {
  const [config, setConfig] = usePersistentConfig(defaultConfig);
  return <Workbench config={config} defaultConfig={defaultConfig} onConfigChange={setConfig} views={views} handlers={handlers} />;
}
