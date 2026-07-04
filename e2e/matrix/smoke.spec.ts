// Broad smoke tests covering: post detail + comments, community page, and
// user profile. These hit a wider surface than the focused specs so we
// catch shape mismatches between each provider's wire format and
// threadiverse's public types as rendered by the real app.

import { fixturePosts } from "../fixtures/builders";
import { expect, test } from "./fixtures";

test("post detail page renders post + comments", async ({ api, page }) => {
  api.seed.comment({ content: "A comment body", id: 5001 });

  await page.goto(
    `/posts/${api.host}/c/test_comm/comments/${fixturePosts[0]!.id}`,
  );

  await expect(page.getByText(fixturePosts[0]!.name).first()).toBeVisible();
  await expect(page.getByText("A comment body").first()).toBeVisible();
});

test("community page loads with posts", async ({ api, page }) => {
  await page.goto(`/posts/${api.host}/c/test_comm`);

  // Verify the community feed renders by checking for posts in it.
  await expect(page.getByText(fixturePosts[0]!.name).first()).toBeVisible();
});

test("user profile loads from handle", async ({ api, page }) => {
  await page.goto(`/posts/${api.host}/u/alex`);

  await expect(page.getByText(/alex/i).first()).toBeVisible();
});
