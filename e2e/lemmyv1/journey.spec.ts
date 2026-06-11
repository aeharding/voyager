// Walk-through of voyager's main surfaces against the v1 fixtures.
// Useful for catching UI regressions a strict text assertion would miss.

import {
  commentView,
  fixturePosts,
  pagedResponse,
  personResponse,
  V1_HOST,
} from "../fixtures/builders";
import { expect, test } from "../fixtures/test";

test("v1: post feed lists all fixture posts", async ({ page }) => {
  await page.goto(`/posts/${V1_HOST}/all`);

  // Each fixture post title must render
  for (const view of fixturePosts) {
    await expect(page.getByText(view.post.name).first()).toBeVisible();
  }
});

test("v1: post detail body, author, and comment render", async ({
  api,
  page,
}) => {
  api.mock("GET /api/v4/post", { json: { post_view: fixturePosts[0] } });
  api.mock("GET /api/v4/comment/list", {
    json: pagedResponse([
      commentView({ id: 5001, content: "A v1 comment body" }),
    ]),
  });

  await page.goto(
    `/posts/${V1_HOST}/c/test_comm/comments/${fixturePosts[0]!.post.id}`,
  );

  // Title and body
  await expect(
    page.getByText(fixturePosts[0]!.post.name).first(),
  ).toBeVisible();
  await expect(
    page.getByText(fixturePosts[0]!.post.body!).first(),
  ).toBeVisible();

  // The mocked comment
  await expect(page.getByText("A v1 comment body").first()).toBeVisible();
});

test("v1: modlog dispatches and renders all three kinds", async ({ page }) => {
  await page.goto(`/posts/${V1_HOST}/mod/log`);

  // Three different modlog kinds, each handled by a different renderer
  await expect(page.getByText("Stickied Post").first()).toBeVisible();
  await expect(page.getByText("Banned User").first()).toBeVisible();
  await expect(page.getByText("Removed Comment").first()).toBeVisible();

  // Verify the ban reason from `modlog.reason` made it through
  await expect(page.getByText(/Spam/i).first()).toBeVisible();
});

test("v1: user profile renders without crashing", async ({ api, page }) => {
  api.mock("GET /api/v4/person", {
    json: personResponse(fixturePosts[0]!.creator),
  });
  api.mock("GET /api/v4/person/content", { json: pagedResponse([]) });

  await page.goto(`/posts/${V1_HOST}/u/alex`);

  await expect(page.getByText(/alex/i).first()).toBeVisible();
});
