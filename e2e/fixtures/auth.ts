import type { Page } from "@playwright/test";

import type { MockApi } from "./mocks";

import { V1_HOST } from "./builders";

/**
 * Structurally valid JWT (the app reads the payload via `parseJWT`, e.g.
 * `parseLemmyJWT(jwt).iss` on logout) — signature is never verified.
 */
export function makeFakeJwt(
  payload: Record<string, unknown> = { iss: V1_HOST },
) {
  return `e2e.${btoa(JSON.stringify(payload))}.sig`;
}

export interface SeedAccount {
  jwt?: string;
  handle: string;
}

/** Seed `localStorage.credentials` before the app boots. */
export async function seedCredentials(
  page: Page,
  accounts: SeedAccount[],
  activeHandle: string,
) {
  await page.addInitScript(
    (credentials) => {
      localStorage.setItem("credentials", JSON.stringify(credentials));
    },
    { accounts, activeHandle },
  );
}

/**
 * Boot the app logged into the fake v1 instance: seeds credentials before
 * page load and marks the fixture user as authenticated — the fake derives
 * the account endpoints (my user, unread counts, notifications) from that.
 */
export async function loginAs(page: Page, api: MockApi) {
  const handle = `alex@${V1_HOST}`;

  await seedCredentials(page, [{ jwt: makeFakeJwt(), handle }], handle);

  api.seed.loggedInAs(api.me);
}
