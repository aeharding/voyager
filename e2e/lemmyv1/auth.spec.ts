// Auth flows: logging in through the real welcome → server → credentials UI
// (including the 2FA and bad-credential paths), guest mode, logging out, and
// switching between multiple accounts.

import type { Page } from "@playwright/test";

import { makeFakeJwt, seedCredentials } from "../fixtures/auth";
import {
  me,
  myUser,
  myUserInfo,
  pagedResponse,
  person,
  personResponse,
  V1_HOST,
} from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";

const jwt = makeFakeJwt();

// GET /account, /person etc. fire once authed (or when the profile renders)
function mockAuthedBootstrap(api: MockApi) {
  api.mock("GET /api/v4/account", { json: myUser });
  api.mock("GET /api/v4/account/unread_counts", {
    json: { notification_count: 0 },
  });
  api.mock("GET /api/v4/person", { json: personResponse(me) });
  api.mock("GET /api/v4/person/content", { json: pagedResponse([]) });
}

// Drives the shared modal flow: profile tab (logged out) → welcome →
// pick server → credentials page.
async function openLoginPage(page: Page) {
  await page.goto("/profile");

  await page.getByRole("button", { name: "Get Started" }).click();
  await page.getByRole("button", { name: "Log In", exact: true }).click();

  await page.getByRole("searchbox").fill(V1_HOST);
  await page.getByRole("button", { name: "Next" }).click();

  // Server validated (via mocked nodeinfo + site) → credentials page
  await expect(page.getByLabel("Username or email")).toBeVisible();
}

async function activeHandle(page: Page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem("credentials");
    return raw ? JSON.parse(raw).activeHandle : undefined;
  });
}

test("v1: login: full UI flow from welcome to logged in", async ({
  api,
  page,
}) => {
  mockAuthedBootstrap(api);
  api.mock("POST /api/v4/account/auth/login", { json: { jwt } });

  await openLoginPage(page);

  await page.getByLabel("Username or email").fill("alex");
  await page.getByLabel("Password").fill("hunter2");
  await page.getByRole("button", { name: "Confirm" }).click();

  await expect(page.getByText("Logged in!")).toBeVisible();

  const loginCall = await api.waitForCall("POST /api/v4/account/auth/login");
  expect(loginCall.body).toEqual({
    username_or_email: "alex",
    password: "hunter2",
  });

  await expect.poll(() => activeHandle(page)).toBe(`alex@${V1_HOST}`);
});

test("v1: login: 2FA challenge path", async ({ api, page }) => {
  mockAuthedBootstrap(api);
  api.mock("POST /api/v4/account/auth/login", (call) => {
    const body = call.body as { totp_2fa_token?: string };

    if (!body.totp_2fa_token)
      return { status: 400, json: { error: "missing_totp_token" } };

    return { json: { jwt } };
  });

  await openLoginPage(page);

  await page.getByLabel("Username or email").fill("alex");
  await page.getByLabel("Password").fill("hunter2");
  await page.getByRole("button", { name: "Confirm" }).click();

  // Challenge response pushes the 2fa page. Scope to its toolbar: on the iOS
  // theme, the previous nav page's Confirm button is still in the tree.
  await page.getByLabel("2fa code").fill("123456");
  await page
    .locator("ion-toolbar", { hasText: "2fa code" })
    .getByRole("button", { name: "Confirm" })
    .click();

  await expect(page.getByText("Logged in!")).toBeVisible();

  const retry = await api.waitForCall(
    "POST /api/v4/account/auth/login",
    (call) => !!(call.body as { totp_2fa_token?: string }).totp_2fa_token,
  );
  expect(retry.body).toEqual({
    username_or_email: "alex",
    password: "hunter2",
    totp_2fa_token: "123456",
  });
});

test("v1: login: incorrect credentials shows error and clears password", async ({
  api,
  page,
}) => {
  api.mock("POST /api/v4/account/auth/login", {
    status: 400,
    json: { error: "incorrect_login" },
  });

  await openLoginPage(page);

  await page.getByLabel("Username or email").fill("alex");
  await page.getByLabel("Password").fill("wrong");
  await page.getByRole("button", { name: "Confirm" }).click();

  await expect(
    page.getByText(`Incorrect login credentials for ${V1_HOST}`),
  ).toBeVisible();
  await expect(page.getByLabel("Password")).toHaveValue("");
});

test("v1: guest: connect as guest from empty credentials", async ({ page }) => {
  await openLoginPage(page);

  // Submitting with empty username + password offers guest mode
  await page.getByRole("button", { name: "Confirm" }).click();
  await page.getByRole("button", { name: "Connect as Guest" }).click();

  await expect(
    page.getByText(`You are browsing ${V1_HOST} as a guest.`),
  ).toBeVisible();

  await expect.poll(() => activeHandle(page)).toBe(V1_HOST);
});

test.describe("logged in", () => {
  test.use({ loggedIn: true });

  test("v1: logout revokes token and clears credentials", async ({
    api,
    page,
  }) => {
    api.mock("POST /api/v4/account/auth/logout", { json: { success: true } });
    api.mock("GET /api/v4/person", { json: personResponse(me) });
    api.mock("GET /api/v4/person/content", { json: pagedResponse([]) });

    await page.goto("/profile");

    // Profile header → accounts switcher → edit mode → remove → log out
    await page.locator('ion-buttons[slot="secondary"] ion-button').click();

    const switcher = page.locator("ion-modal", { hasText: "Accounts" });
    await switcher.locator('ion-buttons[slot="end"] ion-button').click();

    const accountItem = switcher.locator("ion-item", {
      hasText: `alex@${V1_HOST}`,
    });
    await accountItem.locator("ion-button").click();
    await switcher.getByRole("button", { name: "Log out" }).click();

    await api.waitForCall("POST /api/v4/account/auth/logout");

    // Back to logged-out state, credentials gone
    await expect(
      page.getByRole("button", { name: "Get Started" }),
    ).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("credentials")))
      .toBeNull();
  });
});

test("v1: multi-account: switching accounts switches credentials", async ({
  api,
  page,
}) => {
  const sam = person({ id: 201, name: "sam", display_name: "sam" });
  const jwtAlex = makeFakeJwt({ iss: V1_HOST, sub: "alex" });
  const jwtSam = makeFakeJwt({ iss: V1_HOST, sub: "sam" });

  await seedCredentials(
    page,
    [
      { jwt: jwtAlex, handle: `alex@${V1_HOST}` },
      { jwt: jwtSam, handle: `sam@${V1_HOST}` },
    ],
    `alex@${V1_HOST}`,
  );

  api.mock("GET /api/v4/account", (call) => ({
    json:
      call.headers["authorization"] === `Bearer ${jwtSam}`
        ? myUserInfo(sam)
        : myUser,
  }));
  api.mock("GET /api/v4/account/unread_counts", {
    json: { notification_count: 0 },
  });
  api.mock("GET /api/v4/person", { json: personResponse(me) });
  api.mock("GET /api/v4/person/content", { json: pagedResponse([]) });

  await page.goto("/profile");
  await expect(
    page.locator("ion-title", { hasText: `alex@${V1_HOST}` }).first(),
  ).toBeVisible();

  await page.locator('ion-buttons[slot="secondary"] ion-button').click();
  await page.getByRole("radio", { name: `sam@${V1_HOST}` }).click();

  // The app refetches authed state with the newly active account's token
  await expect
    .poll(
      () => api.calls("GET /api/v4/account").at(-1)?.headers["authorization"],
    )
    .toBe(`Bearer ${jwtSam}`);

  await expect(
    page.locator("ion-title", { hasText: `sam@${V1_HOST}` }).first(),
  ).toBeVisible();

  await expect.poll(() => activeHandle(page)).toBe(`sam@${V1_HOST}`);
});
