// Error handling: 404s for posts and communities, vote failure rollback,
// and an unreachable instance. Errors are injected canonically
// (`{ error: { code, status } }`) — each fake renders its provider's wire
// error shape, and threadiverse maps it back to the same condition classes.

import { expect, test } from "./fixtures";

test("missing post renders not-found state", async ({ api, page }) => {
  // Post 12345 is not seeded, so the fake 404s the lookup
  await page.goto(`/posts/${api.host}/c/test_comm/comments/12345`);

  await expect(page.getByText("Post not found")).toBeVisible();
});

test("missing community shows failed feed with retry", async ({
  api,
  page,
}) => {
  api.on.getCommunity({
    error: { code: "couldnt_find_community", status: 404 },
  });
  api.on.getPosts({ error: { code: "couldnt_find_community", status: 404 } });

  await page.goto(`/posts/${api.host}/c/missing_comm`);

  const retry = page.getByRole("button", {
    name: /Failed to load more posts\./,
  });
  await expect(retry).toBeVisible();

  // Regression guard: the retry control is a <button> for a11y but must keep
  // its container layout. Composing `plainButton` used to clobber it to
  // `inline-flex`/auto-width; assert the container's `display: flex` survives.
  await expect(retry).toHaveCSS("display", "flex");
});

test.describe("logged in", () => {
  test.use({ loggedIn: true });

  test("failed vote reverts the optimistic score", async ({ api, page }) => {
    api.on.likePost({ error: { code: "rate_limit_error", status: 400 } });

    await page.goto(`/posts/${api.host}/all`);

    const item = page.locator("ion-item", { hasText: "First v1 post" }).first();
    await item.getByRole("button", { name: "Upvote" }).click();

    await api.waitForPayload("likePost");

    // Error toast (rate_limit_error maps to the specific rate-limit
    // message via threadiverse's RateLimitedError) + score back to the
    // original 1
    await expect(page.getByText(/Too many requests/i)).toBeVisible();
    await expect(item.getByText("1", { exact: true })).toBeVisible();
  });
});

test("unreachable instance shows feed error, not a spinner", async ({
  api,
  page,
}) => {
  api.on.getPosts({ abort: "connectionrefused" });

  await page.goto(`/posts/${api.host}/all`);

  await expect(page.getByText("Failed to load more posts.")).toBeVisible();
  await expect(page.getByText("Try again?")).toBeVisible();
});
