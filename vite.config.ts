import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import wyw from "@wyw-in-js/vite";
import { readFileSync } from "fs";
import { join, resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vitest/config";

import compilerOptions from "./compilerOptions";

const manifest = JSON.parse(readFileSync("./manifest.json", "utf-8"));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", compilerOptions]],
      },
    }),
    wyw({
      displayName: process.env.NODE_ENV === "development",
      include: ["**/*.{ts,tsx}"],
      babelOptions: {
        presets: ["@babel/preset-typescript", "@babel/preset-react"],
      },
    }),
    svgr(),
    VitePWA({
      devOptions: {
        enabled: true,
      },
      registerType: "prompt",
      manifestFilename: "manifest.json",
      manifest,
      workbox: {
        maximumFileSizeToCacheInBytes: 2097152 * 2,
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
      // es.array.at: Voyager code iOS 15.2
      // es.object.has-own: ReactMarkdown iOS 15.2
      modernPolyfills: ["es.array.at", "es.object.has-own"],
    }),
  ],
  resolve: {
    alias: [
      {
        find: /#\/(.*)/,
        replacement: join(resolve(import.meta.dirname, "src/"), "$1"),
      },
    ],
  },
  // TODO: Outdated clients trying to access stale codesplit js chucks
  // break. This breaks iOS transitions.
  // Put everything into one chunk for now.
  build: {
    chunkSizeWarningLimit: 5_000,
    rollupOptions: {
      output: {
        manualChunks: () => "index.js",

        // ---- Reproducible builds (f-droid) ----
        ...(process.env.CI_PLATFORM === "android" ||
        process.env.CI_PLATFORM === "ios"
          ? {
              entryFileNames: `[name].js`,
              chunkFileNames: `[name].js`,
              assetFileNames: `[name].[ext]`,
            }
          : {}),
      },
    },
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
    BUILD_FOSS_ONLY: !!process.env.BUILD_FOSS_ONLY,
  },
  test: {
    exclude: ["**/e2e/**", "**/node_modules/**"],
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
  optimizeDeps: {
    exclude: ["mdast-util-gfm-autolink-literal-lemmy", "remark-lemmy-spoiler"],
  },
});
