// Broad v1 smoke tests covering: post detail + comments, community page,
// and user profile. These hit a wider surface than the focused specs so we
// catch shape mismatches between the v1 wire format and threadiverse's
// public types.

import { fixturePosts, V1_HOST } from "../fixtures/builders";
import { expect, test } from "../fixtures/test";

test("v1: post detail page renders post + comments", async ({ api, page }) => {
  api.seed.comment({ content: "A v1 comment body", id: 5001 });

  await page.goto(
    `/posts/${V1_HOST}/c/test_comm/comments/${fixturePosts[0]!.id}`,
  );

  await expect(page.getByText(fixturePosts[0]!.name).first()).toBeVisible();
  await expect(page.getByText("A v1 comment body").first()).toBeVisible();
});

test("v1: community page loads with posts", async ({ page }) => {
  await page.goto(`/posts/${V1_HOST}/c/test_comm`);

  // Verify the community feed renders by checking for posts in it.
  await expect(page.getByText(fixturePosts[0]!.name).first()).toBeVisible();
});

test("v1: user profile loads from handle", async ({ page }) => {
  await page.goto(`/posts/${V1_HOST}/u/alex`);

  await expect(page.getByText(/alex/i).first()).toBeVisible();
});
