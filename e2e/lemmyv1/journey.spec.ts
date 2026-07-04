// Walk-through of voyager's main surfaces against the v1 fixtures.
// Useful for catching UI regressions a strict text assertion would miss.

import { fixturePosts, V1_HOST } from "../fixtures/builders";
import { expect, test } from "../fixtures/test";

test("v1: post feed lists all fixture posts", async ({ page }) => {
  await page.goto(`/posts/${V1_HOST}/all`);

  // Each fixture post title must render
  for (const post of fixturePosts) {
    await expect(page.getByText(post.name).first()).toBeVisible();
  }
});

test("v1: post detail body, author, and comment render", async ({
  api,
  page,
}) => {
  api.seed.comment({ id: 5001, content: "A v1 comment body" });

  await page.goto(
    `/posts/${V1_HOST}/c/test_comm/comments/${fixturePosts[0]!.id}`,
  );

  // Title and body
  await expect(page.getByText(fixturePosts[0]!.name).first()).toBeVisible();
  await expect(page.getByText(fixturePosts[0]!.body).first()).toBeVisible();

  // The seeded comment
  await expect(page.getByText("A v1 comment body").first()).toBeVisible();
});

test("v1: modlog dispatches and renders all three kinds", async ({ page }) => {
  await page.goto(`/posts/${V1_HOST}/mod/log`);

  // Three different modlog kinds, each handled by a different renderer
  await expect(page.getByText("Stickied Post").first()).toBeVisible();
  await expect(page.getByText("Banned User").first()).toBeVisible();
  await expect(page.getByText("Removed Comment").first()).toBeVisible();

  // Verify the ban reason from `modlog.reason` made it through
  await expect(page.getByText(/Spam/i).first()).toBeVisible();
});

test("v1: user profile renders without crashing", async ({ page }) => {
  await page.goto(`/posts/${V1_HOST}/u/alex`);

  await expect(page.getByText(/alex/i).first()).toBeVisible();
});
