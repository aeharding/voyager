import { expect, test } from "@playwright/test";

import { fixturePosts, mockV1, V1_HOST } from "./_fixtures";

test("v1: post feed loads", async ({ page }) => {
  await mockV1(page);

  await page.goto(`/posts/${V1_HOST}/all`);

  for (const view of fixturePosts) {
    await expect(page.getByText(view.post.name).first()).toBeVisible();
  }
});

test("v1: clicking a post navigates to detail", async ({ page }) => {
  await mockV1(page);

  await page.goto(`/posts/${V1_HOST}/all`);

  await page.getByText(fixturePosts[0]!.post.name).first().click();

  await expect(page).toHaveURL(
    new RegExp(
      `/posts/${V1_HOST}/c/test_comm/comments/${fixturePosts[0]!.post.id}`,
    ),
  );
});
