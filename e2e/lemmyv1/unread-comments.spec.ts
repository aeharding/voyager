// Unread comments: the "+N" feed pill, the getPost-on-open side effect that
// resets the server baseline, clearing the pill on open, and the per-comment
// highlight (new since last read, excluding your own; suppressed in a
// permalink/thread view).
//
// The feature is opt-in ("New Comments Highlightifier", off by default), so
// every test first flips the toggle through the real settings UI.
import { expect, type Page, test } from "@playwright/test";

import { me, mockV1, person, postView, V1_HOST } from "./_fixtures";

// These tests load the app twice (settings page to enable the feature, then
// the page under test). The first load registers the PWA service worker, and
// on WebKit requests that flow through an active service worker bypass
// Playwright's route interception — the second load would hit the real
// network. Chromium intercepts SW traffic and Playwright disables SWs in
// Firefox, so only WebKit needs this, but block uniformly for determinism.
test.use({ serviceWorkers: "block" });

const reader = me;
const other = person({ id: 200, name: "otheruser" });

const BOUNDARY = "2026-05-21T12:00:00.000Z"; // matches unreadPost.read_comments_at
const BEFORE = "2026-05-20T12:00:00.000Z"; // read
const AFTER = "2026-05-22T12:00:00.000Z"; // new since last read

// 4 comments total, 2 already read → unread = 4 - 2 = 2 (pill shows "+2").
const unreadPostBase = postView({
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
const neverOpenedPostBase = postView({
  id: 501,
  name: "Never opened post",
  creator: reader,
});
const neverOpenedPost = {
  ...neverOpenedPostBase,
  post: { ...neverOpenedPostBase.post, comments: 4 },
  post_actions: undefined,
};

function commentView(opts: {
  id: number;
  creator: ReturnType<typeof person>;
  publishedAt: string;
  content: string;
}) {
  return {
    comment: {
      id: opts.id,
      creator_id: opts.creator.id,
      post_id: unreadPost.post.id,
      content: opts.content,
      removed: false,
      published_at: opts.publishedAt,
      updated_at: undefined,
      deleted: false,
      ap_id: `https://${V1_HOST}/comment/${opts.id}`,
      local: true,
      path: `0.${opts.id}`,
      distinguished: false,
      language_id: 0,
      score: 1,
      upvotes: 1,
      downvotes: 0,
      child_count: 0,
      report_count: 0,
      unresolved_report_count: 0,
      federation_pending: false,
      locked: false,
    },
    creator: opts.creator,
    post: unreadPost.post,
    community: unreadPost.community,
    comment_actions: undefined,
    community_actions: undefined,
    person_actions: undefined,
    can_mod: false,
    creator_banned: false,
    creator_ban_expires_at: undefined,
    creator_is_admin: false,
    creator_is_moderator: false,
    creator_banned_from_community: false,
    creator_community_ban_expires_at: undefined,
  };
}

const readComment = commentView({
  id: 5001,
  creator: other,
  publishedAt: BEFORE,
  content: "read comment by other",
});
const unreadComment = commentView({
  id: 5002,
  creator: other,
  publishedAt: AFTER,
  content: "unread comment by other",
});
const ownUnreadComment = commentView({
  id: 5003,
  creator: reader,
  publishedAt: AFTER,
  content: "own comment after boundary",
});

// Raw v1 MyUserInfo returned by GET /account (getMyUser), so
// `userPersonSelector` resolves to id 100 and the own-comment skip applies.
const myUser = {
  community_blocks: [],
  follows: [],
  instance_communities_blocks: [],
  instance_persons_blocks: [],
  local_user_view: {
    local_user: { admin: false, show_nsfw: false },
    person: me,
  },
  moderates: [],
  person_blocks: [],
};

async function loginAs(page: Page) {
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

  // Authed `getSite` fires getMyUser (GET /account); mock it so every logged-in
  // test is deterministic and `userPersonSelector` resolves to id 100.
  await page.route(`**/api/v4/account**`, (route) =>
    route.fulfill({ json: myUser }),
  );
}

// Enables the setting through the settings page, then waits for the write to
// land in IndexedDB (it must survive the full page load of the next goto).
// Assumes the page is logged in (loginAs) so the app boots against the mocked
// v1 host rather than the unmocked default instance.
async function enableHighlightNewComments(page: Page) {
  await page.goto("/settings/general");

  const toggle = page.locator("ion-toggle", {
    hasText: "New Comments Highlightifier",
  });
  await toggle.click();
  await expect(toggle).toHaveJSProperty("checked", true);

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise((resolve) => {
            const request = indexedDB.open("WefwefDB");
            request.onsuccess = () => {
              const db = request.result;
              const getAll = db
                .transaction("settings")
                .objectStore("settings")
                .getAll();
              getAll.onsuccess = () => {
                db.close();
                resolve(
                  getAll.result.some(
                    (setting) =>
                      setting.key === "highlight_new_comments" &&
                      setting.value === true,
                  ),
                );
              };
            };
          }),
      ),
    )
    .toBe(true);
}

test("v1: unread pill shows for opened-with-new, hidden for never-opened", async ({
  page,
}) => {
  await loginAs(page);
  await mockV1(page);
  await enableHighlightNewComments(page);
  await page.route(`**/api/v4/post/list**`, async (route) => {
    await route.fulfill({
      json: {
        items: [unreadPost, neverOpenedPost],
        next_page: null,
        prev_page: null,
      },
    });
  });

  await page.goto(`/posts/${V1_HOST}/all`);

  // Pill rendered on the opened-with-new post...
  const unreadCard = page
    .locator("ion-item", { hasText: "Post with unread comments" })
    .first();
  await expect(unreadCard).toContainText("+2");

  // ...and absent on the never-opened post.
  const neverCard = page
    .locator("ion-item", { hasText: "Never opened post" })
    .first();
  await expect(neverCard).toBeVisible();
  await expect(neverCard).not.toContainText("+");
});

test("v1: unread pill hidden when the setting is off (default)", async ({
  page,
}) => {
  await loginAs(page);
  await mockV1(page);
  await page.route(`**/api/v4/post/list**`, async (route) => {
    await route.fulfill({
      json: { items: [unreadPost], next_page: null, prev_page: null },
    });
  });

  await page.goto(`/posts/${V1_HOST}/all`);

  const unreadCard = page
    .locator("ion-item", { hasText: "Post with unread comments" })
    .first();
  await expect(unreadCard).toBeVisible();
  await expect(unreadCard).not.toContainText("+2");
});

test("v1: opening a post fires getPost (server read-comments reset) and clears the pill", async ({
  page,
}) => {
  await loginAs(page);
  await mockV1(page);
  await enableHighlightNewComments(page);
  await page.route(`**/api/v4/post/list**`, async (route) => {
    await route.fulfill({
      json: { items: [unreadPost], next_page: null, prev_page: null },
    });
  });

  let getPostCount = 0;
  await page.route(`**/api/v4/post?*`, async (route) => {
    getPostCount += 1;
    await route.fulfill({ json: { post_view: unreadPost } });
  });
  // markPostAsRead etc. — swallow auth'd side calls so nothing hits real network.
  await page.route(`**/api/v4/post/mark_as_read**`, (route) =>
    route.fulfill({ json: { success: true } }),
  );

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

  await expect.poll(() => getPostCount).toBeGreaterThan(0);

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

test("v1: highlights new comments, not read or own ones", async ({ page }) => {
  await loginAs(page);
  await mockV1(page);
  await enableHighlightNewComments(page);
  await page.route(`**/api/v4/post?*`, (route) =>
    route.fulfill({ json: { post_view: unreadPost } }),
  );
  await page.route(`**/api/v4/post/mark_as_read**`, (route) =>
    route.fulfill({ json: { success: true } }),
  );
  await page.route(`**/api/v4/comment/list**`, (route) =>
    route.fulfill({
      json: {
        items: [readComment, unreadComment, ownUnreadComment],
        next_page: null,
        prev_page: null,
      },
    }),
  );

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
  page,
}) => {
  await loginAs(page);
  await mockV1(page);
  await enableHighlightNewComments(page);
  await page.route(`**/api/v4/post?*`, (route) =>
    route.fulfill({ json: { post_view: unreadPost } }),
  );
  await page.route(`**/api/v4/post/mark_as_read**`, (route) =>
    route.fulfill({ json: { success: true } }),
  );
  await page.route(`**/api/v4/comment/list**`, (route) =>
    route.fulfill({
      json: { items: [unreadComment], next_page: null, prev_page: null },
    }),
  );

  // Permalink to the after-boundary comment: a partial view of the post.
  await page.goto(`/posts/${V1_HOST}/c/test_comm/comments/500/0.5002`);
  await expect(page.getByText("unread comment by other").first()).toBeVisible();

  // The `isFullPostView` gate suppresses unread highlighting here (only the
  // navigated-to comment's own highlight shows). That same gate is what keeps a
  // partial view from marking the post's comments read.
  await expect(page.locator(".comment-5002").first()).not.toHaveClass(/unread/);
});
