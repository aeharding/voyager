// The random community jump from the search tab's special menu.
//
// Stays lemmyv1-only: `getRandomCommunity` is unsupported on piefed. (Post
// and community lookups plus the empty state are now provider-agnostic —
// see e2e/matrix/search.spec.ts.)

import { build, V1_HOST } from "../fixtures/builders";
import { expect, test } from "../fixtures/test";

// The search tab operates on the connected instance, so log into the fake
// host (logged out it would hit the unmocked default instance)
test.use({ ionicAnimations: true, loggedIn: true });

test("v1: quick random community response waits for the page transition", async ({
  api,
  page,
}) => {
  api.on.getRandomCommunity({
    json: { community_view: build.communityView() },
  });
  api.mock("GET /api/v4/community/list", {
    json: build.pagedResponse([build.communityView()]),
  });

  await page.goto(`/posts/${V1_HOST}/all`);

  await page.getByRole("tab", { name: "Search" }).click();
  await page.evaluate(() => {
    const listenForRandomPage = () => {
      document.querySelectorAll<HTMLElement>(".ion-page").forEach((page) => {
        if (page.dataset.randomEnterListener) return;
        page.dataset.randomEnterListener = "true";
        page.addEventListener("ionViewDidEnter", () => {
          const title = page.querySelector("ion-title")?.textContent?.trim();

          if (title === "Random")
            document.documentElement.dataset.randomPageEntered = "true";
        });
      });
    };
    const observer = new MutationObserver(listenForRandomPage);

    observer.observe(document, { childList: true, subtree: true });
    listenForRandomPage();
  });
  await page.getByText("Random Community").click();
  await expect(page).toHaveURL(/\/c\/test_comm/);
  expect(
    await page.evaluate(
      () => document.documentElement.dataset.randomPageEntered,
    ),
  ).toBe("true");
});

test("v1: random community navigates to a community", async ({ api, page }) => {
  let resolveRequestStarted!: () => void;
  const requestStarted = new Promise<void>((resolve) => {
    resolveRequestStarted = resolve;
  });
  let resolveResponse!: () => void;
  const responseAllowed = new Promise<void>((resolve) => {
    resolveResponse = resolve;
  });
  api.on.getRandomCommunity(async () => {
    resolveRequestStarted();
    await responseAllowed;

    return { json: { community_view: build.communityView() } };
  });
  // The special search menu only renders once trending communities resolve
  api.mock("GET /api/v4/community/list", {
    json: build.pagedResponse([build.communityView()]),
  });

  await page.goto(`/posts/${V1_HOST}/all`);

  await page.getByRole("tab", { name: "Search" }).click();
  await page.getByText("Random Community").click();
  await requestStarted;

  await expect(page).toHaveURL(/\/search\/random$/);
  await expect(
    page.getByText("Random", { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await expect(page.getByText("Failed to load :(")).not.toBeVisible();

  resolveResponse();

  await expect(page).toHaveURL(/\/c\/test_comm/);
  // The posts tab keeps a hidden copy of the feed mounted — filter to the
  // community page's visible one
  await expect(
    page.getByText("First v1 post").filter({ visible: true }),
  ).toBeVisible();
});
