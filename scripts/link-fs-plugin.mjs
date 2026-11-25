// 开发服务器上的本地读写。主仓只读；只有授权的开发工作树可以写。
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWrite, canRead, canWriteProduct, canWriteUserFile, readPolicy, writePolicy } from "./path-policy.mjs";

const installScript = path.join(path.dirname(fileURLToPath(import.meta.url)), "install-app-icon.py");

function iconDir(target) {
  const hit = readPolicy().find((item) => item.id === target);
  if (!hit?.worktree) return "";
  if (target === "hy3d") return path.join(hit.worktree, "apps", "hy3d-app", "icons");
  if (target === "hymd") return path.join(hit.worktree, "src-tauri", "icons");
  return "";
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function linkFsPlugin() {
  return {
    name: "uitool-link-fs",
    configureServer(server) {
      server.middlewares.use("/__uitool/fs", (req, res) => {
        const ip = req.socket?.remoteAddress || "";
        if (ip !== "127.0.0.1" && ip !== "::1" && ip !== "::ffff:127.0.0.1") {
          res.statusCode = 403;
          res.end();
          return;
        }
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
            if (body.op === "set-policy") {
              writePolicy(Array.isArray(body.products) ? body.products : []);
              send(res, 200, { ok: true });
              return;
            }
            if (body.op === "get-policy") {
              send(res, 200, { products: readPolicy() });
              return;
            }
            if (body.op === "read") {
              if (!canRead(body.path)) throw new Error("路径不在已登记的产品目录里");
              send(res, 200, { text: fs.readFileSync(body.path, "utf8") });
              return;
            }
            if (body.op === "write") {
              if (!canWriteProduct(body.path)) throw new Error("只能写入已授权的开发工作树，主仓不能直接改");
              if (typeof body.expect === "string") {
                const current = fs.existsSync(body.path) ? fs.readFileSync(body.path, "utf8") : "";
                if (hashText(current) !== body.expect) throw new Error("文件已被外部修改：" + body.path);
              }
              atomicWrite(body.path, String(body.text ?? ""));
              send(res, 200, { ok: true });
              return;
            }
            if (body.op === "write-user") {
              if (!canWriteUserFile(body.path)) throw new Error("不能把文件写进产品主仓");
              atomicWrite(body.path, String(body.text ?? ""));
              send(res, 200, { ok: true });
              return;
            }
            if (body.op === "install-icon") {
              const dir = iconDir(body.target);
              if (!dir || !canWriteProduct(dir)) throw new Error("图标只能装到已授权的开发工作树");
              const png = Buffer.from(String(body.png ?? ""), "base64");
              if (png.length < 32 || png.length > 8_000_000) throw new Error("图标数据不对");
              const tmp = path.join(os.tmpdir(), `uitool-icon-${Date.now()}.png`);
              fs.writeFileSync(tmp, png);
              try {
                const run = spawnSync("python", [installScript, tmp, dir], { encoding: "utf8" });
                if (run.status !== 0) throw new Error((run.stderr || run.stdout || "生成图标失败").trim());
                send(res, 200, { ok: true, files: run.stdout.trim() });
              } finally {
                fs.rmSync(tmp, { force: true });
              }
              return;
            }
            throw new Error("未知操作");
          } catch (e) {
            send(res, 400, { error: e instanceof Error ? e.message : String(e) });
          }
        });
      });
    }
  };
}

export function hashText(text) {
  let h = 5381;
  const s = String(text ?? "");
  for (let i = 0; i < s.length; i++) h = Math.imul(h, 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}
