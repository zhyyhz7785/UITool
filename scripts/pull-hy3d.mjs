// hy3d ui/design 的 ribbon、workbench、menus → Hy3d制图.uitool.json
// 会覆盖这份设计文件。已在设计器里改过、还没写回的内容会丢掉。
// 不读 blender.json / menus.blender.json。命令从 ui/commands.json 的 include 展开。
import crypto from "node:crypto";
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";
import { atomicWrite } from "./path-policy.mjs";
import { handFile, hy3dRoot, uitoolRoot } from "./hy3d-paths.mjs";
import { applyHy3dSpecs, handDocument, loadHy3dBundle } from "./hy3d-spec.mjs";

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
  const readUiText = (rel) => fs.readFileSync(path.join(hy3d, "ui", rel), "utf8");
  const bundle = await loadHy3dBundle(readUiText);
  const config = applyHy3dSpecs(presets.buildConfig("cad2d", "cad2d-best", app), bundle);
  console.log(`ribbon.json  →  cad2d-best  页签 ${bundle.ribbon.tabs?.length ?? 0}  命令 ${bundle.commands.length}`);
  console.log(`workbench.json  →  cad2d-basic  工具排 ${bundle.workbench.toolbarRows?.length ?? 0}`);

  const next = JSON.stringify(handDocument(config, []), null, 2) + "\n";
  const nextHash = crypto.createHash("sha256").update(next).digest("hex");
  const stampFile = handFile + ".sync.json";
  if (fs.existsSync(handFile)) {
    const currentHash = crypto.createHash("sha256").update(fs.readFileSync(handFile)).digest("hex");
    let stamped = "";
    try {
      stamped = JSON.parse(fs.readFileSync(stampFile, "utf8")).hash || "";
    } catch {
      stamped = "";
    }
    if (currentHash !== nextHash && currentHash !== stamped) {
      throw new Error("没有写入。这份设计文件和上次同步不一致，直接覆盖会丢掉未写回的修改。\n" + handFile);
    }
  }
  atomicWrite(handFile, next);
  atomicWrite(stampFile, JSON.stringify({ hash: nextHash, at: new Date().toISOString() }, null, 2) + "\n");
  console.log("写入 " + handFile);
} finally {
  await server.close();
}
