import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import legacy from "@vitejs/plugin-legacy";
import { loadEnv } from "vite";

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };

  return defineConfig({
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
      CUSTOM_LEMMY_SERVERS: JSON.stringify(process.env.CUSTOM_LEMMY_SERVERS),
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
};
