// Unread comments: the "+N" feed pill, the getPost-on-open side effect that
// resets the server baseline, clearing the pill on open, and the per-comment
// highlight (new since last read, excluding your own; suppressed in a
// permalink/thread view).
//
// The feature is opt-in ("New Comments Highlightifier", off by default), so
// every test first flips the toggle through the real settings UI.
//
// TODO(seed): seeds can't express post_actions.read_comments_at/
// read_comments_amount (or per-comment published times relative to that
// boundary), so this spec stays wire-level via `build`.

import type { Page } from "@playwright/test";

import { build, me, V1_HOST } from "../fixtures/builders";
import { getSetting } from "../fixtures/db";
import { expect, test } from "../fixtures/test";

test.use({ loggedIn: true });

const reader = build.person({
  id: me.id,
  name: me.name,
  display_name: me.displayName,
});
const other = build.person({ id: 200, name: "otheruser" });

const BOUNDARY = "2026-05-21T12:00:00.000Z"; // matches unreadPost.read_comments_at
const BEFORE = "2026-05-20T12:00:00.000Z"; // read
const AFTER = "2026-05-22T12:00:00.000Z"; // new since last read

// 4 comments total, 2 already read → unread = 4 - 2 = 2 (pill shows "+2").
const unreadPostBase = build.postView({
  id: 500,
  name: "Post with unread comments",
  creator: reader,
});
const unreadPost = {
  ...unreadPostBase,
  post: { ...unreadPostBase.post, comments: 4 },
  post_actions: {
    read_at: BOUNDARY,
    read_comments_at: BOUNDARY,
    read_comments_amount: 2,
  },
};

// Never opened: no post_actions → threadiverse reports unread = total (4),
// which the pill suppresses (unread === total).
const neverOpenedPostBase = build.postView({
  id: 501,
  name: "Never opened post",
  creator: reader,
});
const neverOpenedPost = {
  ...neverOpenedPostBase,
  post: { ...neverOpenedPostBase.post, comments: 4 },
  post_actions: undefined,
};

const readComment = build.commentView({
  id: 5001,
  content: "read comment by other",
  post: unreadPost,
  creator: other,
  published_at: BEFORE,
});
const unreadComment = build.commentView({
  id: 5002,
  content: "unread comment by other",
  post: unreadPost,
  creator: other,
  published_at: AFTER,
});
const ownUnreadComment = build.commentView({
  id: 5003,
  content: "own comment after boundary",
  post: unreadPost,
  creator: reader,
  published_at: AFTER,
});

// Enables the setting through the settings page, then waits for the write to
// land in IndexedDB (it must survive the full page load of the next goto).
async function enableHighlightNewComments(page: Page) {
  await page.goto("/settings/general");

  const toggle = page.locator("ion-toggle", {
    hasText: "New Comments Highlightifier",
  });
  await toggle.click();
  await expect(toggle).toHaveJSProperty("checked", true);

  await expect
    .poll(() => getSetting(page, "highlight_new_comments"))
    .toBe(true);
}

test("v1: unread pill shows for opened-with-new, hidden for never-opened", async ({
  api,
  page,
}) => {
  await enableHighlightNewComments(page);
  api.on.getPosts({
    json: build.pagedResponse([unreadPost, neverOpenedPost]),
  });

  await page.goto(`/posts/${V1_HOST}/all`);

  // Pill + comment icon dot rendered on the opened-with-new post...
  const unreadCard = page
    .locator("ion-item", { hasText: "Post with unread comments" })
    .first();
  await expect(unreadCard).toContainText("+2");
  await expect(
    unreadCard.locator("ion-icon[class*='unreadIcon']"),
  ).toBeVisible();

  // ...and absent on the never-opened post.
  const neverCard = page
    .locator("ion-item", { hasText: "Never opened post" })
    .first();
  await expect(neverCard).toBeVisible();
  await expect(neverCard).not.toContainText("+");
  await expect(neverCard.locator("ion-icon[class*='unreadIcon']")).toHaveCount(
    0,
  );
});

test("v1: unread pill hidden when the setting is off (default)", async ({
  api,
  page,
}) => {
  api.on.getPosts({ json: build.pagedResponse([unreadPost]) });

  await page.goto(`/posts/${V1_HOST}/all`);

  const unreadCard = page
    .locator("ion-item", { hasText: "Post with unread comments" })
    .first();
  await expect(unreadCard).toBeVisible();
  await expect(unreadCard).not.toContainText("+2");
});

test("v1: opening a post fires getPost (server read-comments reset) and clears the pill", async ({
  api,
  page,
}) => {
  await enableHighlightNewComments(page);
  api.on.getPosts({ json: build.pagedResponse([unreadPost]) });
  api.on.getPost({ json: { post_view: unreadPost } });

  await page.goto(`/posts/${V1_HOST}/all`);

  const unreadCard = page
    .locator("ion-item", { hasText: "Post with unread comments" })
    .first();
  await expect(unreadCard).toContainText("+2");

  // Navigate into the post (post is already cached from the feed, so the only
  // getPost is our open side effect).
  await unreadCard.click();
  await expect(page).toHaveURL(/\/comments\/500/);

  // Title bar stacks "X Comments" over "X New" (snapshot, survives the clear).
  const title = page.locator("ion-title", { hasText: "Comments" }).first();
  await expect(title).toContainText("4 Comments");
  await expect(title).toContainText("2 New");

  await expect.poll(() => api.callsTo("getPost").length).toBeGreaterThan(0);

  // The pill is cleared optimistically on open (off-screen); confirm it's gone
  // once the feed is visible again.
  await page.goBack();
  await expect(
    page.locator("ion-item", { hasText: "Post with unread comments" }).first(),
  ).toBeVisible();
  await expect(
    page.locator("ion-item", { hasText: "Post with unread comments" }).first(),
  ).not.toContainText("+2");
});

test("v1: highlights new comments, not read or own ones", async ({
  api,
  page,
}) => {
  await enableHighlightNewComments(page);
  api.on.getPost({ json: { post_view: unreadPost } });
  api.on.getComments({
    json: build.pagedResponse([readComment, unreadComment, ownUnreadComment]),
  });

  await page.goto(`/posts/${V1_HOST}/c/test_comm/comments/500`);
  await expect(page.getByText("unread comment by other").first()).toBeVisible();

  // New, by someone else → highlighted unread.
  await expect(page.locator(".comment-5002").first()).toHaveClass(/unread/);
  // Published before the read boundary → not highlighted.
  await expect(page.locator(".comment-5001").first()).not.toHaveClass(/unread/);
  // New but authored by me → not highlighted (matches the server, which marks
  // your own comment read on creation).
  await expect(page.locator(".comment-5003").first()).not.toHaveClass(/unread/);
});

test("v1: comment-permalink view suppresses the unread highlight", async ({
  api,
  page,
}) => {
  await enableHighlightNewComments(page);
  api.on.getPost({ json: { post_view: unreadPost } });
  api.on.getComments({
    json: build.pagedResponse([unreadComment]),
  });

  // Permalink to the after-boundary comment: a partial view of the post.
  await page.goto(`/posts/${V1_HOST}/c/test_comm/comments/500/0.5002`);
  await expect(page.getByText("unread comment by other").first()).toBeVisible();

  // The `isFullPostView` gate suppresses unread highlighting here (only the
  // navigated-to comment's own highlight shows). That same gate is what keeps a
  // partial view from marking the post's comments read.
  await expect(page.locator(".comment-5002").first()).not.toHaveClass(/unread/);
});
