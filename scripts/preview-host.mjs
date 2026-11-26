// 只给设计器拉起产品前端。不编译 Rust，不碰产品主仓。
// 预览固定走 1450（hy3d）和 1460（HyMd），不占用产品自己的 1430 和 1420。
// HY3D 有镜像时静态服务整棵 ui/，包含 index.html 里的全部脚本和样式。不走 CSS 白名单。
import { spawn, spawnSync } from "node:child_process";
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { a5Html, a5RibbonSource } from "./hy3d-a5-preview.mjs";
import { layerDesignHtml, layerDesignSource } from "./hy3d-layer-design.mjs";
import { applyCommandIcons, appendCadSymbols, loadCadPack } from "./hy3d-cad-icons.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EXPLORER_FIXTURE = path.join(HERE, "hy3d-explorer-fixture.js");
const A5_CSS = path.join(HERE, "hy3d-a5-preview.css");
const LAYER_CSS = path.join(HERE, "hy3d-layer-design.css");
const LAYER_SCENE = path.join(HERE, "hy3d-layer-scene.js");
const MIRROR_UI = path.resolve(HERE, "..", ".product-sources", "hy3d", "ui");
const MIRROR_HYMD = path.resolve(HERE, "..", ".product-sources", "hymd");
const WORKTREE_UI = "E:\\Code\\_shared\\worktrees\\hy3d\\cl\\ui";
const HYMD_ROOT = "E:\\Code\\_shared\\worktrees\\hymd\\cl";

function hy3dUi() {
  if (existsSync(path.join(MIRROR_UI, "index.html")) && existsSync(path.join(MIRROR_UI, "app_ribbon.js"))) return MIRROR_UI;
  return WORKTREE_UI;
}

function hymdFilesRoot() {
  if (existsSync(path.join(MIRROR_HYMD, "src", "styles.css"))) return MIRROR_HYMD;
  return HYMD_ROOT;
}

const PRODUCTS = {
  hy3d: { port: 1450, probe: "/index.html", marker: "/uitool-preview.js", root: WORKTREE_UI },
  hymd: { port: 1460, probe: "/", marker: "/uitool-preview.txt", root: HYMD_ROOT }
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm",
  ".map": "application/json"
};

let hy3dServer = null;
let hymdChild = null;

function local(req) {
  const ip = req.socket?.remoteAddress || "";
  return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function probe(port, urlPath) {
  return new Promise((resolve) => {
    const req = http.get({ hostname: "127.0.0.1", port, path: urlPath, timeout: 800 }, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 300);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

function serveHy3d() {
  if (hy3dServer) return Promise.resolve(true);
  const root = hy3dUi();
  if (!existsSync(root)) return Promise.resolve(false);
  const cadPack = loadCadPack();
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let url, raw;
      try {
        url = new URL(req.url || "/", "http://127.0.0.1:1450");
        raw = decodeURIComponent(url.pathname);
      } catch {
        res.statusCode = 400;
        res.end();
        return;
      }
      if (!local(req)) {
        res.statusCode = 403;
        res.end();
        return;
      }
      if (raw === "/__uitool-layer.css" || raw === "/__uitool-layer-scene.js") {
        res.setHeader("content-type", MIME[raw.endsWith(".css") ? ".css" : ".js"]);
        res.setHeader("cache-control", "no-store");
        createReadStream(raw.endsWith(".css") ? LAYER_CSS : LAYER_SCENE).pipe(res);
        return;
      }
      if (raw === "/__uitool-layer-layout.js") {
        res.setHeader("content-type", MIME[".js"]);
        res.setHeader("cache-control", "no-store");
        try {
          res.end(layerDesignSource(readFileSync(path.join(root, "skins", "hy-ribbon", "layout.js"), "utf8")));
        } catch (error) {
          res.statusCode = 502;
          res.end("// UITool layer design incompatible: " + JSON.stringify(String(error)));
        }
        return;
      }
      if (raw === "/__uitool-a5.css") {
        res.setHeader("content-type", MIME[".css"]);
        res.setHeader("cache-control", "no-store");
        createReadStream(A5_CSS).pipe(res);
        return;
      }
      if (raw === "/__uitool-a5-layout.js") {
        res.setHeader("content-type", MIME[".js"]);
        res.setHeader("cache-control", "no-store");
        try {
          res.end(a5RibbonSource(readFileSync(path.join(root, "skins", "hy-ribbon", "layout.js"), "utf8")));
        } catch (error) {
          res.statusCode = 502;
          res.end("// UITool A5 source incompatible: " + JSON.stringify(String(error)));
        }
        return;
      }
      if (raw === "/__uitool-explorer-fixture.js") {
        res.setHeader("content-type", MIME[".js"]);
        res.setHeader("cache-control", "no-store");
        createReadStream(EXPLORER_FIXTURE).pipe(res);
        return;
      }
      const rel = raw === "/" ? "index.html" : raw.replace(/^\/+/, "");
      const file = path.resolve(root, rel);
      const inside = path.relative(root, file);
      if (inside.startsWith("..") || path.isAbsolute(inside)) {
        res.statusCode = 403;
        res.end();
        return;
      }
      let target = file;
      try {
        if (statSync(target).isDirectory()) target = path.join(target, "index.html");
        if (!statSync(target).isFile()) throw new Error("missing");
      } catch {
        res.statusCode = 404;
        res.end();
        return;
      }
      res.statusCode = 200;
      res.setHeader("content-type", MIME[path.extname(target).toLowerCase()] || "application/octet-stream");
      res.setHeader("cache-control", "no-store");
      // Only the dedicated preview origin (1450) serves the candidate command art.
      // Keep native handlers, placements, labels and all non-command symbols untouched.
      try {
        if (rel === "icons.svg") {
          res.end(appendCadSymbols(readFileSync(target, "utf8"), cadPack));
          return;
        }
        if (rel === "commands.json" || /^commands\/[^/]+\.json$/.test(rel)) {
          const doc = JSON.parse(readFileSync(target, "utf8"));
          res.end(JSON.stringify(applyCommandIcons(doc, cadPack)));
          return;
        }
      } catch (error) {
        res.statusCode = 502;
        res.end("UITool CAD 图标预览失败：" + String(error));
        return;
      }
      // Only UITool's own preview response is changed. The source tree stays read-only.
      if (rel === "index.html" && url.searchParams.get("uitool") === "1") {
        const html = readFileSync(target, "utf8");
        const hostScript = /<script\b[^>]*\bsrc\s*=\s*["'](?:\.\/)?host\.js["'][^>]*>\s*<\/script\s*>/i;
        if (!hostScript.test(html)) {
          res.statusCode = 502;
          res.end("UITool: HY3D host.js entry not found; preview fixture cannot be installed.");
          return;
        }
        let previewHtml = html.replace(hostScript, (tag) => tag + '\n<script src="/__uitool-explorer-fixture.js"></script>');
        if (url.searchParams.get("style") === "layer") {
          try {
            const native = readFileSync(path.join(root, "skins", "hy-ribbon", "layout.js"), "utf8");
            layerDesignSource(native);
            previewHtml = layerDesignHtml(previewHtml, !/\bnativeCadProfile:\s*true\b/.test(native));
          } catch (error) {
            res.statusCode = 502;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("UITool 图层设计与当前镜像的布局接口不匹配。请反馈下方错误，或切换 HY Ribbon / A5 查看原界面。\n" + String(error));
            return;
          }
        }
        if (url.searchParams.get("style") === "a5") {
          try {
            // Validate native source before sending the adapted page; no silent fallback.
            const native = readFileSync(path.join(root, "skins", "hy-ribbon", "layout.js"), "utf8");
            if (/\bnativeCadProfile:\s*true\b/.test(native)) {
              // Product now owns the CAD profile. Select the real skin before boot;
              // do not run the old A5 source rewrite or add its CSS.
              if (!/<\/head\s*>/i.test(previewHtml)) throw new Error("缺少 head 入口");
              previewHtml = previewHtml.replace(/<\/head\s*>/i, '<script>try{localStorage.setItem("hy3d.ui.skin","hy-ribbon")}catch(e){}</script></head>');
            } else {
              a5RibbonSource(native);
              previewHtml = a5Html(previewHtml);
            }
          } catch (error) {
            res.statusCode = 502;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("UITool A5 预览与当前 HY3D 前端不兼容。切换原始预览，或同步产品前端镜像。\n" + String(error));
            return;
          }
        }
        res.end(previewHtml);
        return;
      }
      createReadStream(target).pipe(res);
    });
    server.once("error", () => resolve(false));
    server.listen(PRODUCTS.hy3d.port, "127.0.0.1", () => {
      hy3dServer = server;
      resolve(true);
    });
  });
}

function startHymd() {
  if (!existsSync(path.join(HYMD_ROOT, "package.json"))) return false;
  const viteBin = path.join(HYMD_ROOT, "node_modules", "vite", "bin", "vite.js");
  if (!existsSync(viteBin)) return false;
  if (hymdChild && hymdChild.exitCode == null && !hymdChild.killed) return true;
  hymdChild = spawn(process.execPath, [viteBin, "--host", "127.0.0.1", "--port", String(PRODUCTS.hymd.port), "--strictPort"], {
    cwd: HYMD_ROOT,
    detached: true,
    stdio: "ignore",
    windowsHide: true
  });
  hymdChild.unref();
  return true;
}

function commitOf(dir) {
  if (!existsSync(dir)) return "";
  const run = spawnSync("git", ["-C", dir, "rev-parse", "--short", "HEAD"], { encoding: "utf8" });
  return run.status === 0 ? run.stdout.trim() : "";
}

function hymdShellFiles() {
  const files = [];
  const root = hymdFilesRoot();
  const add = (rel) => {
    const file = path.join(root, rel);
    if (existsSync(file) && statSync(file).isFile()) files.push({ path: `src/product-shell/${rel}`, text: readFileSync(file, "utf8") });
  };
  add("src/styles.css");
  const walk = (abs, rel) => {
    if (!existsSync(abs)) return;
    for (const name of readdirSync(abs)) {
      const child = path.join(abs, name);
      const childRel = `${rel}/${name}`;
      if (statSync(child).isDirectory()) walk(child, childRel);
      else if (name.endsWith(".css")) add(childRel);
    }
  };
  walk(path.join(root, "src", "styles"), "src/styles");
  return files;
}

async function waitUp(product, tries) {
  for (let i = 0; i < tries; i += 1) {
    if (await probe(product.port, product.probe)) return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

export function previewHostPlugin() {
  return {
    name: "uitool-preview-host",
    configureServer(server) {
      server.middlewares.use("/__uitool/preview", (req, res) => {
        if (!local(req)) {
          res.statusCode = 403;
          res.end();
          return;
        }
        const url = new URL(req.url || "/", "http://127.0.0.1");
        const pathname = url.pathname.replace(/^\/__uitool\/preview/, "") || "/";
        const productId = url.searchParams.get("product");
        const product = PRODUCTS[productId];
        if (!product) {
          send(res, 400, { error: "未知产品" });
          return;
        }
        if (req.method === "GET" && pathname === "/shell") {
          send(res, 200, { files: hymdShellFiles() });
          return;
        }
        if (req.method === "GET" && pathname === "/status") {
          Promise.all([probe(product.port, product.probe), probe(product.port, product.marker)]).then(([up, marked]) =>
            send(res, 200, {
              up,
              preview: up && marked,
              page: productId === "hy3d" ? up : up && marked,
              commit: marked ? commitOf(product.root) : "",
              product: productId
            })
          );
          return;
        }
        if (req.method === "POST" && pathname === "/start") {
          Promise.all([probe(product.port, product.probe), probe(product.port, product.marker)]).then(async ([up, hasMarker]) => {
            if (up && hasMarker) {
              send(res, 200, { up: true, preview: true, page: true, commit: commitOf(product.root), started: false });
              return;
            }
            if (up) {
              send(res, 200, { up: true, preview: false, page: productId === "hy3d", commit: "", started: false });
              return;
            }
            if (productId === "hy3d") {
              const listening = await serveHy3d();
              const ready = listening && (await waitUp(product, 10));
              const preview = ready && (await probe(product.port, product.marker));
              send(res, ready ? 200 : 502, { up: ready, preview, page: ready, commit: preview ? commitOf(product.root) : "", started: listening });
              return;
            }
            const spawned = startHymd();
            const ready = spawned && (await waitUp(product, 60));
            const preview = ready && (await probe(product.port, product.marker));
            send(res, ready && preview ? 200 : 502, { up: ready, preview, page: ready && preview, commit: preview ? commitOf(product.root) : "", started: spawned });
          });
          return;
        }
        send(res, 404, { error: "没有这个预览接口" });
      });
    }
  };
}
