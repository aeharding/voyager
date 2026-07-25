// Feed interactions: cursor pagination via infinite scroll, sort switching,
// listing type, the mark-read-on-open side effect, and recovery after a
// failed page load. (Rendering and voting live in post-feed.spec.ts; local
// post hiding stays provider-specific — see e2e/lemmyv1/feed-interactions.)

import { fixturePosts } from "../fixtures/builders";
import { scrollFeedUntilVisible } from "../fixtures/scroll";
import { expect, test } from "./fixtures";

/** Voyager's page size (LIMIT); a full page is what earns a next cursor */
const PAGE_SIZE = 50;

test("infinite scroll requests the next page with the cursor", async ({
  api,
  page,
}) => {
  // Enough to fill page one (the fixture's posts count toward it) and leave
  // a short second page, so the feed also stops when the cursor runs out
  for (let index = fixturePosts.length + 1; index <= PAGE_SIZE + 5; index++) {
    api.seed.post({ name: `Feed post ${index}` });
  }

  await page.goto(`/posts/${api.host}/all`);
  await expect(page.getByText(fixturePosts[0]!.name)).toBeVisible();

  await scrollFeedUntilVisible(page, `Feed post ${PAGE_SIZE + 5}`);

  // Two pages, and no third — the short second page hands out no cursor
  const payloads = api.callsTo("getPosts");
  expect(payloads.length).toBe(2);
  expect(payloads.map((payload) => payload.limit)).toEqual([
    PAGE_SIZE,
    PAGE_SIZE,
  ]);
  expect(payloads[0]!.page_cursor).toBeUndefined();
  // Cursors are opaque and provider-shaped (v1 hands out a string, piefed a
  // page number), so the round-trip assertion is that page two's posts
  // rendered — reachable only by sending back what page one returned.
  expect(payloads[1]!.page_cursor).toBeTruthy();
});

test("changing sort refetches the feed", async ({ api, page }) => {
  await page.goto(`/posts/${api.host}/all`);
  await expect(page.getByText(fixturePosts[0]!.name)).toBeVisible();

  await page.getByRole("button", { name: "Change sort" }).click();
  await page.getByRole("button", { name: "New", exact: true }).click();

  const payload = await api.waitForPayload(
    "getPosts",
    (payload) => payload.sort === api.sorts.New,
  );
  expect(payload.sort).toBe(api.sorts.New);
});

test("local listing type requests local posts", async ({ api, page }) => {
  await page.goto(`/posts/${api.host}/local`);
  await expect(page.getByText(fixturePosts[0]!.name)).toBeVisible();

  const payload = await api.waitForPayload("getPosts");
  expect(payload.type_).toBe("local");
});

test.describe("logged in", () => {
  test.use({ loggedIn: true });

  test("opening a post marks it read on the server", async ({ api, page }) => {
    await page.goto(`/posts/${api.host}/all`);
    await page.getByText(fixturePosts[0]!.name).first().click();
    await expect(page).toHaveURL(
      new RegExp(`/comments/${fixturePosts[0]!.id}`),
    );

    const payload = await api.waitForPayload("markPostAsRead");
    expect(payload.post_ids).toContain(fixturePosts[0]!.id);
  });
});

test("failed feed load shows retry, which recovers", async ({ api, page }) => {
  api.once.getPosts({ abort: "connectionrefused" });

  await page.goto(`/posts/${api.host}/all`);

  await expect(page.getByText("Failed to load more posts.")).toBeVisible();

  await page.getByText("Try again?").click();

  await expect(page.getByText(fixturePosts[0]!.name)).toBeVisible();
});
