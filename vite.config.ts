import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
// 插件是给开发服务器用的普通脚本，没有类型声明。
// @ts-expect-error 开发服务器本地读写
import { linkFsPlugin } from "./scripts/link-fs-plugin.mjs";
// @ts-expect-error 本机开发态连接中转
import { liveBrokerPlugin } from "./scripts/live-broker.mjs";
// @ts-expect-error 旧的样式白名单。产品预览不走这里，走各自的整页入口。
import { productCssPlugin } from "./scripts/product-css.mjs";
// @ts-expect-error 只拉起产品前端，不编译 Rust
import { previewHostPlugin } from "./scripts/preview-host.mjs";

const host = process.env.TAURI_DEV_HOST;

// @tpl 指向 template/src：设计器的预览和导出的工程用的是同一份界面代码
export default defineConfig({
  plugins: [react(), productCssPlugin(), linkFsPlugin(), liveBrokerPlugin(), previewHostPlugin()],
  define: { "import.meta.env.VITE_UIT_DESIGNER": JSON.stringify("1") },
  clearScreen: false,
  build: { chunkSizeWarningLimit: 2000 },
  resolve: {
    alias: {
      "@tpl": fileURLToPath(new URL("./template/src", import.meta.url)),
      "hy3d-spec": fileURLToPath(new URL("./scripts/hy3d-spec.mjs", import.meta.url)),
      "hymd-spec": fileURLToPath(new URL("./scripts/hymd-spec.mjs", import.meta.url))
    },
    dedupe: ["react", "react-dom", "@tauri-apps/api"]
  },
  server: {
    // 1420 HyMdTauri，1430 hy3d，1440 设计器。预览另用 1450 和 1460，不占产品端口。
    port: 1440,
    strictPort: true,
    host: host || "127.0.0.1",
    hmr: host ? { protocol: "ws", host, port: 1441 } : undefined,
    watch: { ignored: ["**/src-tauri/**", "**/template/core/**", "**/target/**", "**/.tmp/**", "**/.product-sources/**"] }
  }
});
