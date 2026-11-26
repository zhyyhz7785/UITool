// UITool-only virtual explorer host. Never expose a Tauri bridge or a real file path.
(function () {
  "use strict";
  const query = new URLSearchParams(location.search);
  if (location.hostname !== "127.0.0.1" || location.port !== "1450" ||
      query.get("uitool") !== "1" || !window.Host || window.Host.hasTauri()) return;

  const host = window.Host;
  const base = "X:\\UITool-Demo";
  const filesRoot = base + "\\DWGS";
  const projectRoot = base + "\\示例工程";
  const workspacePath = base + "\\示例.hy3d-workspace";
  const norm = (p) => String(p || "").replace(/\//g, "\\").replace(/\\+$/, "").toLowerCase();
  const join = (p, name) => p + "\\" + name;
  const parent = (p) => p.slice(0, p.lastIndexOf("\\"));
  const leaf = (p) => p.slice(p.lastIndexOf("\\") + 1);
  const dirs = new Map();
  const workspaces = new Map();
  const marks = new Map();
  const entry = (name, isDir = false) => ({ name, isDir, mtimeMs: 0, size: 0 });
  function seed(dir, entries) { dirs.set(norm(dir), entries); }
  seed("X:", [entry("UITool-Demo", true)]);
  seed(base, [entry("DWGS", true), entry("示例工程", true), entry("示例.hy3d-workspace")]);
  seed(filesRoot, [entry("01-基础", true), entry("02-结构", true), entry("空文件夹", true),
    entry("示例-平面.dwg"), entry("示例-详图.dxf"), entry("示例-模型.hyc"), entry("示例-说明.pdf")]);
  seed(join(filesRoot, "01-基础"), [entry("基础平面.dwg"), entry("基础详图.dxf")]);
  seed(join(filesRoot, "02-结构"), [entry("结构平面.dwg")]);
  seed(join(filesRoot, "空文件夹"), []);
  seed(projectRoot, [entry("图纸", true), entry("示例-总图.dwg"), entry("示例-节点.dxf")]);
  seed(join(projectRoot, "图纸"), [entry("结构平面.dwg")]);
  workspaces.set(norm(workspacePath), { path: workspacePath, name: "示例工程夹", folders: [projectRoot] });
  marks.set(norm(projectRoot), { name: "示例工程（模拟）" });

  function directory(path) {
    const rows = dirs.get(norm(path));
    if (!rows) throw new Error("UITool 模拟目录不存在：" + path);
    return rows;
  }
  function page(path) {
    return { entries: directory(path).map((e) => ({ ...e })), omitted: 0 };
  }
  function validName(name) {
    if (typeof name !== "string" || !name.trim() || name === "." || name === ".." ||
        /[\\/:*?"<>|]/.test(name)) throw new Error("请输入有效的模拟名称");
    return name;
  }
  function add(dir, name, isDir) {
    const rows = directory(dir);
    validName(name);
    if (rows.some((e) => norm(e.name) === norm(name))) throw new Error("模拟名称已存在");
    const path = join(dir, name);
    rows.push(entry(name, !!isDir));
    if (isDir) seed(path, []);
    return path;
  }
  function lookup(path) {
    const rows = directory(parent(path));
    const i = rows.findIndex((e) => norm(e.name) === norm(leaf(path)));
    if (i < 0) throw new Error("模拟对象不存在");
    return { rows, i, item: rows[i] };
  }
  function remove(path) {
    const { rows, i } = lookup(path);
    rows.splice(i, 1);
    const key = norm(path);
    for (const k of dirs.keys()) if (k === key || k.startsWith(key + "\\")) dirs.delete(k);
    marks.delete(key);
  }
  function rename(path, name) {
    validName(name);
    const { rows, item } = lookup(path);
    if (rows.some((e) => e !== item && norm(e.name) === norm(name))) throw new Error("模拟名称已存在");
    const next = join(parent(path), name);
    const from = norm(path), to = norm(next);
    for (const [k, children] of [...dirs]) {
      if (k === from || k.startsWith(from + "\\")) {
        dirs.delete(k);
        dirs.set(to + k.slice(from.length), children);
      }
    }
    item.name = name;
    return next;
  }
  function workspace(path) {
    const dto = workspaces.get(norm(path));
    if (!dto) throw new Error("UITool 模拟工作区不存在");
    return { ...dto, folders: dto.folders.slice() };
  }
  let clipboard = null;
  const bind = (name, fn) => { host[name] = (...args) => Promise.resolve().then(() => fn(...args)); };
  bind("explorerPickFolder", () => filesRoot);
  bind("explorerReadDir", page);
  bind("explorerReadDirs", (paths) => paths.map((dir) => {
    try { return { dir, ...page(dir) }; } catch (e) { return { dir, error: e.message }; }
  }));
  bind("explorerCreate", add);
  bind("explorerRename", rename);
  bind("explorerDelete", remove);
  bind("explorerWatch", () => null);
  bind("explorerReveal", () => { throw new Error("模拟目录不在真实磁盘上"); });
  bind("explorerDragOut", () => { throw new Error("模拟文件不能拖出预览"); });
  bind("explorerClipboardWrite", (paths, cut) => {
    paths.forEach(lookup);
    clipboard = { paths: paths.slice(), isMove: !!cut };
    return true;
  });
  bind("explorerClipboardRead", () => clipboard && { ...clipboard, paths: clipboard.paths.slice() });
  bind("explorerTransfer", () => { throw new Error("当前场景只预览文件操作，不执行复制或移动"); });
  bind("explorerOpenDrawing", (path) => {
    lookup(path);
    return { opened: [], failed: [{ error: "这是 UITool 模拟图纸，不读取真实 CAD 文件" }] };
  });
  bind("projectRead", (dir) => { directory(dir); return marks.get(norm(dir)) || null; });
  bind("projectMark", (dir, name) => { directory(dir); const mark = { name }; marks.set(norm(dir), mark); return mark; });
  bind("projectUnmark", (dir) => { directory(dir); marks.delete(norm(dir)); });
  bind("projectCreate", (dir, name) => {
    const path = add(dir, name, true);
    marks.set(norm(path), { name });
    return path;
  });
  bind("projectOpenWorkspace", () => workspace(workspacePath));
  bind("projectWorkspaceRead", workspace);
  bind("projectSaveWorkspace", (name) => {
    validName(name);
    const path = join(base, name + ".hy3d-workspace");
    workspaces.set(norm(path), { path, name, folders: [] });
    return path;
  });
  bind("projectWorkspaceAdd", (path, dir) => {
    directory(dir);
    workspace(path);
    const dto = workspaces.get(norm(path));
    if (!dto.folders.some((p) => norm(p) === norm(dir))) dto.folders.push(dir);
    return workspace(path);
  });
  // Snapshot UI can capture and restore virtual tree state without a native document host.
  bind("docTabs", () => ({ tabs: [], active: null }));

  // The actual product initializes its trees synchronously after host.js.
  // Seed only these boot keys, in the separate 1450 preview origin. A scene switch
  // intentionally resets roots; the product's actual settings/files are never touched.
  const populated = query.get("explorer") !== "empty";
  const roots = {
    "hy3d.explorer.root": filesRoot,
    "hy3d.project.root": projectRoot,
    "hy3d.project.title": "示例工程（模拟）",
    "hy3d.project.workspace": workspacePath
  };
  try {
    for (const [key, value] of Object.entries(roots)) {
      if (populated) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    }
  } catch {
    // Some embedded environments deny storage; use existing tree APIs after boot.
    if (populated) window.addEventListener("load", () => {
      if (!window.Explorer || !window.Project) return;
      window.Explorer.files.open(filesRoot);
      window.Project.restoreWorkspace({ path: workspacePath, workspaces: [], projects: [], files: [] });
    }, { once: true });
  }
})();
