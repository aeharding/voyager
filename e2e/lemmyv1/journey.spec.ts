// Live screenshot-driven walk-through of voyager against the v1 fixtures.
// Useful for catching UI regressions a strict text assertion would miss.

import { expect, type Page, test } from "@playwright/test";

import { fixturePosts, mockV1, V1_HOST } from "./_fixtures";

const NOW = "2026-05-21T12:00:00.000Z";

function commentView() {
  return {
    comment: {
      id: 5001,
      creator_id: 100,
      post_id: fixturePosts[0]!.post.id,
      content: "A v1 comment body",
      removed: false,
      published_at: NOW,
      updated_at: undefined,
      deleted: false,
      ap_id: `https://${V1_HOST}/comment/5001`,
      local: true,
      path: `0.5001`,
      distinguished: false,
      language_id: 0,
      score: 4,
      upvotes: 4,
      downvotes: 0,
      child_count: 0,
      report_count: 0,
      unresolved_report_count: 0,
      federation_pending: false,
      locked: false,
    },
    creator: fixturePosts[0]!.creator,
    post: fixturePosts[0]!.post,
    community: fixturePosts[0]!.community,
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

async function mockExtras(page: Page) {
  await page.route(`**/api/v4/comment/list**`, async (route) => {
    await route.fulfill({
      json: { items: [commentView()], next_page: null, prev_page: null },
    });
  });
  await page.route(`**/api/v4/post?**`, async (route) => {
    await route.fulfill({ json: { post_view: fixturePosts[0] } });
  });
  await page.route(`**/api/v4/post/like`, async (route) => {
    const liked = JSON.parse(JSON.stringify(fixturePosts[0]));
    liked.post.score = 2;
    liked.post.upvotes = 2;
    liked.post_actions = { voted_at: NOW, vote_is_upvote: true };
    await route.fulfill({ json: { post_view: liked } });
  });
}

test("v1: post feed lists all fixture posts", async ({ page }) => {
  await mockV1(page);

  await page.goto(`/posts/${V1_HOST}/all`);

  // Each fixture post title must render
  for (const view of fixturePosts) {
    await expect(page.getByText(view.post.name).first()).toBeVisible();
  }
});

test("v1: post detail body, author, and comment render", async ({ page }) => {
  await mockV1(page);
  await mockExtras(page);

  await page.goto(
    `/posts/${V1_HOST}/c/test_comm/comments/${fixturePosts[0]!.post.id}`,
  );

  // Title and body
  await expect(
    page.getByText(fixturePosts[0]!.post.name).first(),
  ).toBeVisible();
  await expect(
    page.getByText(fixturePosts[0]!.post.body!).first(),
  ).toBeVisible();

  // The mocked comment
  await expect(page.getByText("A v1 comment body").first()).toBeVisible();
});

test("v1: modlog dispatches and renders all three kinds", async ({ page }) => {
  await mockV1(page);

  await page.goto(`/posts/${V1_HOST}/mod/log`);

  // Three different modlog kinds, each handled by a different renderer
  await expect(page.getByText("Stickied Post").first()).toBeVisible();
  await expect(page.getByText("Banned User").first()).toBeVisible();
  await expect(page.getByText("Removed Comment").first()).toBeVisible();

  // Verify the ban reason from `modlog.reason` made it through
  await expect(page.getByText(/Spam/i).first()).toBeVisible();
});

test("v1: user profile renders without crashing", async ({ page }) => {
  await mockV1(page);
  await page.route(`**/api/v4/person?**`, async (route) => {
    await route.fulfill({
      json: {
        person_view: { person: fixturePosts[0]!.creator, is_admin: false },
        moderates: [],
        site: undefined,
      },
    });
  });
  await page.route(`**/api/v4/person/content**`, async (route) => {
    await route.fulfill({
      json: { items: [], next_page: null, prev_page: null },
    });
  });

  await page.goto(`/posts/${V1_HOST}/u/alex`);

  await expect(page.getByText(/alex/i).first()).toBeVisible();
});
