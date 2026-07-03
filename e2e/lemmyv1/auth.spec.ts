// Auth flows: logging in through the real welcome → server → credentials UI
// (including the 2FA and bad-credential paths), guest mode, logging out, and
// switching between multiple accounts.

import type { Page } from "@playwright/test";

import { makeFakeJwt, seedCredentials } from "../fixtures/auth";
import { build, me, V1_HOST } from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";

const jwt = makeFakeJwt();

const wireMe = build.person({
  id: me.id,
  name: me.name,
  display_name: me.displayName,
});

// The account endpoints (my user, unread counts) and profile lookups fire
// once authed — the fake derives them all from the logged-in seed
function mockAuthedBootstrap(api: MockApi) {
  api.seed.loggedInAs(api.me);
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
  api.on.login({ json: { jwt } });

  await openLoginPage(page);

  await page.getByLabel("Username or email").fill("alex");
  await page.getByLabel("Password").fill("hunter2");
  await page.getByRole("button", { name: "Confirm" }).click();

  await expect(page.getByText("Logged in!")).toBeVisible();

  const payload = await api.waitForPayload("login");
  expect(payload).toEqual({
    username_or_email: "alex",
    password: "hunter2",
  });

  await expect.poll(() => activeHandle(page)).toBe(`alex@${V1_HOST}`);
});

test("v1: login: 2FA challenge path", async ({ api, page }) => {
  mockAuthedBootstrap(api);
  api.on.login((call) => {
    const body = call.body as { totp_2fa_token?: string };

    if (!body.totp_2fa_token)
      return { error: { code: "missing_totp_token", status: 400 } };

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

  const retry = await api.waitForPayload(
    "login",
    (payload) => !!payload.totp_2fa_token,
  );
  expect(retry).toEqual({
    username_or_email: "alex",
    password: "hunter2",
    totp_2fa_token: "123456",
  });
});

test("v1: login: incorrect credentials shows error and clears password", async ({
  api,
  page,
}) => {
  api.on.login({ error: { code: "incorrect_login", status: 400 } });

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

    await page.goto("/profile");

    // Profile header → accounts switcher → edit mode → remove → log out
    await page.getByRole("button", { name: "Accounts" }).click();

    const switcher = page.locator("ion-modal", { hasText: "Accounts" });
    await switcher.getByRole("button", { name: "Edit" }).click();

    const accountItem = switcher.locator("ion-item", {
      hasText: `alex@${V1_HOST}`,
    });
    await accountItem.getByRole("button", { name: "Remove" }).click();
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
  const sam = build.person({ id: 201, name: "sam", display_name: "sam" });
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

  // Both accounts read their profile + unread counts once active
  api.seed.loggedInAs(api.me);

  // Which "my user" comes back depends on the Authorization header — the
  // seed store has a single logged-in user, so this stays wire-level
  api.mock("GET /api/v4/account", (call) => ({
    json:
      call.headers["authorization"] === `Bearer ${jwtSam}`
        ? build.myUserInfo({ person: sam })
        : build.myUserInfo({ person: wireMe }),
  }));

  await page.goto("/profile");
  await expect(
    page.locator("ion-title", { hasText: `alex@${V1_HOST}` }).first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "Accounts" }).click();
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
