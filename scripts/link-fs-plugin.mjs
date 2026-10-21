// 开发服务器上的本地读写。只允许 hy3d、HyMd，以及 hy3d 手改设计文件所在目录。
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOTS = ["E:/Code/hy3d", "E:/Code/HyMdTauri2", "E:/Code/UI设计规范/13-软件模板/01-AutoCAD侧"];
const ICON_DIRS = {
  hy3d: "E:/Code/hy3d/apps/hy3d-app/icons",
  hymd: "E:/Code/HyMdTauri2/src-tauri/icons"
};
const installScript = path.join(path.dirname(fileURLToPath(import.meta.url)), "install-app-icon.py");

function allowed(file) {
  const n = path.resolve(file).replace(/\\/g, "/");
  if (n.split("/").includes("..")) return false;
  return ROOTS.some((root) => n === root || n.toLowerCase().startsWith(root.toLowerCase() + "/"));
}

export function linkFsPlugin() {
  return {
    name: "uitool-link-fs",
    configureServer(server) {
      server.middlewares.use("/__uitool/fs", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            if (body.op !== "install-icon" && !allowed(body.path)) throw new Error("路径不在允许的仓库里");
            if (body.op === "read") {
              const text = fs.readFileSync(body.path, "utf8");
              res.setHeader("content-type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ text }));
              return;
            }
            if (body.op === "write") {
              fs.mkdirSync(path.dirname(body.path), { recursive: true });
              fs.writeFileSync(body.path, String(body.text ?? ""), "utf8");
              res.setHeader("content-type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ ok: true }));
              return;
            }
            if (body.op === "install-icon") {
              const dir = ICON_DIRS[body.target];
              if (!dir || !allowed(dir)) throw new Error("未知程序");
              const png = Buffer.from(String(body.png ?? ""), "base64");
              if (png.length < 32 || png.length > 8_000_000) throw new Error("图标数据不对");
              const tmp = path.join(os.tmpdir(), `uitool-icon-${Date.now()}.png`);
              fs.writeFileSync(tmp, png);
              try {
                const run = spawnSync("python", [installScript, tmp, dir], { encoding: "utf8" });
                if (run.status !== 0) throw new Error((run.stderr || run.stdout || "生成图标失败").trim());
                res.setHeader("content-type", "application/json; charset=utf-8");
                res.end(JSON.stringify({ ok: true, files: run.stdout.trim() }));
              } finally {
                fs.rmSync(tmp, { force: true });
              }
              return;
            }
            throw new Error("未知操作");
          } catch (e) {
            res.statusCode = 400;
            res.setHeader("content-type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
          }
        });
      });
    }
  };
}
