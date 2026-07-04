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
