/** 只允许产品 CSS 变量名和普通值，避免把任意样式写进预览。 */
export function safeTokens(tokens?: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  if (!tokens) return out;
  for (const [key, value] of Object.entries(tokens)) {
    if (!/^--[a-z0-9-]+$/i.test(key)) continue;
    if (typeof value !== "string") continue;
    const text = value.trim();
    if (!text || text.length > 80 || /[;{}]|url\s*\(|expression\s*\(/i.test(text)) continue;
    out[key] = text;
  }
  return out;
}
