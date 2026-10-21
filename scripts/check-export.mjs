// 端到端检查：用设计器同一份导出代码生成 zip → 解压到 .tmp/ → npm install → npm run build → cargo test。
// 用法：node scripts/check-export.mjs [--skip-install] [--skip-rust]
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unzipSync } from "fflate";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const tmp = path.join(root, ".tmp");

const server = await createServer({ root, configFile: path.join(root, "vite.config.ts"), server: { middlewareMode: true, hmr: false }, appType: "custom", logLevel: "error" });
let zip, doc;
try {
  const exp = await server.ssrLoadModule("/src/designer/export.ts");
  const mig = await server.ssrLoadModule("/template/src/workbench/migrate.ts");
  const config = mig.migrateConfig(JSON.parse(fs.readFileSync(path.join(root, "template/src/ui.config.json"), "utf8")));
  config.app = { ...config.app, name: "export-check", title: "导出检查", identifier: "com.hy.exportcheck" };
  doc = { config, customThemes: [{ id: "custom-check", name: "检查主题", type: "dark", colors: { "base.accent": "#22c55e" } }] };
  const errs = exp.validateDoc(doc);
  if (errs.length) throw new Error("校验失败：" + errs.join("；"));
  zip = exp.zipProject(doc);
} finally {
  await server.close();
}

const files = unzipSync(zip);
const out = path.join(tmp, doc.config.app.name);
fs.rmSync(out, { recursive: true, force: true, maxRetries: 3 });
for (const [p, data] of Object.entries(files)) {
  const f = path.join(tmp, p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
}
console.log(`zip ${(zip.length / 1024).toFixed(1)} KB，${Object.keys(files).length} 个文件 → ${path.relative(root, out)}`);

const must = ["package.json", ".gitignore", ".npmrc", ".node-version", "src/ui.config.json", "src/theme/themes/custom-check.json", "src-tauri/icons/icon.ico", "src-tauri/tauri.conf.json", "core/src/lib.rs", "Cargo.toml"];
const missing = must.filter((m) => !fs.existsSync(path.join(out, m)));
if (missing.length) throw new Error("缺少文件：" + missing.join(", "));
const conf = JSON.parse(fs.readFileSync(path.join(out, "src-tauri/tauri.conf.json"), "utf8"));
if (conf.identifier !== "com.hy.exportcheck" || conf.productName !== "导出检查") throw new Error("tauri.conf.json 未按设计改写");
console.log("文件与改写检查通过");

const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd: out, stdio: "inherit" });
};
if (!args.has("--skip-install")) run("npm install --no-audit --no-fund");
run("npm run build");
if (!args.has("--skip-rust")) run("cargo test -p app-core");
if (!args.has("--skip-rust")) run("cargo check -p app-shell");
console.log("\n导出工程检查全部通过");
