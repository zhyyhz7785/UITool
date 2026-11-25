// 开发服务器只读提供 hy3d / HyMd 的壳层样式。不复制进仓库，也不提供脚本。
import fs from "node:fs";
import path from "node:path";
import { hy3dReadRoot, hymdReadRoot } from "./path-policy.mjs";

const TYPES = {
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf"
};

function safeRel(rel) {
  const n = String(rel ?? "").replace(/\\/g, "/");
  if (!n || n.startsWith("/") || n.includes("\0")) return "";
  const parts = n.split("/");
  if (parts.some((p) => !p || p === "." || p === "..")) return "";
  if (!parts.every((p) => /^[A-Za-z0-9._-]+$/.test(p))) return "";
  return n;
}

/** 只放行壳层样式和它引用的字体、图标。 */
export function allowedProductRel(product, rel) {
  const n = safeRel(rel);
  if (!n) return false;
  const ext = path.posix.extname(n).toLowerCase();
  if (!TYPES[ext]) return false;
  if (product === "hy3d") {
    if (n === "ui/tokens.css" || n === "ui/styles.css" || n === "ui/cad-workspace.css" || n === "ui/icons.svg") return true;
    if (/^ui\/palettes\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(n)) return true;
    if (/^ui\/skins\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(n)) return true;
    if (/^ui\/fonts\/[A-Za-z0-9._-]+$/.test(n)) return true;
    return false;
  }
  if (product === "hymd") {
    if (n === "src/parts/seti/seti.woff") return true;
    if (ext !== ".css") return false;
    if (n === "src/styles.css" || n === "src/editor/layoutPreview/ui-tokens.css") return true;
    return n.startsWith("src/styles/");
  }
  return false;
}

function rootOf(product) {
  try {
    if (product === "hy3d") return hy3dReadRoot();
    if (product === "hymd") return hymdReadRoot();
  } catch {
    return "";
  }
  return "";
}

function localHost(req) {
  const host = String(req.headers.host || "");
  return /^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(host);
}

export function productCssPlugin() {
  return {
    name: "uitool-product-css",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || "";
        if (!url.startsWith("/__uitool/product/")) return next();
        if (!localHost(req)) {
          res.statusCode = 403;
          res.end("only localhost");
          return;
        }
        if (req.method !== "GET" && req.method !== "HEAD") {
          res.statusCode = 405;
          res.end("read only");
          return;
        }
        let pathOnly = url.split("?")[0];
        try {
          pathOnly = decodeURIComponent(pathOnly);
        } catch {
          res.statusCode = 400;
          res.end("bad path");
          return;
        }
        const rest = pathOnly.slice("/__uitool/product/".length);
        const slash = rest.indexOf("/");
        if (slash < 1) {
          res.statusCode = 404;
          res.end("not found");
          return;
        }
        const product = rest.slice(0, slash);
        const rel = rest.slice(slash + 1);
        if (!allowedProductRel(product, rel)) {
          res.statusCode = 404;
          res.end("not found");
          return;
        }
        const root = rootOf(product);
        if (!root) {
          res.statusCode = 404;
          res.end("no product root");
          return;
        }
        const full = path.resolve(root, rel);
        const base = path.resolve(root);
        if (full !== base && !full.startsWith(base + path.sep)) {
          res.statusCode = 404;
          res.end("not found");
          return;
        }
        let stat;
        try {
          stat = fs.statSync(full);
        } catch {
          res.statusCode = 404;
          res.end("not found");
          return;
        }
        if (!stat.isFile()) {
          res.statusCode = 404;
          res.end("not found");
          return;
        }
        const ext = path.extname(full).toLowerCase();
        res.statusCode = 200;
        res.setHeader("Content-Type", TYPES[ext] || "application/octet-stream");
        res.setHeader("Cache-Control", "no-store");
        if (req.method === "HEAD") {
          res.end();
          return;
        }
        fs.createReadStream(full).pipe(res);
      });
    }
  };
}
