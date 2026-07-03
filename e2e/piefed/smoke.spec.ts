// PieFed smoke: mirrors e2e/lemmyv1/smoke.spec.ts against the PieFed fake —
// same seed API, different provider wire underneath. Catches shape
// mismatches between PieFed's wire format and threadiverse's public types
// as rendered by the real app.

import { expect, PIEFED_HOST, test } from "./fixtures";

test("piefed: post detail page renders post + comments", async ({
  api,
  page,
}) => {
  api.seed.comment({ content: "A piefed comment body", id: 5001 });

  await page.goto(`/posts/${PIEFED_HOST}/c/test_comm/comments/1`);

  await expect(page.getByText("First piefed post").first()).toBeVisible();
  await expect(page.getByText("A piefed comment body").first()).toBeVisible();
});

test("piefed: community page loads with posts", async ({ page }) => {
  await page.goto(`/posts/${PIEFED_HOST}/c/test_comm`);

  await expect(page.getByText("First piefed post").first()).toBeVisible();
});

test("piefed: user profile loads from handle", async ({ page }) => {
  await page.goto(`/posts/${PIEFED_HOST}/u/alex`);

  await expect(page.getByText(/alex/i).first()).toBeVisible();
});
