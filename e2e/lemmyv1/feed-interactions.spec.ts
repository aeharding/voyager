// Feed interactions: cursor pagination via infinite scroll, sort switching,
// listing type, voting from the feed, the mark-read-on-open side effect,
// local-only post hiding, and recovery after a failed page load.

import { build, fixturePosts, me, NOW, V1_HOST } from "../fixtures/builders";
import { readDbRows } from "../fixtures/db";
import { scrollFeedUntilVisible } from "../fixtures/scroll";
import { expect, test } from "../fixtures/test";

const wireMe = build.person({
  id: me.id,
  name: me.name,
  display_name: me.displayName,
});

// TODO(seed): the derived post list has no cursor pagination — page
// *response* shapes stay wire-level (request assertions are canonical)
const page1Posts = Array.from({ length: 50 }, (_, i) =>
  build.postView({ id: i + 1, name: `Feed post ${i + 1}`, creator: wireMe }),
);
const page2Posts = Array.from({ length: 10 }, (_, i) =>
  build.postView({ id: 51 + i, name: `Feed post ${51 + i}`, creator: wireMe }),
);

test("v1: infinite scroll requests the next page with the cursor", async ({
  api,
  page,
}) => {
  api.on.getPosts((call) =>
    call.query.get("page_cursor") === "cursor-2"
      ? { json: build.pagedResponse(page2Posts) }
      : { json: build.pagedResponse(page1Posts, "cursor-2") },
  );

  await page.goto(`/posts/${V1_HOST}/all`);
  await expect(page.getByText("Feed post 1", { exact: true })).toBeVisible();

  await scrollFeedUntilVisible(page, "Feed post 55");

  const payloads = api.callsTo("getPosts");
  expect(payloads.length).toBe(2);
  expect(payloads[1]!.page_cursor).toBe("cursor-2");
});

test("v1: changing sort refetches the feed", async ({ api, page }) => {
  await page.goto(`/posts/${V1_HOST}/all`);
  await expect(page.getByText("First v1 post")).toBeVisible();

  await page.getByRole("button", { name: "Change sort" }).click();
  await page.getByRole("button", { name: "New", exact: true }).click();

  const payload = await api.waitForPayload(
    "getPosts",
    (payload) => payload.sort === "new",
  );
  expect(payload.sort).toBe("new");
});

test("v1: local listing type requests local posts", async ({ api, page }) => {
  await page.goto(`/posts/${V1_HOST}/local`);
  await expect(page.getByText("First v1 post")).toBeVisible();

  const payload = await api.waitForPayload("getPosts");
  expect(payload.type_).toBe("local");
});

test.describe("logged in", () => {
  test.use({ loggedIn: true });

  test("v1: upvote from the feed sends like and updates score", async ({
    api,
    page,
  }) => {
    api.on.likePost(() => {
      // The fake has no vote state — the upvoted response is the spec's to
      // define, so it stays wire-level
      const liked = build.postView({ ...fixturePosts[0]!, creator: wireMe });
      Object.assign(liked.post, { score: 2, upvotes: 2 });
      return {
        json: {
          post_view: {
            ...liked,
            post_actions: { voted_at: NOW, vote_is_upvote: true },
          },
        },
      };
    });

    await page.goto(`/posts/${V1_HOST}/all`);

    const item = page.locator("ion-item", { hasText: "First v1 post" }).first();
    await item.getByRole("button", { name: "Upvote" }).click();

    const payload = await api.waitForPayload("likePost");
    expect(payload).toEqual({ post_id: 1, is_upvote: true });

    await expect(item.getByText("2", { exact: true })).toBeVisible();
  });

  test("v1: opening a post marks it read on the server", async ({
    api,
    page,
  }) => {
    await page.goto(`/posts/${V1_HOST}/all`);
    await page.getByText("First v1 post").first().click();
    await expect(page).toHaveURL(/\/comments\/1/);

    const payload = await api.waitForPayload("markPostAsRead");
    expect(payload.post_ids).toContain(1);
  });

  test("v1: hiding a post is local-only and removes it from the feed", async ({
    api,
    page,
  }) => {
    await page.goto(`/posts/${V1_HOST}/all`);

    const item = page.locator("ion-item", { hasText: "First v1 post" }).first();
    await item.getByRole("button", { name: "More options" }).click();
    await page.getByRole("button", { name: "Hide", exact: true }).click();

    await expect(
      page.locator("ion-item", { hasText: "First v1 post" }),
    ).toHaveCount(0);
    await expect(page.getByText("Second v1 post")).toBeVisible();

    // Hiding is persisted client-side (Dexie), not sent to the server
    await expect
      .poll(async () => {
        const rows = await readDbRows<{ post_id: number; hidden: number }>(
          page,
          "postMetadatas",
        );
        return rows.find((row) => row.post_id === 1)?.hidden;
      })
      .toBeTruthy();
    expect(api.calls("POST /api/v4/post/hide")).toHaveLength(0);
  });
});

test("v1: failed feed load shows retry, which recovers", async ({
  api,
  page,
}) => {
  api.once.getPosts({ abort: "connectionrefused" });

  await page.goto(`/posts/${V1_HOST}/all`);

  await expect(page.getByText("Failed to load more posts.")).toBeVisible();

  await page.getByText("Try again?").click();

  await expect(page.getByText("First v1 post")).toBeVisible();
});
