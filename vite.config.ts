import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    legacy(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
  server: {
    proxy: {
      "/api/lemmy.world": {
        target: "https://lemmy.world",
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/api\/lemmy.world/, ""),
      },
      "/api/lemmy.ml": {
        target: "https://lemmy.ml",
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/api\/lemmy.ml/, ""),
      },
    },
  },
});
