// vite.config.ts
import react from "file:///Users/aeharding/wefwef/node_modules/.pnpm/@vitejs+plugin-react@4.0.1_vite@4.3.9/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///Users/aeharding/wefwef/node_modules/.pnpm/vitest@0.32.4_jsdom@22.1.0_terser@5.18.1/node_modules/vitest/dist/config.js";
import { VitePWA } from "file:///Users/aeharding/wefwef/node_modules/.pnpm/vite-plugin-pwa@0.16.4_vite@4.3.9_workbox-build@7.0.0_workbox-window@7.0.0/node_modules/vite-plugin-pwa/dist/index.js";
import svgr from "file:///Users/aeharding/wefwef/node_modules/.pnpm/vite-plugin-svgr@3.2.0_rollup@2.79.1_vite@4.3.9/node_modules/vite-plugin-svgr/dist/index.js";
import legacy from "file:///Users/aeharding/wefwef/node_modules/.pnpm/@vitejs+plugin-legacy@4.0.5_terser@5.18.1_vite@4.3.9/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"]
      }
    }),
    svgr(),
    VitePWA({ registerType: "prompt" }),
    legacy({
      modernPolyfills: ["es.array.at"]
    })
  ],
  // TODO: Outdated clients trying to access stale codesplit js chucks
  // break. This breaks iOS transitions.
  // Put everything into one chunk for now.
  build: {
    rollupOptions: {
      output: {
        manualChunks: () => "index.js"
      }
    }
  },
  define: {
    // eslint-disable-next-line no-undef
    APP_VERSION: JSON.stringify(process.env.npm_package_version)
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts"
  },
  optimizeDeps: {
    exclude: ["mdast-util-gfm-autolink-literal-lemmy"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWVoYXJkaW5nL3dlZndlZlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FlaGFyZGluZy93ZWZ3ZWYvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FlaGFyZGluZy93ZWZ3ZWYvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXN0L2NvbmZpZ1wiO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcbmltcG9ydCBzdmdyIGZyb20gXCJ2aXRlLXBsdWdpbi1zdmdyXCI7XG5pbXBvcnQgbGVnYWN5IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1sZWdhY3lcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCh7XG4gICAgICBqc3hJbXBvcnRTb3VyY2U6IFwiQGVtb3Rpb24vcmVhY3RcIixcbiAgICAgIGJhYmVsOiB7XG4gICAgICAgIHBsdWdpbnM6IFtcIkBlbW90aW9uL2JhYmVsLXBsdWdpblwiXSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgc3ZncigpLFxuICAgIFZpdGVQV0EoeyByZWdpc3RlclR5cGU6IFwicHJvbXB0XCIgfSksXG4gICAgbGVnYWN5KHtcbiAgICAgIG1vZGVyblBvbHlmaWxsczogW1wiZXMuYXJyYXkuYXRcIl0sXG4gICAgfSksXG4gIF0sXG4gIC8vIFRPRE86IE91dGRhdGVkIGNsaWVudHMgdHJ5aW5nIHRvIGFjY2VzcyBzdGFsZSBjb2Rlc3BsaXQganMgY2h1Y2tzXG4gIC8vIGJyZWFrLiBUaGlzIGJyZWFrcyBpT1MgdHJhbnNpdGlvbnMuXG4gIC8vIFB1dCBldmVyeXRoaW5nIGludG8gb25lIGNodW5rIGZvciBub3cuXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczogKCkgPT4gXCJpbmRleC5qc1wiLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBkZWZpbmU6IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICBBUFBfVkVSU0lPTjogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYubnBtX3BhY2thZ2VfdmVyc2lvbiksXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIGVudmlyb25tZW50OiBcImpzZG9tXCIsXG4gICAgc2V0dXBGaWxlczogXCIuL3NyYy9zZXR1cFRlc3RzLnRzXCIsXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFtcIm1kYXN0LXV0aWwtZ2ZtLWF1dG9saW5rLWxpdGVyYWwtbGVtbXlcIl0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVAsT0FBTyxXQUFXO0FBQ3pRLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsZUFBZTtBQUN4QixPQUFPLFVBQVU7QUFDakIsT0FBTyxZQUFZO0FBR25CLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKLGlCQUFpQjtBQUFBLE1BQ2pCLE9BQU87QUFBQSxRQUNMLFNBQVMsQ0FBQyx1QkFBdUI7QUFBQSxNQUNuQztBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsS0FBSztBQUFBLElBQ0wsUUFBUSxFQUFFLGNBQWMsU0FBUyxDQUFDO0FBQUEsSUFDbEMsT0FBTztBQUFBLE1BQ0wsaUJBQWlCLENBQUMsYUFBYTtBQUFBLElBQ2pDLENBQUM7QUFBQSxFQUNIO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjLE1BQU07QUFBQSxNQUN0QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUE7QUFBQSxJQUVOLGFBQWEsS0FBSyxVQUFVLFFBQVEsSUFBSSxtQkFBbUI7QUFBQSxFQUM3RDtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLEVBQ2Q7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyx1Q0FBdUM7QUFBQSxFQUNuRDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
