import babel from "@rolldown/plugin-babel";
import legacy from "@vitejs/plugin-legacy";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { ManifestOptions, VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vitest/config";

import manifest from "./manifest.json";

// Set by the tauri CLI for both `tauri dev` and `tauri build`
const isTauriBuild = !!process.env.TAURI_ENV_PLATFORM;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    svgr(),
    VitePWA({
      // Tauri serves local assets and updates via app releases,
      // so a service worker is useless (registration is skipped,
      // virtual:pwa-register/react resolves to a no-op)
      disable: isTauriBuild,
      devOptions: {
        enabled: true,
        suppressWarnings: true,
      },
      registerType: "prompt",
      manifestFilename: "manifest.json",
      manifest: manifest as ManifestOptions, // https://github.com/microsoft/TypeScript/issues/32063
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
    // WebKitGTK doesn't need iOS 15 polyfills
    ...(isTauriBuild
      ? []
      : [
          legacy({
            // es.array.at: Voyager code iOS 15.2
            // es.object.has-own: ReactMarkdown iOS 15.2
            modernPolyfills: ["es.array.at", "es.object.has-own"],
            renderLegacyChunks: false,
          }),
        ]),
  ],
  envPrefix: [
    "VITE_",
    "BUILD_FOSS_ONLY",
    // Keep these explicit. Do not simplify to `APP_`.
    "APP_BUILD",
    "APP_VERSION",
    "APP_GIT_REF",
  ],
  // TODO: Outdated clients trying to access stale codesplit js chucks
  // break. This breaks iOS transitions.
  // Put everything into one chunk for now.
  build: {
    chunkSizeWarningLimit: 5_000,
    rolldownOptions: {
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
  server: {
    // tauri.conf.json devUrl expects a fixed port
    strictPort: true,
  },
  // Don't clear tauri CLI output
  clearScreen: false,
  test: {
    exclude: ["**/e2e/**", "**/node_modules/**"],
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    // Node >=25 defines a localStorage global that is undefined without
    // --localstorage-file, shadowing jsdom's working implementation
    execArgv: ["--no-experimental-webstorage"],
  },
  optimizeDeps: {
    exclude: ["mdast-util-gfm-autolink-literal-lemmy", "remark-lemmy-spoiler"],
  },
});
