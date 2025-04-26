import { expect, test } from "@playwright/test";

import { posts } from "./testdata/posts";

test("load community posts", async ({ page }) => {
  await page.route("*/**/api/v3/post/list**", async (route) => {
    await route.fulfill({ json: { posts } });
  });

  await page.goto("/");
  await page.waitForURL("/posts/lemm.ee/all");

  await expect(page).toHaveTitle("lemm.ee");

  await expect(page.getByText(posts[0]!.post.name)).toBeVisible();
});

test("navigate to post on click", async ({ page }) => {
  await page.route("*/**/api/v3/post/list**", async (route) => {
    await route.fulfill({ json: { posts } });
  });

  await page.goto("/");

  await page.getByText(posts[0]!.post.name).click();

  await expect(page).toHaveURL(
    "/posts/lemm.ee/c/community_1@test.lemmy/comments/999",
  );
});
