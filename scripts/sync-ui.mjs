// 只读产品工作树，把界面文件原样写到 .product-sources。不改产品源，不覆盖设计草稿。
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const UITOOL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIRROR = path.join(UITOOL, ".product-sources");

const PRODUCTS = [
  {
    id: "hy3d",
    source: "E:\\Code\\hy3d",
    hooks: "E:\\Code\\_shared\\worktrees\\hy3d\\cl",
    main: "E:\\Code\\hy3d",
    port: 1430,
    adapters: new Set(),
    dirty: new Set(),
    hookDirty: new Set(["ui/index.html", "ui/uitool-preview.js"])
  },
  {
    id: "hymd",
    source: "E:\\Code\\_shared\\worktrees\\hymd\\cl",
    main: "E:\\Code\\HyMdTauri2",
    port: 1420,
    adapters: new Set([
      "public/uitool-preview.txt",
      "src/platform/installPreview.ts",
      "src/platform/previewBridge.ts",
      "src/platform/previewPlatform.ts"
    ]),
    dirty: new Set([
      "src/main.tsx",
      "src/parts/TitleBar.tsx",
      "src/parts/sidebarTabs.tsx",
      "src/skins/obsidian/DockTabs.tsx",
      "src/skins/shared/DesignAux.tsx",
      "public/uitool-preview.txt",
      "src/platform/installPreview.ts",
      "src/platform/previewBridge.ts",
      "src/platform/previewPlatform.ts"
    ])
  }
];

function git(cwd, args) {
  const run = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (run.status !== 0) throw new Error(`${cwd} git ${args.join(" ")} 失败：${run.stderr || run.stdout}`);
  return run.stdout;
}

function relPosix(file) {
  return file.replace(/\\/g, "/");
}

function inScope(product, rel) {
  if (product === "hy3d") return rel.startsWith("ui/") || rel.startsWith("ui-doc/");
  if (rel.startsWith("src/") || rel.startsWith("packages/") || rel.startsWith("public/")) return true;
  return ["index.html", "package.json", "package-lock.json", "tsconfig.json", "tsconfig.node.json", "vite.config.ts"].includes(rel);
}

function isTest(rel) {
  return (
    /(^|\/)test_.*\.(js|mjs|cjs|ts|tsx)$/.test(rel) ||
    /\.(test|spec)\.(js|mjs|cjs|ts|tsx)$/.test(rel) ||
    rel.includes("/__tests__/") ||
    rel.includes("/tests/") ||
    rel.includes("/test/") ||
    rel.endsWith(".snap")
  );
}

function isGenerated(rel) {
  return /\.min\.(js|css)$/.test(rel) || rel.endsWith(".map") || rel.includes("/dist/") || rel.includes("/generated/");
}

function outsideReason(rel) {
  if (rel.startsWith("src-tauri/") || rel.includes("/src-tauri/")) return "Rust 内核";
  if (rel.startsWith("target/") || rel.includes("/target/")) return "可再生成产物";
  if (isTest(rel)) return "测试";
  if (rel.startsWith("Doc/") || rel.startsWith("docs/") || rel.endsWith(".md") || rel.endsWith(".mdx")) return "文档";
  return "和界面无关的资源";
}

function classify(product, rel) {
  if (product.adapters.has(rel) || product.dirty.has(rel)) return { category: "ADAPTED", reason: "预览钩子，只在工作树里" };
  if (isTest(rel)) return { category: "EXCLUDED", reason: "测试" };
  if (rel.endsWith(".md") || rel.endsWith(".mdx")) return { category: "EXCLUDED", reason: "文档" };
  if (rel.startsWith("ui-doc/") && !/\.(css|js|svg|png|jpg|jpeg|webp|woff2?|ttf|html)$/.test(rel)) {
    return { category: "EXCLUDED", reason: "文档" };
  }
  if (isGenerated(rel)) return { category: "GENERATED", reason: "可再生成，页面仍要原样带上" };
  return { category: "ORIGINAL", reason: "" };
}

function unexpectedChanges(cwd, allowed) {
  return git(cwd, ["status", "--porcelain", "-uall"])
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .filter((line) => !allowed.has(relPosix(line.slice(3))));
}

function assertPreviewOnly(product) {
  const sourceDirty = unexpectedChanges(product.source, product.dirty);
  if (sourceDirty.length) {
    throw new Error(`${product.source} 有预览之外的未提交改动，已停止，没有复制：\n${sourceDirty.join("\n")}`);
  }
  if (!product.hooks) return;
  const hookDirty = unexpectedChanges(product.hooks, product.hookDirty);
  if (hookDirty.length) {
    throw new Error(`${product.hooks} 有预览之外的未提交改动，已停止，没有复制：\n${hookDirty.join("\n")}`);
  }
}

function tracked(cwd) {
  return git(cwd, ["ls-files", "-z"])
    .split("\0")
    .map(relPosix)
    .filter(Boolean);
}

function head(cwd) {
  return {
    commit: git(cwd, ["rev-parse", "HEAD"]).trim(),
    short: git(cwd, ["rev-parse", "--short", "HEAD"]).trim(),
    branch: git(cwd, ["rev-parse", "--abbrev-ref", "HEAD"]).trim()
  };
}

async function hashFile(file) {
  const hash = createHash("sha256");
  let size = 0;
  await new Promise((resolve, reject) => {
    const input = createReadStream(file);
    input.on("data", (chunk) => {
      hash.update(chunk);
      size += chunk.length;
    });
    input.on("end", resolve);
    input.on("error", reject);
  });
  return { sha256: hash.digest("hex"), size };
}

async function copyHashed(src, dest) {
  if (dest.includes(".uitool.json") || src.includes(".uitool.json")) throw new Error("不会覆盖设计草稿");
  const mirrorRoot = path.resolve(MIRROR);
  const resolved = path.resolve(dest);
  if (!resolved.startsWith(mirrorRoot + path.sep)) throw new Error(`镜像路径越界：${dest}`);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  const hash = createHash("sha256");
  let size = 0;
  await new Promise((resolve, reject) => {
    const input = createReadStream(src);
    const output = createWriteStream(resolved);
    input.on("data", (chunk) => {
      hash.update(chunk);
      size += chunk.length;
    });
    input.on("error", reject);
    output.on("error", reject);
    output.on("finish", resolve);
    input.pipe(output);
  });
  return { sha256: hash.digest("hex"), size };
}

async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const current = next;
      next += 1;
      out[current] = await fn(items[current]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

function listeners() {
  const command = [
    "foreach ($p in 1420,1430,1440,1450,1460) {",
    "  $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1;",
    "  if (-not $c) { Write-Output \"$p CLOSED\" }",
    "  else { $proc = Get-CimInstance Win32_Process -Filter \"ProcessId = $($c.OwningProcess)\"; Write-Output \"$p PID $($c.OwningProcess) $($proc.CommandLine)\" }",
    "}"
  ].join(" ");
  const run = spawnSync("powershell", ["-NoProfile", "-Command", command], { encoding: "utf8" });
  return (run.stdout || "").trim();
}

function readText(file) {
  return fs.readFile(file, "utf8").catch(() => "");
}

function refsFromHtml(text) {
  const found = [];
  const re = /<(script|link)\b[^>]*>/gi;
  let match;
  while ((match = re.exec(text))) {
    const tag = match[0];
    const src = /(?:src|href)\s*=\s*["']([^"']+)["']/i.exec(tag);
    if (src) found.push(src[1]);
  }
  return found;
}

function refsFromCss(text) {
  const found = [];
  const patterns = [/@import\s+(?:url\()?["']([^"']+)["']/gi, /url\(\s*["']?([^"')]+)["']?\s*\)/gi];
  for (const re of patterns) {
    let match;
    while ((match = re.exec(text))) found.push(match[1]);
  }
  return found;
}

function refsFromSource(text) {
  const found = [];
  const re = /(?:import|export)\s+(?:[^'";]*?\sfrom\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
  let match;
  while ((match = re.exec(text))) found.push(match[1] || match[2]);
  return found;
}

function skipSpec(spec) {
  return (
    !spec ||
    spec.includes("(") ||
    spec.startsWith("data:") ||
    spec.startsWith("blob:") ||
    spec.startsWith("http:") ||
    spec.startsWith("https:") ||
    spec.startsWith("about:") ||
    spec.startsWith("#") ||
    spec.startsWith("mailto:")
  );
}

const SOURCE_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".json", ".svg", ".png", ".jpg", ".jpeg",
  ".webp", ".gif", ".woff", ".woff2", ".ttf", ".html", ".md", ".wasm", ".txt"
]);

function variants(abs) {
  const out = [abs];
  const ext = path.extname(abs).toLowerCase();
  if (ext === ".js" || ext === ".jsx") {
    const stem = abs.slice(0, -ext.length);
    out.push(`${stem}.ts`, `${stem}.tsx`, `${stem}.mjs`, `${stem}.css`);
  }
  if (!ext || !SOURCE_EXT.has(ext)) {
    for (const extra of [".ts", ".tsx", ".js", ".mjs", ".css", ".json"]) out.push(abs + extra);
    if (!ext) out.push(path.join(abs, "index.ts"), path.join(abs, "index.tsx"), path.join(abs, "index.js"));
  }
  return out;
}

async function firstFile(candidates) {
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      /* 下一个候选 */
    }
  }
  return "";
}

async function trace(product, sourceRoot, copied) {
  const unresolved = [];
  const referenced = new Map();
  const seen = new Set();
  const entry = product.id === "hy3d" ? path.join(sourceRoot, "ui", "index.html") : path.join(sourceRoot, "index.html");
  const queue = [entry];
  const main = path.join(sourceRoot, "src", "main.tsx");
  if (product.id === "hymd") queue.push(main);

  while (queue.length && seen.size < 8000) {
    const file = queue.shift();
    if (!file || seen.has(file)) continue;
    seen.add(file);
    let text = "";
    try {
      text = await fs.readFile(file, "utf8");
    } catch {
      unresolved.push({ from: path.relative(sourceRoot, file), spec: "", reason: "入口不存在" });
      continue;
    }
    const ext = path.extname(file).toLowerCase();
    const specs = ext === ".html" ? refsFromHtml(text) : ext === ".css" ? refsFromCss(text) : refsFromSource(text);
    for (const spec of specs) {
      if (skipSpec(spec)) continue;
      if (spec.startsWith("/@") || spec.startsWith("@") || (!spec.startsWith(".") && !spec.startsWith("/") && ext !== ".html" && ext !== ".css")) {
        const name = spec.startsWith("@") || spec.startsWith("/@") ? spec.split("/").slice(spec.startsWith("/") ? 1 : 0, spec.startsWith("/") ? 3 : 2).join("/") : spec.split("/")[0];
        referenced.set(name, "依赖包，由产品自己的入口解析，不复制进镜像");
        continue;
      }
      const clean = spec.split("?")[0].split("#")[0];
      let resolved = "";
      if (clean.startsWith("/")) {
        const roots = product.id === "hy3d" ? [path.join(sourceRoot, "ui")] : [path.join(sourceRoot, "public"), sourceRoot];
        for (const root of roots) {
          resolved = await firstFile(variants(path.join(root, clean.slice(1))));
          if (resolved) break;
        }
      } else {
        resolved = await firstFile(variants(path.resolve(path.dirname(file), clean)));
      }
      const rooted = path.resolve(sourceRoot);
      if (!resolved || !path.resolve(resolved).startsWith(rooted)) {
        unresolved.push({ from: relPosix(path.relative(sourceRoot, file)), spec, reason: "从入口追不到这个相对路径" });
        continue;
      }
      const rel = relPosix(path.relative(sourceRoot, resolved));
      if (!copied.has(rel) && !product.adapters.has(rel)) {
        unresolved.push({ from: relPosix(path.relative(sourceRoot, file)), spec, reason: "文件在，但没有进入镜像" });
      }
      if (/\.(html|css)$/.test(resolved) || (product.id === "hymd" && /\.(tsx?|mjs)$/.test(resolved))) queue.push(resolved);
    }
  }
  return {
    unresolved,
    referenced: [...referenced.entries()].map(([spec, reason]) => ({ spec, category: "REFERENCED", reason }))
  };
}

async function prune(dir, keep) {
  async function walk(current) {
    let names = [];
    try {
      names = await fs.readdir(current);
    } catch {
      return;
    }
    for (const name of names) {
      const abs = path.join(current, name);
      const rel = relPosix(path.relative(dir, abs));
      const stat = await fs.lstat(abs);
      if (stat.isDirectory()) {
        await walk(abs);
        const left = await fs.readdir(abs);
        if (left.length === 0) await fs.rmdir(abs);
      } else if (!keep.has(rel)) {
        await fs.rm(abs);
      }
    }
  }
  await walk(dir);
}

async function overlayHy3dPreview(product, mirrorRoot, records) {
  const hookSrc = path.join(product.hooks, "ui", "uitool-preview.js");
  const hookDest = path.join(mirrorRoot, "ui", "uitool-preview.js");
  const hashed = await copyHashed(hookSrc, hookDest);
  records.push({
    product: "hy3d",
    sourceCommit: head(product.hooks).commit,
    sourcePath: "ui/uitool-preview.js",
    mirrorPath: relPosix(path.relative(UITOOL, hookDest)),
    sha256: hashed.sha256,
    size: hashed.size,
    category: "ADAPTED",
    reason: "预览脚本只写进镜像，产品源文件没改"
  });
  const indexPath = path.join(mirrorRoot, "ui", "index.html");
  const html = await fs.readFile(indexPath, "utf8");
  const needle = '<script src="host.js"></script>';
  if (!html.includes(needle)) throw new Error("主仓 ui/index.html 没有 host.js，没有改产品源，也没有改镜像");
  if (!html.includes("uitool-preview.js")) {
    await fs.writeFile(indexPath, html.replace(needle, `${needle}\n  <script src="uitool-preview.js"></script>`));
  }
  const indexHash = await hashFile(indexPath);
  const indexRecord = records.find((item) => item.sourcePath === "ui/index.html");
  if (!indexRecord) throw new Error("镜像里没有 ui/index.html");
  indexRecord.sha256 = indexHash.sha256;
  indexRecord.size = indexHash.size;
  indexRecord.category = "ADAPTED";
  indexRecord.reason = "镜像里在 host.js 后加上预览脚本，产品源文件没改";
}

async function syncProduct(product, running) {
  assertPreviewOnly(product);
  const sourceHead = head(product.source);
  const mainHead = head(product.main);
  const files = tracked(product.source);
  const outside = new Map();
  const scoped = [];
  for (const rel of files) {
    if (!inScope(product.id, rel)) {
      const reason = outsideReason(rel);
      outside.set(reason, (outside.get(reason) || 0) + 1);
      continue;
    }
    scoped.push(rel);
  }
  for (const rel of product.adapters) {
    if (!scoped.includes(rel)) {
      try {
        await fs.stat(path.join(product.source, rel));
        scoped.push(rel);
      } catch {
        /* 适配文件还没放进工作树 */
      }
    }
  }

  const mirrorRoot = path.join(MIRROR, product.id);
  await fs.mkdir(mirrorRoot, { recursive: true });
  const records = await pool(scoped, 16, async (rel) => {
    const { category, reason } = classify(product, rel);
    const sourcePath = path.join(product.source, rel);
    const record = {
      product: product.id,
      sourceCommit: sourceHead.commit,
      sourcePath: rel,
      mirrorPath: "",
      sha256: "",
      size: 0,
      category,
      reason
    };
    if (category === "EXCLUDED") {
      const hashed = await hashFile(sourcePath);
      record.sha256 = hashed.sha256;
      record.size = hashed.size;
      return record;
    }
    const mirrorPath = path.join(mirrorRoot, rel);
    const hashed = await copyHashed(sourcePath, mirrorPath);
    record.mirrorPath = relPosix(path.relative(UITOOL, mirrorPath));
    record.sha256 = hashed.sha256;
    record.size = hashed.size;
    return record;
  });

  if (product.id === "hy3d") await overlayHy3dPreview(product, mirrorRoot, records);
  const copied = new Set(records.filter((item) => item.mirrorPath).map((item) => item.sourcePath));
  const deps = await trace(product, product.source, copied);
  const keep = new Set(records.filter((item) => item.mirrorPath).map((item) => item.sourcePath));
  keep.add("source-manifest.json");
  await prune(mirrorRoot, keep);

  const counts = {};
  for (const item of records) counts[item.category] = (counts[item.category] || 0) + 1;
  const manifest = {
    product: product.id,
    sourceRoot: product.source,
    sourceCommit: sourceHead.commit,
    sourceShort: sourceHead.short,
    sourceBranch: sourceHead.branch,
    mainRoot: product.main,
    mainCommit: mainHead.commit,
    hookCommit: product.hooks ? head(product.hooks).commit : "",
    mainShort: mainHead.short,
    mainBranch: mainHead.branch,
    running,
    counts,
    outside: [...outside.entries()].map(([reason, count]) => ({ reason, count })),
    referenced: deps.referenced,
    unresolved: deps.unresolved,
    files: records
  };
  await fs.writeFile(path.join(mirrorRoot, "source-manifest.json"), JSON.stringify(manifest, null, 2));
  return manifest;
}

const running = listeners();
const manifests = [];
for (const product of PRODUCTS) manifests.push(await syncProduct(product, running));
const summary = {
  running,
  products: manifests.map((item) => ({
    product: item.product,
    sourceCommit: item.sourceCommit,
    sourceBranch: item.sourceBranch,
    mainCommit: item.mainCommit,
    mainBranch: item.mainBranch,
    counts: item.counts,
    outside: item.outside,
    referenced: item.referenced.length,
    unresolved: item.unresolved.length
  }))
};
await fs.writeFile(path.join(MIRROR, "source-manifest.json"), JSON.stringify({ running, products: manifests }, null, 2));
console.log(JSON.stringify(summary, null, 2));
