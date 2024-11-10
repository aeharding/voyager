import { readFileSync } from "fs";

import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import wyw from "@wyw-in-js/vite";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

import compilerOptions from "./compilerOptions";

const IGNORED_ROLLUP_WARNINGS = [
  // https://github.com/Anber/wyw-in-js/issues/62
  "contains an annotation that Rollup cannot interpret due to the position of the comment",
  "The comment will be removed to avoid issues.",

  // https://github.com/vitejs/vite/blob/fe30349d350ef08bccd56404ccc3e6d6e0a2e156/packages/vite/rollup.config.ts#L71
  "Circular dependency",
];

const manifest = JSON.parse(readFileSync("./manifest.json", "utf-8"));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
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
  // TODO: Outdated clients trying to access stale codesplit js chucks
  // break. This breaks iOS transitions.
  // Put everything into one chunk for now.
  build: {
    chunkSizeWarningLimit: 5_000,
    rollupOptions: {
      onwarn: (log, handler) => {
        for (const msg in IGNORED_ROLLUP_WARNINGS) {
          if (log.message.includes(msg)) return;
        }

        handler(log);
      },
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
