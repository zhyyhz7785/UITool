import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

// 模板固定 1470。1420 留给 HyMdTauri，1430 留给 hy3d，1440 留给设计器。
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  build: { chunkSizeWarningLimit: 2000 },
  server: {
    port: 1470,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1471 } : undefined,
    watch: { ignored: ["**/src-tauri/**", "**/core/**", "**/target/**"] }
  }
});
