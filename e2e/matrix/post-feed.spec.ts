import { fixturePosts } from "../fixtures/builders";
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
