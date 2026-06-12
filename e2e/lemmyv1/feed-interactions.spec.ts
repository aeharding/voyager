// Feed interactions: cursor pagination via infinite scroll, sort switching,
// listing type, voting from the feed, the mark-read-on-open side effect,
// local-only post hiding, and recovery after a failed page load.

import type { Page } from "@playwright/test";

import {
  fixturePosts,
  me,
  NOW,
  pagedResponse,
  postView,
  V1_HOST,
} from "../fixtures/builders";
import { readDbRows } from "../fixtures/db";
import { expect, test } from "../fixtures/test";

const page1Posts = Array.from({ length: 50 }, (_, i) =>
  postView({ id: i + 1, name: `Feed post ${i + 1}`, creator: me }),
);
const page2Posts = Array.from({ length: 10 }, (_, i) =>
  postView({ id: 51 + i, name: `Feed post ${51 + i}`, creator: me }),
);

// The feed is virtualized (virtua), so scroll the real scroll container and
// wait for the target item to enter the DOM.
async function scrollFeedUntilVisible(page: Page, text: string) {
  await expect(async () => {
    await page.evaluate(() => {
      const scroller = document.querySelector(".ion-content-scroll-host");
      scroller?.scrollTo({ top: scroller.scrollHeight });
    });
    await expect(page.getByText(text, { exact: true })).toBeVisible({
      timeout: 1000,
    });
  }).toPass({ timeout: 15_000 });
}

test("v1: infinite scroll requests the next page with the cursor", async ({
  api,
  page,
}) => {
  api.mock("GET /api/v4/post/list", (call) =>
    call.query.get("page_cursor") === "cursor-2"
      ? { json: pagedResponse(page2Posts) }
      : { json: pagedResponse(page1Posts, "cursor-2") },
  );

  await page.goto(`/posts/${V1_HOST}/all`);
  await expect(page.getByText("Feed post 1", { exact: true })).toBeVisible();

  await scrollFeedUntilVisible(page, "Feed post 55");

  const listCalls = api.calls("GET /api/v4/post/list");
  expect(listCalls.length).toBe(2);
  expect(listCalls[1]!.query.get("page_cursor")).toBe("cursor-2");
});

test("v1: changing sort refetches the feed", async ({ api, page }) => {
  await page.goto(`/posts/${V1_HOST}/all`);
  await expect(page.getByText("First v1 post")).toBeVisible();

  // Sort is the first header end button on the special feed page
  await page.locator('ion-buttons[slot="end"] ion-button').first().click();
  await page.getByRole("button", { name: "New", exact: true }).click();

  const call = await api.waitForCall(
    "GET /api/v4/post/list",
    (call) => call.query.get("sort") === "new",
  );
  expect(call.query.get("sort")).toBe("new");
});

test("v1: local listing type requests local posts", async ({ api, page }) => {
  await page.goto(`/posts/${V1_HOST}/local`);
  await expect(page.getByText("First v1 post")).toBeVisible();

  const call = await api.waitForCall("GET /api/v4/post/list");
  expect(call.query.get("type_")).toBe("local");
});

test.describe("logged in", () => {
  test.use({ loggedIn: true });

  test("v1: upvote from the feed sends like and updates score", async ({
    api,
    page,
  }) => {
    api.mock("POST /api/v4/post/like", () => {
      const liked = structuredClone(fixturePosts[0]!);
      liked.post.score = 2;
      liked.post.upvotes = 2;
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
    // Large post action bar: [ellipsis] [upvote] [downvote]
    const actions = item.locator("div[class*='rightDetails']");
    await actions.locator("button").nth(1).click();

    const call = await api.waitForCall("POST /api/v4/post/like");
    expect(call.body).toEqual({ post_id: 1, is_upvote: true });

    await expect(item.getByText("2", { exact: true })).toBeVisible();
  });

  test("v1: opening a post marks it read on the server", async ({
    api,
    page,
  }) => {
    api.mock("GET /api/v4/post", { json: { post_view: fixturePosts[0] } });

    await page.goto(`/posts/${V1_HOST}/all`);
    await page.getByText("First v1 post").first().click();
    await expect(page).toHaveURL(/\/comments\/1/);

    const call = await api.waitForCall("POST /api/v4/post/mark_as_read/many");
    expect((call.body as { post_ids: number[] }).post_ids).toContain(1);
  });

  test("v1: hiding a post is local-only and removes it from the feed", async ({
    api,
    page,
  }) => {
    await page.goto(`/posts/${V1_HOST}/all`);

    const item = page.locator("ion-item", { hasText: "First v1 post" }).first();
    // Large post action bar: [ellipsis] [upvote] [downvote]
    const actions = item.locator("div[class*='rightDetails']");
    await actions.locator("button").nth(0).click();
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
  let failNext = true;
  api.mock("GET /api/v4/post/list", () => {
    if (failNext) return { abort: "connectionrefused" };
    return { json: pagedResponse(fixturePosts) };
  });

  await page.goto(`/posts/${V1_HOST}/all`);

  await expect(page.getByText("Failed to load more posts.")).toBeVisible();

  failNext = false;
  await page.getByText("Try again?").click();

  await expect(page.getByText("First v1 post")).toBeVisible();
});
