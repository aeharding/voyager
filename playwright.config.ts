import { defineConfig, devices } from "@playwright/test";

import type { Provider } from "./e2e/matrix/fixtures";

const serverURL = "http://localhost:" + (process.env.CI ? "4173" : "5173");

// e2e/matrix specs run against both provider fakes via the matrix-*
// projects; the browser-matrix projects keep running everything else.
const MATRIX_SPECS = "e2e/matrix/**/*.spec.ts";

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
    {
      name: "chromium",
      testIgnore: MATRIX_SPECS,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      testIgnore: MATRIX_SPECS,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testIgnore: MATRIX_SPECS,
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      testIgnore: MATRIX_SPECS,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "Mobile Safari",
      testIgnore: MATRIX_SPECS,
      use: { ...devices["iPhone 14"] },
    },
    {
      name: "matrix-lemmyv1",
      testMatch: MATRIX_SPECS,
      use: { ...devices["Desktop Chrome"], provider: "lemmyv1" },
    },
    {
      name: "matrix-piefed",
      testMatch: MATRIX_SPECS,
      use: { ...devices["Desktop Chrome"], provider: "piefed" },
    },
  ],

  webServer: {
    command: process.env.CI ? "pnpm preview" : "pnpm dev",
    url: serverURL,
    reuseExistingServer: !process.env.CI,
  },
});
