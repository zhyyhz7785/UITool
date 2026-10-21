// hy3d ui/design → 13-软件模板/01-AutoCAD侧/Hy3d制图.uitool.json
// 会覆盖这份设计文件。已在设计器里改过、还没写回的内容会丢掉。
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";
import { handFile, hy3dRoot, readJson, uitoolRoot } from "./hy3d-paths.mjs";
import { menusFrom, overlayScheme, SCHEMES, stampActive } from "./hy3d-spec.mjs";

const hy3d = hy3dRoot();
const server = await createServer({
  root: uitoolRoot,
  configFile: path.join(uitoolRoot, "vite.config.ts"),
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "error"
});
try {
  const presets = await server.ssrLoadModule("/src/designer/presets/index.ts");
  const cad = presets.workTypes.find((t) => t.id === "cad2d");
  if (!cad) throw new Error("没有 CAD 二维制图预设");
  const app = { name: "hy3d-cad", title: "hy3d 二维制图", identifier: "com.hy.hy3d", version: "0.1.0", description: cad.summary, icon: "layout" };
  const config = presets.buildConfig("cad2d", "cad2d-best", app);
  const designDir = path.join(hy3d, "ui/design");
  const menuMain = menusFrom(readJson(path.join(designDir, "menus.json")));
  const menuBlender = menusFrom(readJson(path.join(designDir, "menus.blender.json")));

  for (const s of SCHEMES) {
    const scheme = config.schemes.find((x) => x.id === s.scheme);
    if (!scheme) throw new Error("设计里没有方案 " + s.scheme);
    const spec = readJson(path.join(designDir, s.file));
    scheme.ui = overlayScheme(scheme.ui, spec, config.commands);
    scheme.menus = s.menus === "blender" ? menuBlender : menuMain;
    console.log(`${s.file}  →  ${s.scheme}  页签 ${spec.tabs?.length ?? 0}  工具排 ${spec.toolbarRows?.length ?? 0}`);
  }

  const doc = { kind: "uitool-design", version: 1, config: stampActive(config), customThemes: [] };
  fs.mkdirSync(path.dirname(handFile), { recursive: true });
  fs.writeFileSync(handFile, JSON.stringify(doc, null, 2) + "\n");
  console.log("写入 " + handFile);
} finally {
  await server.close();
}
