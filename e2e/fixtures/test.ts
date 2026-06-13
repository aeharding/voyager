import { test as base } from "@playwright/test";

import { loginAs } from "./auth";
import { MockApi } from "./mocks";

interface Fixtures {
  /**
   * Mocked v1 API, pre-wired with app-startup defaults. Use `api.mock()` to
   * override endpoints and `api.calls()` to assert on outgoing requests.
   */
  api: MockApi;

  /** Set `test.use({ loggedIn: true })` to boot logged into the fake host. */
  loggedIn: boolean;
}

export const test = base.extend<Fixtures>({
  loggedIn: [false, { option: true }],

  api: [
    async ({ page, loggedIn }, use) => {
      // Picked up by setupIonicReact (src/core/App.tsx) to make transitions
      // instant — Ionic's JS-driven animations are a major flake source.
      await page.addInitScript(() => {
        Object.assign(window, { __E2E_DISABLE_ANIMATIONS: true });
      });

      const api = new MockApi();
      await api.install(page);

      if (loggedIn) await loginAs(page, api);

      await use(api);
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
