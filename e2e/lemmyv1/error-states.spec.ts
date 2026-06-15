// Error handling: 404s for posts and communities, vote failure rollback,
// and an unreachable instance.

import {
  fixturePosts,
  NOW,
  pagedResponse,
  V1_HOST,
} from "../fixtures/builders";
import { expect, test } from "../fixtures/test";

test("v1: missing post renders not-found state", async ({ api, page }) => {
  api.mock("GET /api/v4/post", {
    status: 404,
    json: { error: "not_found" },
  });

  await page.goto(`/posts/${V1_HOST}/c/test_comm/comments/12345`);

  await expect(page.getByText("Post not found")).toBeVisible();
});

test("v1: missing community shows failed feed with retry", async ({
  api,
  page,
}) => {
  api.mock("GET /api/v4/community", {
    status: 404,
    json: { error: "couldnt_find_community" },
  });
  api.mock("GET /api/v4/post/list", {
    status: 404,
    json: { error: "couldnt_find_community" },
  });

  await page.goto(`/posts/${V1_HOST}/c/missing_comm`);

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

  test("v1: failed vote reverts the optimistic score", async ({
    api,
    page,
  }) => {
    api.mock("POST /api/v4/post/like", {
      status: 400,
      json: { error: "rate_limit_error" },
    });

    await page.goto(`/posts/${V1_HOST}/all`);

    const item = page.locator("ion-item", { hasText: "First v1 post" }).first();
    await item.getByRole("button", { name: "Upvote" }).click();

    await api.waitForCall("POST /api/v4/post/like");

    // Error toast + score back to the original 1
    await expect(page.getByText(/Problem voting/i)).toBeVisible();
    await expect(item.getByText("1", { exact: true })).toBeVisible();
  });
});

test("v1: unreachable instance shows feed error, not a spinner", async ({
  api,
  page,
}) => {
  api.mock("GET /api/v4/post/list", { abort: "connectionrefused" });

  await page.goto(`/posts/${V1_HOST}/all`);

  await expect(page.getByText("Failed to load more posts.")).toBeVisible();
  await expect(page.getByText("Try again?")).toBeVisible();
});
