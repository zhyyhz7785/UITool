import { useEffect, useState } from "react";
import { migrateConfig } from "./migrate";
import type { UiConfig } from "./types";

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/**
 * 用户在应用里拖动的尺寸、切换的显隐和主题记在本机。
 * 重新从 UITool 导出（ui.config.json 变了）时自动作废，回到设计值。
 */
export function usePersistentConfig(designed: UiConfig): [UiConfig, (c: UiConfig) => void] {
  const normalized = migrateConfig(designed);
  const key = `ui.config:${normalized.app.identifier}`;
  const base = hash(JSON.stringify(normalized));
  const [config, setConfig] = useState<UiConfig>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "null") as { base: string; config: unknown } | null;
      if (saved?.base === base) return migrateConfig(saved.config);
    } catch {
      /* 读不出就用设计值 */
    }
    return normalized;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify({ base, config }));
  }, [key, base, config]);
  return [config, setConfig];
}
