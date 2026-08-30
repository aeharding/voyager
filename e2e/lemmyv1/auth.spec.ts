// Auth flows: logging in through the real welcome → server → credentials UI
// (including the 2FA and bad-credential paths), guest mode, logging out, and
// switching between multiple accounts.

import type { Page } from "@playwright/test";
import { FakeLemmyV1Instance } from "threadiverse/testing";

import { makeFakeJwt, seedCredentials } from "../fixtures/auth";
import { build, fixturePosts, me, V1_HOST } from "../fixtures/builders";
import { type MockApi, seedDefaults } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";

const jwt = makeFakeJwt();
const nativeNavigationTest = test.extend({ ionicAnimations: true });

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

async function useInstalledRouter(page: Page) {
  await page.addInitScript(() => {
    const browserMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query) => {
      const result = browserMatchMedia(query);

      if (query === "(display-mode: standalone)")
        Object.defineProperty(result, "matches", { value: true });

      return result;
    };
  });
}

async function holdOutletCommit(page: Page, pathname: string) {
  await page.addInitScript((pathname) => {
    type CommitWindow = typeof window & {
      __releaseBootstrapCommit?: () => void;
    };

    const observer = new MutationObserver(() => {
      const outlet =
        document.querySelector<HTMLIonRouterOutletElement>("ion-router-outlet");
      if (!outlet || outlet.dataset.commitHeldForTest) return;

      outlet.dataset.commitHeldForTest = "true";
      observer.disconnect();
      const commit = outlet.commit.bind(outlet);
      outlet.commit = async (...args) => {
        if (
          location.pathname === pathname &&
          !document.documentElement.dataset.bootstrapCommitHeld
        ) {
          document.documentElement.dataset.bootstrapCommitHeld = "true";
          await new Promise<void>((resolve) => {
            (window as CommitWindow).__releaseBootstrapCommit = resolve;
          });
        }

        return commit(...args);
      };
    });

    observer.observe(document, { childList: true, subtree: true });
  }, pathname);
}

function visibleOutletPages(page: Page) {
  return page.locator(
    "ion-router-outlet > .ion-page:not(.ion-page-hidden):not(.ion-page-invisible):visible",
  );
}

async function startTitleExposureProbe(
  page: Page,
  titles: string[],
  requireTabShell = false,
) {
  await page.evaluate(
    ({ requireTabShell, titles }) => {
      type ProbeWindow = typeof window & {
        __titleExposureProbe?: { stop: () => string[] };
      };

      const probeWindow = window as ProbeWindow;
      probeWindow.__titleExposureProbe?.stop();

      const exposed = new Set<string>();
      let frame: number;

      const sample = () => {
        if (requireTabShell && !document.querySelector("ion-tabs ion-tab-bar"))
          exposed.add(`Tab shell missing at ${location.pathname}`);

        const candidates = document.querySelectorAll<HTMLElement>("ion-title");

        for (const candidate of candidates) {
          const title = candidate.textContent?.trim();
          if (!title || !titles.includes(title)) continue;

          const style = getComputedStyle(candidate);
          const rect = candidate.getBoundingClientRect();
          if (
            style.display === "none" ||
            style.visibility === "hidden" ||
            Number(style.opacity) === 0 ||
            rect.width === 0 ||
            rect.height === 0
          )
            continue;

          const hit = document.elementFromPoint(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
          );
          if (hit === candidate || (hit && candidate.contains(hit))) {
            const routePathname =
              candidate.closest<HTMLElement>(".ion-page")?.dataset
                .routePathname ?? "unknown";
            exposed.add(`${title} [${routePathname} at ${location.pathname}]`);
          }
        }
      };

      const tick = () => {
        sample();
        frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
      probeWindow.__titleExposureProbe = {
        stop() {
          cancelAnimationFrame(frame);
          sample();
          delete probeWindow.__titleExposureProbe;
          return [...exposed];
        },
      };
    },
    { requireTabShell, titles },
  );
}

async function stopTitleExposureProbe(page: Page) {
  return page.evaluate(() => {
    const probeWindow = window as typeof window & {
      __titleExposureProbe?: { stop: () => string[] };
    };

    return probeWindow.__titleExposureProbe?.stop() ?? [];
  });
}

async function expectTabContent(page: Page, tab: string, title?: string) {
  await expect
    .poll(() =>
      page.locator("ion-tab-button").evaluateAll((buttons) => ({
        disabled: buttons
          .filter((button) => (button as HTMLIonTabButtonElement).disabled)
          .map((button) => (button as HTMLIonTabButtonElement).tab),
        selected: buttons
          .filter((button) => (button as HTMLIonTabButtonElement).selected)
          .map((button) => (button as HTMLIonTabButtonElement).tab),
      })),
    )
    .toEqual({ disabled: [], selected: [tab] });

  const visiblePages = visibleOutletPages(page);
  await expect(visiblePages).toHaveCount(1);
  if (title) {
    await expect(
      visiblePages.last().locator("ion-title", { hasText: title }).first(),
    ).toBeVisible();
  } else {
    await expect(
      visiblePages.last().getByPlaceholder("Search posts, communities, users"),
    ).toBeVisible();
  }
}

async function longPressProfileTab(page: Page) {
  const profile = page.locator('ion-tab-button[tab="profile"]');
  const box = await profile.boundingBox();
  if (!box) throw new Error("Profile tab has no bounding box");

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(650);
  await page.mouse.up();
}

async function performSwipeBack(page: Page) {
  const outlet = page.locator("ion-router-outlet");
  await expect
    .poll(() =>
      outlet.evaluate((element) => {
        const handler = (element as HTMLIonRouterOutletElement).swipeHandler;
        return !!handler && handler.canStart();
      }),
    )
    .toBe(true);

  await outlet.evaluate((element) => {
    delete document.documentElement.dataset.swipeNavigationStarted;
    element.addEventListener(
      "ionNavWillChange",
      () => {
        document.documentElement.dataset.swipeNavigationStarted = "true";
      },
      { once: true },
    );
  });

  await page.mouse.move(4, 400);
  await page.mouse.down();
  await page.mouse.move(80, 400, { steps: 4 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.dataset.swipeNavigationStarted,
      ),
    )
    .toBe("true");
  await expect
    .poll(() =>
      outlet.evaluate(
        (element) =>
          !!(
            element as HTMLIonRouterOutletElement & {
              ani?: unknown;
            }
          ).ani,
      ),
    )
    .toBe(true);
  await page.mouse.move(340, 400, { steps: 10 });
  await page.mouse.up();
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

nativeNavigationTest(
  "v1: fresh installed app keeps an immediate tab click",
  async ({ page }, testInfo) => {
    test.skip(
      !["mobile-chrome", "mobile-safari"].includes(testInfo.project.name),
      "Installed navigation is covered on mobile projects",
    );
    await useInstalledRouter(page);

    const defaultApi = new FakeLemmyV1Instance({ host: "lemmy.zip" });
    seedDefaults(defaultApi.seed);
    await defaultApi.install(page);

    await page.goto("/", { waitUntil: "commit" });
    const settings = page.locator('ion-tab-button[tab="settings"]');
    await settings.waitFor({ state: "attached" });
    await expect(settings).toHaveClass(/hydrated/);
    await settings.evaluate((element: HTMLIonTabButtonElement) =>
      element.click(),
    );

    await expectTabContent(page, "settings", "Settings");
    await page.waitForTimeout(250);
    await expectTabContent(page, "settings", "Settings");

    await page.getByRole("tab", { name: "Posts" }).click();
    await expectTabContent(page, "posts", "All");
    await expect(page.locator('ion-tab-button[tab="posts"]')).toHaveAttribute(
      "href",
      "/posts/lemmy.zip/all",
    );
  },
);

nativeNavigationTest(
  "v1: fresh installed app keeps a tab click during feed bootstrap",
  async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-chrome",
      "The deterministic history boundary uses Chromium's browser router",
    );
    await useInstalledRouter(page);

    const defaultApi = new FakeLemmyV1Instance({ host: "lemmy.zip" });
    seedDefaults(defaultApi.seed);
    await defaultApi.install(page);
    await page.addInitScript(() => {
      let completedNavigations = 0;
      let startedNavigations = 0;

      document.addEventListener(
        "ionNavDidChange",
        () => {
          completedNavigations += 1;
        },
        true,
      );

      document.addEventListener(
        "ionNavWillChange",
        () => {
          startedNavigations += 1;
        },
        true,
      );

      let interceptedBootstrap = false;
      const pushState = window.history.pushState.bind(window.history);
      window.history.pushState = (data, unused, url) => {
        const pathname = url && new URL(url, window.location.href).pathname;
        if (pathname === "/posts/lemmy.zip/all" && !interceptedBootstrap) {
          interceptedBootstrap = true;
          // Click before forwarding the bootstrap push so the two navigations overlap.
          const settings = document.querySelector<HTMLIonTabButtonElement>(
            'ion-tab-button[tab="settings"]',
          );
          settings?.click();
          document.documentElement.dataset.bootstrapTabClicked =
            String(!!settings);
          document.documentElement.dataset.startedNavigationsAtClick =
            String(startedNavigations);
          document.documentElement.dataset.completedNavigationsAtClick =
            String(completedNavigations);
        }

        return pushState(data, unused, url);
      };
    });

    await page.goto("/");

    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.dataset.bootstrapTabClicked,
        ),
      )
      .toBe("true");
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.dataset.startedNavigationsAtClick,
        ),
      )
      .toBe("1");
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.dataset.completedNavigationsAtClick,
        ),
      )
      .toBe("1");
    await expectTabContent(page, "settings", "Settings");
    await page.waitForTimeout(250);
    await expectTabContent(page, "settings", "Settings");

    await page.getByRole("tab", { name: "Posts" }).click();
    await expectTabContent(page, "posts", "All");
  },
);

nativeNavigationTest(
  "v1: fresh installed app keeps a tab click after bootstrap URL commit",
  async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-chrome",
      "The deterministic history boundary uses Chromium's browser router",
    );
    await useInstalledRouter(page);

    const defaultApi = new FakeLemmyV1Instance({ host: "lemmy.zip" });
    seedDefaults(defaultApi.seed);
    await defaultApi.install(page);
    await holdOutletCommit(page, "/posts/lemmy.zip/all");

    await page.goto("/");
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.dataset.bootstrapCommitHeld,
        ),
      )
      .toBe("true");
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await page
      .locator('ion-tab-button[tab="settings"]')
      .evaluate((element: HTMLIonTabButtonElement) => element.click());
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await expect(page).toHaveURL("/posts/lemmy.zip/all");
    await page.evaluate(() => {
      const commitWindow = window as typeof window & {
        __releaseBootstrapCommit?: () => void;
      };
      commitWindow.__releaseBootstrapCommit?.();
    });

    await expectTabContent(page, "settings", "Settings");
    await page.getByRole("tab", { name: "Posts" }).click();
    await expectTabContent(page, "posts", "All");
    await expect(
      visibleOutletPages(page).last().locator('[class*="loadingOverlay"]'),
    ).toHaveCount(0);
  },
);

nativeNavigationTest(
  "v1: installed app keeps tabs usable after opening Inbox",
  async ({ api, page }, testInfo) => {
    test.skip(
      !["mobile-chrome", "mobile-safari"].includes(testInfo.project.name),
      "Installed navigation is covered on mobile projects",
    );
    await useInstalledRouter(page);

    await seedCredentials(
      page,
      [{ jwt, handle: `alex@${V1_HOST}` }],
      `alex@${V1_HOST}`,
    );
    api.seed.loggedInAs(api.me);

    await page.goto("/");

    const visiblePages = visibleOutletPages(page);
    await expect(
      visiblePages.last().locator("ion-title", { hasText: "Home" }).first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(visiblePages).toHaveCount(1);

    await startTitleExposureProbe(page, ["Boxes"]);
    await page.getByRole("tab", { name: "Inbox", exact: true }).click();
    await expect(
      visiblePages.last().locator("ion-title", { hasText: "Inbox" }).first(),
    ).toBeVisible();
    await expect(visiblePages).toHaveCount(1);
    expect(await stopTitleExposureProbe(page)).toEqual([]);

    await page.getByRole("tab", { name: "Settings" }).click();
    await expect(
      visiblePages.last().locator("ion-title", { hasText: "Settings" }).first(),
    ).toBeVisible();
    await expect(visiblePages).toHaveCount(1);
  },
);

nativeNavigationTest(
  "v1: installed app keeps an immediate cold-start tab click",
  async ({ api, page }, testInfo) => {
    test.skip(
      !["mobile-chrome", "mobile-safari"].includes(testInfo.project.name),
      "Installed navigation is covered on mobile projects",
    );
    await useInstalledRouter(page);

    const handle = `alex@${V1_HOST}`;
    await seedCredentials(page, [{ jwt, handle }], handle);
    api.seed.loggedInAs(api.me);

    await page.goto("/", { waitUntil: "commit" });
    const profile = page.locator('ion-tab-button[tab="profile"]');
    await profile.waitFor({ state: "attached" });
    await expect(profile).toHaveClass(/hydrated/);
    await profile.evaluate((element: HTMLIonTabButtonElement) =>
      element.click(),
    );

    await expectTabContent(page, "profile", handle);
    await page.waitForTimeout(250);
    await expectTabContent(page, "profile", handle);

    await page.getByRole("tab", { name: "Posts" }).click();
    await expectTabContent(page, "posts", "Home");
  },
);

nativeNavigationTest(
  "v1: installed app keeps tabs aligned after a hard refresh",
  async ({ api, page }, testInfo) => {
    test.skip(
      !["mobile-chrome", "mobile-safari"].includes(testInfo.project.name),
      "Installed navigation is covered on mobile projects",
    );
    await useInstalledRouter(page);

    const handle = `alex@${V1_HOST}`;
    await seedCredentials(page, [{ jwt, handle }], handle);
    api.seed.loggedInAs(api.me);

    await page.goto("/");
    await expectTabContent(page, "posts", "Home");
    await page.getByRole("tab", { name: V1_HOST }).click();
    await expectTabContent(page, "profile", handle);
    await page.reload();
    if (testInfo.project.name === "mobile-safari")
      await expectTabContent(page, "posts", "Home");
    else await expectTabContent(page, "profile", handle);

    await page.getByRole("tab", { name: "Settings" }).click();
    await expectTabContent(page, "settings", "Settings");
    await page.getByRole("tab", { name: "Posts" }).click();
    await expectTabContent(page, "posts", "Home");
  },
);

nativeNavigationTest(
  "v1: installed app preserves the active tab through repeated same-instance switches",
  async ({ api, page }, testInfo) => {
    test.skip(
      !["mobile-chrome", "mobile-safari"].includes(testInfo.project.name),
      "Installed navigation is covered on mobile projects",
    );
    testInfo.setTimeout(120_000);
    await useInstalledRouter(page);

    const alexHandle = `alex@${V1_HOST}`;
    const samHandle = `sam@${V1_HOST}`;
    const alexJwt = makeFakeJwt({ iss: V1_HOST, sub: "alex" });
    const samJwt = makeFakeJwt({ iss: V1_HOST, sub: "sam" });
    const sam = build.person({ id: 201, name: "sam", display_name: "sam" });

    await seedCredentials(
      page,
      [
        { jwt: alexJwt, handle: alexHandle },
        { jwt: samJwt, handle: samHandle },
      ],
      alexHandle,
    );
    api.seed.loggedInAs(api.me);
    api.mock("GET /api/v4/account", (call) => ({
      json:
        call.headers.authorization === `Bearer ${samJwt}`
          ? build.myUserInfo({ person: sam })
          : build.myUserInfo({ person: wireMe }),
    }));

    await page.goto("/");
    await expectTabContent(page, "posts", "Home");

    const states = [
      { name: "Posts", tab: "posts", title: "Home" },
      { name: "Inbox", tab: "inbox", title: "Inbox" },
      { name: "Settings", tab: "settings", title: "Settings" },
      { name: V1_HOST, tab: "profile", title: "" },
      { name: "Search", tab: "search", title: undefined },
      { name: "Posts", tab: "posts", title: "Home" },
    ];

    for (const [index, state] of states.entries()) {
      if (index > 0)
        await page.getByRole("tab", { name: state.name, exact: true }).click();

      const targetHandle = index % 2 === 0 ? samHandle : alexHandle;
      await longPressProfileTab(page);
      const accountModal = page.locator("ion-modal", { hasText: "Accounts" });
      await expect(accountModal).toBeVisible();
      await accountModal.getByRole("radio", { name: targetHandle }).click();
      await expect.poll(() => activeHandle(page)).toBe(targetHandle);
      await expect(accountModal).toBeHidden();

      const title = state.tab === "profile" ? targetHandle : state.title;
      await expectTabContent(page, state.tab, title);
      await page.waitForTimeout(250);
      await expectTabContent(page, state.tab, title);
    }
  },
);

nativeNavigationTest(
  "v1: installed app resets navigation after a cross-instance account switch",
  async ({ api, page }, testInfo) => {
    test.skip(
      !["mobile-chrome", "mobile-safari"].includes(testInfo.project.name),
      "Installed navigation is covered on mobile projects",
    );
    testInfo.setTimeout(60_000);

    await useInstalledRouter(page);

    const secondHost = "second.test.lemmy";
    const secondApi = new FakeLemmyV1Instance({ host: secondHost });
    const { me: secondMe } = seedDefaults(secondApi.seed);
    const secondPost = secondApi.seed.post({
      creator: secondMe,
      id: 201,
      name: "Post from the second instance",
    });
    const secondJwt = makeFakeJwt({ iss: secondHost, sub: secondMe.name });

    api.seed.loggedInAs(api.me);
    secondApi.seed.loggedInAs(secondMe);
    await secondApi.install(page);

    await seedCredentials(
      page,
      [
        {
          jwt: makeFakeJwt({ iss: V1_HOST, sub: "alex" }),
          handle: `alex@${V1_HOST}`,
        },
        {
          jwt: secondJwt,
          handle: `${secondMe.name}@${secondHost}`,
        },
      ],
      `alex@${V1_HOST}`,
    );

    const visiblePages = visibleOutletPages(page);
    const firstHandle = `alex@${V1_HOST}`;
    const secondHandle = `${secondMe.name}@${secondHost}`;

    async function switchFromCurrentTab(handle: string) {
      await longPressProfileTab(page);
      const accountModal = page.locator("ion-modal", { hasText: "Accounts" });
      await expect(accountModal).toBeVisible();
      await accountModal.getByRole("radio", { name: handle }).click();
      await expect.poll(() => activeHandle(page)).toBe(handle);
      await expect(accountModal).toBeHidden();
    }

    await page.goto(`/posts/${V1_HOST}/home`);
    await expectTabContent(page, "posts", "Home");

    await startTitleExposureProbe(page, [], true);
    await switchFromCurrentTab(secondHandle);
    await expectTabContent(page, "posts", "Home");
    expect(await stopTitleExposureProbe(page)).toEqual([]);
    await expect(page.locator('ion-tab-button[tab="posts"]')).toHaveAttribute(
      "href",
      `/posts/${secondHost}/home`,
    );
    if (testInfo.project.name === "mobile-safari") await performSwipeBack(page);
    else await page.getByRole("tab", { name: "Posts" }).click();
    await expectTabContent(page, "posts", "Communities");
    await expect(page.locator('ion-tab-button[tab="posts"]')).toHaveAttribute(
      "href",
      `/posts/${secondHost}`,
    );
    await switchFromCurrentTab(firstHandle);
    await expectTabContent(page, "posts", "Home");
    await expect(page.locator('ion-tab-button[tab="posts"]')).toHaveAttribute(
      "href",
      `/posts/${V1_HOST}/home`,
    );
    if (testInfo.project.name === "mobile-safari") await performSwipeBack(page);
    else await page.getByRole("tab", { name: "Posts" }).click();
    await expectTabContent(page, "posts", "Communities");
    await expect(page.locator('ion-tab-button[tab="posts"]')).toHaveAttribute(
      "href",
      `/posts/${V1_HOST}`,
    );
    await page.waitForTimeout(250);
    await visiblePages
      .last()
      .getByRole("link", { name: "All", exact: true })
      .click();
    await expectTabContent(page, "posts", "All");
    await expect(page.getByText(fixturePosts[0]!.name).last()).toBeVisible();
    await page.getByRole("tab", { name: V1_HOST }).click();
    await expect(
      visiblePages.last().locator("ion-title", { hasText: `alex@${V1_HOST}` }),
    ).toBeVisible();

    async function switchTo(handle: string, tabName: string) {
      await page.getByRole("button", { name: "Accounts" }).click();
      const accountModal = page.locator("ion-modal", { hasText: "Accounts" });
      await page.getByRole("radio", { name: handle }).click();

      await expect.poll(() => activeHandle(page)).toBe(handle);
      await expect(accountModal).toBeHidden();
      await expect(page.getByRole("tab", { name: tabName })).toBeEnabled();
      await expect(visiblePages).toHaveCount(1);
      await expect(
        visiblePages.last().locator("ion-title", { hasText: handle }),
      ).toBeVisible();
    }

    await switchTo(secondHandle, secondHost);
    await switchTo(firstHandle, V1_HOST);
    await switchTo(secondHandle, secondHost);

    await expect(page.locator('ion-tab-button[tab="posts"]')).toHaveAttribute(
      "href",
      "/posts",
    );
    for (const tab of ["inbox", "profile", "search", "settings"])
      await expect(
        page.locator(`ion-tab-button[tab="${tab}"]`),
      ).toHaveAttribute("href", `/${tab}`);

    await page.getByRole("tab", { name: "Inbox", exact: true }).click();
    await expect(
      visiblePages.last().locator("ion-title", { hasText: "Inbox" }).first(),
    ).toBeVisible();
    await expect(visiblePages).toHaveCount(1);

    await page.getByRole("tab", { name: "Settings" }).click();
    await expect(
      visiblePages.last().locator("ion-title", { hasText: "Settings" }).first(),
    ).toBeVisible();
    await expect(visiblePages).toHaveCount(1);

    await page.getByRole("tab", { name: "Posts" }).click();
    await expect(page.locator('ion-tab-button[tab="posts"]')).toHaveAttribute(
      "href",
      `/posts/${secondHost}/home`,
    );
    await expect(page.getByText(secondPost.name).last()).toBeVisible();
    await expect(
      visiblePages.last().locator("ion-title", { hasText: "Home" }).first(),
    ).toBeVisible();
    await expect(visiblePages).toHaveCount(1);

    await page.getByText(secondPost.name).last().click();
    await expect(
      visiblePages.last().locator("ion-title", { hasText: "Comments" }),
    ).toBeVisible();

    await page.getByRole("tab", { name: "Settings" }).click();
    await expectTabContent(page, "settings", "Settings");
    await page.getByRole("tab", { name: "Posts" }).click();
    await expectTabContent(page, "posts", "Comments");

    if (testInfo.project.name === "mobile-safari") await performSwipeBack(page);
    else {
      await visiblePages.last().getByRole("button", { name: "Back" }).click();
    }

    await expect(page.getByText(secondPost.name).last()).toBeVisible();
    await expect(
      visiblePages.last().locator("ion-title", { hasText: "Home" }).first(),
    ).toBeVisible();
    await expect(visiblePages).toHaveCount(1);

    await page.getByText(secondPost.name).last().click();
    await expect(
      visiblePages.last().locator("ion-title", { hasText: "Comments" }),
    ).toBeVisible();
    await visiblePages.last().getByRole("button", { name: "Back" }).click();
    await expect(
      visiblePages.last().locator("ion-title", { hasText: "Home" }).first(),
    ).toBeVisible();
    await expect(visiblePages).toHaveCount(1);

    await page.getByText(secondPost.name).last().click();
    await expectTabContent(page, "posts", "Comments");

    await page.getByRole("tab", { name: "Settings" }).click();
    await expectTabContent(page, "settings", "Settings");
    await switchFromCurrentTab(firstHandle);
    await startTitleExposureProbe(page, ["Communities", "Comments"]);
    await page.getByRole("tab", { name: "Posts" }).click();
    if (testInfo.project.name === "mobile-chrome")
      await expect(page).toHaveURL(`/posts/${V1_HOST}/home`);
    await expectTabContent(page, "posts", "Home");
    expect(await stopTitleExposureProbe(page)).toEqual([]);
    await expect(page.locator('ion-tab-button[tab="posts"]')).toHaveAttribute(
      "href",
      `/posts/${V1_HOST}/home`,
    );
    await expect(page.getByText(fixturePosts[0]!.name).last()).toBeVisible();
    await page.waitForTimeout(250);
    expect(api.callsTo("getPost").some(({ id }) => id === secondPost.id)).toBe(
      false,
    );
  },
);

nativeNavigationTest(
  "v1: installed app retains the instance after logging out the last account",
  async ({ page }, testInfo) => {
    test.skip(
      !["mobile-chrome", "mobile-safari"].includes(testInfo.project.name),
      "Installed navigation is covered on mobile projects",
    );
    await useInstalledRouter(page);

    const host = "second.test.lemmy";
    const api = new FakeLemmyV1Instance({ host });
    const { me: account } = seedDefaults(api.seed);
    const handle = `${account.name}@${host}`;
    const accountJwt = makeFakeJwt({ iss: host, sub: account.name });

    api.seed.loggedInAs(account);
    await api.install(page);
    await seedCredentials(page, [{ jwt: accountJwt, handle }], handle);

    await page.goto("/");
    await expectTabContent(page, "posts", "Home");
    await page.getByRole("tab", { name: host }).click();
    await expectTabContent(page, "profile", handle);

    await page.getByRole("button", { name: "Accounts" }).click();
    const switcher = page.locator("ion-modal", { hasText: "Accounts" });
    await switcher.getByRole("button", { name: "Edit" }).click();
    await switcher
      .locator("ion-item", { hasText: handle })
      .getByRole("button", { name: "Remove" })
      .click();
    await switcher.getByRole("button", { name: "Log out" }).click();

    await api.waitForCall("POST /api/v4/account/auth/logout");
    await expect.poll(() => activeHandle(page)).toBeUndefined();
    await expect(switcher).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Get Started" }),
    ).toBeVisible();
    await page.waitForTimeout(250);

    await page.getByRole("tab", { name: "Posts" }).click();
    await expectTabContent(page, "posts", "All");
    await expect(page.locator('ion-tab-button[tab="posts"]')).toHaveAttribute(
      "href",
      `/posts/${host}/all`,
    );

    await visibleOutletPages(page)
      .last()
      .getByRole("button", { name: "Communities" })
      .click();
    await expectTabContent(page, "posts", "Communities");
    await expect(page.locator('ion-tab-button[tab="posts"]')).toHaveAttribute(
      "href",
      `/posts/${host}`,
    );
  },
);

test("v1: cross-instance account switch does not reuse a local post id", async ({
  api,
  page,
}, testInfo) => {
  test.skip(
    !["mobile-chrome", "mobile-safari"].includes(testInfo.project.name),
    "Account-switch navigation is covered on mobile projects",
  );

  const secondHost = "second.test.lemmy";
  const secondApi = new FakeLemmyV1Instance({ host: secondHost });
  const { me: secondMe } = seedDefaults(secondApi.seed);
  const secondPost = secondApi.seed.post({
    creator: secondMe,
    id: 201,
    name: "Post from the second instance",
  });
  const firstHandle = `alex@${V1_HOST}`;
  const secondHandle = `${secondMe.name}@${secondHost}`;

  api.seed.loggedInAs(api.me);
  secondApi.seed.loggedInAs(secondMe);
  await secondApi.install(page);
  await seedCredentials(
    page,
    [
      {
        jwt: makeFakeJwt({ iss: V1_HOST, sub: "alex" }),
        handle: firstHandle,
      },
      {
        jwt: makeFakeJwt({ iss: secondHost, sub: secondMe.name }),
        handle: secondHandle,
      },
    ],
    firstHandle,
  );

  await page.goto(`/posts/${V1_HOST}/all`);
  await page.getByText(fixturePosts[0]!.name).last().click();
  await expectTabContent(page, "posts", "Comments");

  await longPressProfileTab(page);
  const accountModal = page.locator("ion-modal", { hasText: "Accounts" });
  await accountModal.getByRole("radio", { name: secondHandle }).click();
  await expect.poll(() => activeHandle(page)).toBe(secondHandle);
  await expect(accountModal).toBeHidden();

  await expect(page).toHaveURL(`/posts/${secondHost}/home`);
  await expectTabContent(page, "posts", "Home");
  await expect(page.getByText(secondPost.name).last()).toBeVisible();
  await page.waitForTimeout(250);
  expect(secondApi.callsTo("getPost")).toHaveLength(0);
});
