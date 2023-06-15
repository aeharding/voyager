import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { SUPPORTED_SERVERS } from "./src/helpers/lemmy";
import _ from "lodash";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    VitePWA({ registerType: "autoUpdate" }),
  ],
  server: {
    proxy: _.keyBy(
      SUPPORTED_SERVERS.map((server) => ({
        endpoint: `/api/${server}`,
        target: `https://${server}`,
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(new RegExp(`^/api/${server}`), ""),
      })),
      "endpoint"
    ),
  },
});
