import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import legacy from "@vitejs/plugin-legacy";

import fs from "fs";

// https://github.com/vitejs/vite/issues/2415#issuecomment-1381196720
const dotPathFixPlugin = () => ({
  name: "dot-path-fix-plugin",
  configureServer: (server) => {
    server.middlewares.use((req, _, next) => {
      const reqPath = req.url.split("?", 2)[0];
      if (!req.url.startsWith("/@") && !fs.existsSync(`.${reqPath}`)) {
        req.url = "/";
      }
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dotPathFixPlugin(),
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    svgr(),
    VitePWA({
      registerType: "prompt",
      workbox: {
        runtimeCaching: [
          {
            handler: "StaleWhileRevalidate",
            urlPattern: ({ url }) => url.pathname === "/_config",
            method: "GET",
          },
        ],
      },
    }),
    legacy({
      modernPolyfills: ["es.array.at"],
    }),
  ],
  // TODO: Outdated clients trying to access stale codesplit js chucks
  // break. This breaks iOS transitions.
  // Put everything into one chunk for now.
  build: {
    rollupOptions: {
      output: {
        manualChunks: () => "index.js",
      },
    },
  },
  define: {
    // eslint-disable-next-line no-undef
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
  optimizeDeps: {
    exclude: ["mdast-util-gfm-autolink-literal-lemmy"],
  },
});
