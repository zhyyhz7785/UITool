# {{APP_TITLE}}

由 UITool 设计导出的 Tauri 2 + React + Vite + Rust 工程。界面已经设计好，与内核分离，可以直接继续开发。

## 运行

```bash
npm install
npm run dev          # 只看界面：浏览器打开 http://localhost:1420，内核用模拟（src/core/mock.ts）
npm run tauri dev    # 桌面应用：启动 Rust 内核
npm run tauri build  # 打包安装程序
cargo test -p app-core  # 单测内核
```

需要 Node 20.19+ / 22.12+（Vite 8 的要求，`.node-version` 写的是 24，fnm / nvm 会自动切换）、Rust（stable）以及 Tauri 2 的系统依赖（Windows 自带 WebView2）。

## 目录

```
src/                     界面（React）
  ui.config.json         ← UITool 设计结果：布局、尺寸、主题、各部件内容、命令
  App.tsx                入口：注册前端命令处理函数
  workbench/             工作台壳（标题栏、活动栏、侧栏、编辑区、面板、状态栏、命令面板、设置）
  views/                 视图组件，按 id 登记在 views/index.ts
  theme/                 配色系统：registry.ts（颜色键）、themes/*.json（主题）、hy-tokens.json（尺寸令牌）
  icons/                 工具图标（来自 UI设计规范/12-工具图标 的推荐项）
  core/                  ← 界面调用内核的唯一入口
    contract.ts          方法与事件约定（界面 ↔ 内核）
    index.ts             core.call / core.on
    tauri.ts / mock.ts   两种传输：桌面走 Tauri，浏览器走模拟
  platform/window.ts     窗口操作（最小化 / 最大化 / 关闭）
src-tauri/               Tauri 外壳：只转发，不写业务
core/                    内核（Rust crate，不依赖 Tauri）
```

## 界面与内核的接口

界面只用两种调用：

```ts
import { core } from "./core";
const tree = await core.call("workspace.tree");          // 方法调用
const off = core.on("task.progress", (p) => { … });      // 订阅内核事件
```

- 桌面：`core.call` → `invoke("core_call", { method, params })` → `core/src/lib.rs` 的 `Core::call`。
- 内核推事件：`EventSink::emit(event, data)` → 前端事件 `core://event` → `core.on(event)`。
- 浏览器：自动换成 `src/core/mock.ts`，数据形状与 Rust 一致。

新增一个功能：

1. `src/core/contract.ts`：在 `CoreMethods` / `CoreEvents` 加类型；
2. `core/src/lib.rs`：在 `Core::call` 的 `match` 加分支；
3. `src/core/mock.ts`：加同名模拟（可选，方便只做界面）；
4. 界面里 `core.call("新方法", 参数)`。

## 界面方案

同一工作类型有 3 套呈现（最优 / 次优 / 一般），写在 `ui.config.json` 的 `schemes` 里。顶层布局是当前这一套。命令、菜单、弹窗定义是共用的。

- 视图菜单「界面方案」，或设置里的「布局 → 界面方案」。
- 切换前会记住这一套拖过的尺寸；「重置布局」回到该套的设计值。
- 弹窗在 `dialogs` 里。呈现由 `layout.dialogStyle` 决定：`modal` 居中、`sheet` 右侧抽屉、`wizard` 分步。某个弹窗可以单独写 `style`。

## 命令

菜单、工具栏、状态栏、命令面板都只引用命令 id。命令执行顺序：

1. `App.tsx` 里 `handlers` 注册的前端函数；
2. 工作台内置命令（`workbench.action.*`，见 `src/workbench/commands.ts`）；
3. `dialogs` 里对上 `command` 的弹窗；
4. `ui.config.json` 里该命令的 `core` 字段 → `core.call(core, params)`；
5. 都没有：右下角提示「还没有实现」。

所以接功能时通常只需要在内核实现 `ui.config.json` 里已经写好的 `core` 方法名（如 `file.open`），界面不用改。

## 配色系统（参考 VSCode）

- 颜色键沿用 VSCode 主题的 workbench 键名（`titleBar.activeBackground`、`sideBar.background`……），另加一组 `base.*` 基础键。
- CSS 变量名与 VSCode webview 相同：`--vscode-<键名把 . 换成 ->`，例如 `var(--vscode-editor-background)`。
- 主题文件就是 VSCode 主题格式：`src/theme/themes/<id>.json`。缺的键按 `registry.ts` 的默认值从 `base.*` 派生，所以只改 `base.accent` 一项，按钮、焦点、徽标、选中、状态栏都会跟着变。
- 往 `themes/` 里放一个 VSCode 主题 JSON 就多一套主题。
- 尺寸（字号、行高、栏高）与颜色分开，由「紧凑 / 舒适」密度控制，来自 `hy-tokens.json`。组件只写变量，不写死色值。

## hy 界面硬规则

- HR1 主工具栏上侧 / 侧面可切换（`layout.toolbar.position`，Ctrl+Shift+T）。
- HR2 命令提示栏只由用户手动开闭，禁止自动显隐撑窗。
- HR3 顶栏高度 `--h-title` = 28px。
- 图标统称「工具图标」，来源 `UI设计规范/12-工具图标`。

## 回到 UITool 继续调界面

在 UITool 里「打开设计」选择本工程的 `src/ui.config.json`，调好后重新导出，或者只把新的 `ui.config.json` 覆盖回来即可（界面代码不变）。
