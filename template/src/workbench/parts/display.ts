import type { ItemDisplay } from "../types";

/** 按 display 决定画图标还是文字。选中的一边没有内容时退回另一边，避免按钮是空的。 */
export function visibleParts(display: ItemDisplay | undefined, hasIcon: boolean, hasText: boolean): { icon: boolean; text: boolean } {
  let icon = display !== "text" && hasIcon;
  let text = display !== "icon" && hasText;
  if (!icon && !text) {
    icon = hasIcon;
    text = hasText;
  }
  return { icon, text };
}
