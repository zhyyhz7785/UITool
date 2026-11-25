import { useMemo } from "react";
import { shellDocument, type ShellOptions } from "./shellDocument";
import type { UiConfig } from "./types";

/** cad2d / writing 的预览壳。样式来自产品文件，点选把区域 id 传回设计器。 */
export function ProductShell({ config, onlyPart, onlyMenu }: { config: UiConfig } & ShellOptions) {
  const html = useMemo(() => shellDocument(config, { onlyPart, onlyMenu }), [config, onlyPart, onlyMenu]);
  return <iframe className="wb-product-shell" title="产品壳层" sandbox="allow-scripts allow-same-origin" srcDoc={html} />;
}
