import { Icon } from "../icons/Icon";
import { useWorkbench } from "./context";

/** 程序图标：配置了图片就用图片，否则用笔画图标。 */
export function AppMark({ size, strokeWidth }: { size: number; strokeWidth?: number }) {
  const wb = useWorkbench();
  const img = wb.config.app.iconImage;
  if (img) return <img className="wb-appmark" src={img} alt="" width={size} height={size} />;
  return <Icon name={wb.config.app.icon} size={size} strokeWidth={strokeWidth} />;
}
