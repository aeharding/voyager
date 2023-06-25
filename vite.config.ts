import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import legacy from "@vitejs/plugin-legacy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    svgr(),
    VitePWA({ registerType: "prompt" }),
    legacy({
      modernPolyfills: ["es.array.at"],
    }),
  ],
  define: {
    // eslint-disable-next-line no-undef
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
