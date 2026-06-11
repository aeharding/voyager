import type { Page } from "@playwright/test";

import { myUser, V1_HOST } from "./builders";
import type { MockApi } from "./mocks";

/**
 * Boot the app logged into the fake v1 instance: seeds credentials before
 * page load and mocks the authed bootstrap calls.
 */
export async function loginAs(page: Page, api: MockApi) {
  await page.addInitScript((host) => {
    const handle = `alex@${host}`;
    localStorage.setItem(
      "credentials",
      JSON.stringify({
        accounts: [{ jwt: "fake.jwt", handle }],
        activeHandle: handle,
      }),
    );
  }, V1_HOST);

  // Authed `getSite` fires getMyUser (GET /account); mock it so every
  // logged-in test is deterministic.
  api.mock("GET /api/v4/account", { json: myUser });
  api.mock("GET /api/v4/account/unread_counts", {
    json: { notification_count: 0 },
  });
}
