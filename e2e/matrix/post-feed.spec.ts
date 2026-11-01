import { fixturePosts } from "../fixtures/builders";
import { getSetting } from "../fixtures/db";
import { expect, test } from "./fixtures";

test("post feed loads", async ({ api, page }) => {
  await page.goto(`/posts/${api.host}/all`);

  for (const post of fixturePosts) {
    await expect(page.getByText(post.name).first()).toBeVisible();
  }
});

test("clicking a post navigates to detail", async ({ api, page }) => {
  await page.goto(`/posts/${api.host}/all`);

  await page.getByText(fixturePosts[0]!.name).first().click();

  await expect(page).toHaveURL(
    new RegExp(
      `/posts/${api.host}/c/test_comm/comments/${fixturePosts[0]!.id}`,
    ),
  );
});

test("keyboard navigation moves the selected post in two-column mode", async ({
  api,
  page,
}) => {
  test.skip(
    (page.viewportSize()?.width ?? 0) < 768,
    "Two-column mode is unavailable on narrow viewports",
  );

  await page.goto("/settings/appearance");
  await page.getByText("Two Column Mode").click();
  await page.getByRole("button", { name: "On", exact: true }).click();
  await expect.poll(() => getSetting(page, "two_column_layout")).toBe("on");

  await page.goto(`/posts/${api.host}/all`);

  const firstPost = page
    .locator("ion-router-outlet ion-item", { hasText: fixturePosts[0]!.name })
    .first();
  const secondPost = page
    .locator("ion-router-outlet ion-item", { hasText: fixturePosts[1]!.name })
    .first();

  await expect(firstPost).toBeVisible();

  await page.keyboard.press("j");
  await expect(firstPost).toHaveClass(/app-activated/);

  await page.keyboard.press("ArrowDown");
  await expect(secondPost).toHaveClass(/app-activated/);
  await expect(firstPost).not.toHaveClass(/app-activated/);

  await page.keyboard.press("k");
  await expect(firstPost).toHaveClass(/app-activated/);

  await page.keyboard.press("ArrowUp");
  await expect(firstPost).toHaveClass(/app-activated/);
});

test.describe("logged in", () => {
  test.use({ loggedIn: true });

  test("upvote from the feed sends like and updates score", async ({
    api,
    page,
  }) => {
    await page.goto(`/posts/${api.host}/all`);

    const item = page
      .locator("ion-item", { hasText: fixturePosts[0]!.name })
      .first();
    await item.getByRole("button", { name: "Upvote" }).click();

    const payload = await api.waitForPayload("likePost");
    expect(payload).toEqual({ is_upvote: true, post_id: fixturePosts[0]!.id });

    // The fake derives the vote; the feed reflects the new score (base 1 → 2)
    await expect(item.getByText("2", { exact: true })).toBeVisible();
  });
});
