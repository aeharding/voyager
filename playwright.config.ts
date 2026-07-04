import { defineConfig, devices } from "@playwright/test";

import type { Provider } from "./e2e/matrix/fixtures";

const serverURL = "http://localhost:" + (process.env.CI ? "4173" : "5173");

// e2e/matrix specs run the full browser × provider grid; the plain
// browser projects keep running everything else (provider-specific specs).
const MATRIX_SPECS = "e2e/matrix/**/*.spec.ts";

const BROWSERS = [
  { device: devices["Desktop Chrome"], name: "chromium" },
  { device: devices["Desktop Firefox"], name: "firefox" },
  { device: devices["Desktop Safari"], name: "webkit" },
  { device: devices["Pixel 7"], name: "mobile-chrome" },
  { device: devices["iPhone 14"], name: "mobile-safari" },
];

const PROVIDERS: Provider[] = ["lemmyv1", "piefed"];

export default defineConfig<{ provider: Provider }>({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: serverURL,

    // Service workers bypass route interception on WebKit (a second page
    // load would hit the real network), and no spec depends on SW behavior.
    serviceWorkers: "block",

    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },

  projects: [
    // Provider-specific specs (e2e/lemmyv1, etc.) run once per browser.
    ...BROWSERS.map((browser) => ({
      name: browser.name,
      testIgnore: MATRIX_SPECS,
      use: { ...browser.device },
    })),
    // Shared specs (e2e/matrix) run the full browser × provider grid.
    ...BROWSERS.flatMap((browser) =>
      PROVIDERS.map((provider) => ({
        name: `${browser.name}-${provider}`,
        testMatch: MATRIX_SPECS,
        use: { ...browser.device, provider },
      })),
    ),
  ],

  webServer: {
    command: process.env.CI ? "pnpm preview" : "pnpm dev",
    url: serverURL,
    reuseExistingServer: !process.env.CI,
  },
});
