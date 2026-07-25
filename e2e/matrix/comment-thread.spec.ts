// Comment thread interactions: nested rendering + collapse/expand, comment
// sort switching, voting/saving via the comment action sheet, and fetching
// missing children ("N more replies") for deep threads.

import type { Page } from "@playwright/test";

import { fixturePosts } from "../fixtures/builders";
import { actionSheetButton } from "../fixtures/ui";
import {
  expect,
  INITIAL_COMMENT_DEPTH,
  type MatrixApi,
  seedCommentChain,
  test,
} from "./fixtures";

const other = { id: 200, name: "otheruser" };

function postUrl(api: MatrixApi) {
  return `/posts/${api.host}/c/test_comm/comments/${fixturePosts[0]!.id}`;
}

function seedThread(api: MatrixApi) {
  api.seed.comment({
    content: "parent comment",
    creator: api.seed.person(other),
    id: 10,
    path: "0.10",
  });
  api.seed.comment({
    content: "child comment",
    creator: api.me,
    id: 11,
    path: "0.10.11",
  });
}

function commentEllipsis(page: Page, commentId: number) {
  return page
    .locator(`.comment-${commentId}`)
    .first()
    .getByRole("button", { name: "Open comment options" });
}

test("nested comments render and collapse on tap", async ({ api, page }) => {
  seedThread(api);

  await page.goto(postUrl(api));

  await expect(page.getByText("parent comment")).toBeVisible();
  await expect(page.getByText("child comment")).toBeVisible();

  // Tapping the parent collapses the subtree...
  await page.getByText("parent comment").click();
  await expect(page.getByText("parent comment")).not.toBeVisible();
  await expect(page.getByText("child comment")).not.toBeVisible();

  // ...and tapping again expands it
  await page.locator(".comment-10").first().click();
  await expect(page.getByText("parent comment")).toBeVisible();
  await expect(page.getByText("child comment")).toBeVisible();
});

test("changing comment sort refetches the thread", async ({ api, page }) => {
  seedThread(api);

  await page.goto(postUrl(api));
  await expect(page.getByText("parent comment")).toBeVisible();

  await page.getByRole("button", { name: "Change sort" }).click();
  await page.getByRole("button", { name: "New", exact: true }).click();

  const payload = await api.waitForPayload(
    "getComments",
    (payload) => payload.sort === api.sorts.New,
  );
  expect(payload.sort).toBe(api.sorts.New);
});

test.describe("logged in", () => {
  test.use({ loggedIn: true });

  test("upvote comment from action sheet", async ({ api, page }) => {
    seedThread(api);

    await page.goto(postUrl(api));
    await expect(page.getByText("parent comment")).toBeVisible();

    await commentEllipsis(page, 10).click();
    await actionSheetButton(page, "Upvote").click();

    const payload = await api.waitForPayload("likeComment");
    expect(payload).toEqual({ comment_id: 10, is_upvote: true });

    // The fake derives the vote; the comment reflects the new score (1 → 2)
    await expect(
      page.locator(".comment-10").first().getByText("2", { exact: true }),
    ).toBeVisible();
  });

  test("save comment from action sheet", async ({ api, page }) => {
    seedThread(api);

    await page.goto(postUrl(api));
    await expect(page.getByText("parent comment")).toBeVisible();

    await commentEllipsis(page, 10).click();
    await actionSheetButton(page, "Save").click();

    const payload = await api.waitForPayload("saveComment");
    expect(payload).toEqual({ comment_id: 10, save: true });

    // The fake derives the saved state; reopening the sheet now offers Unsave
    await commentEllipsis(page, 10).click();
    await expect(actionSheetButton(page, "Unsave")).toBeVisible();
  });
});

test("missing children fetch on 'more replies' tap", async ({
  api,
  page,
  provider,
}) => {
  // The seeded reply has to sit one level past what the *initial* comment
  // load reaches, so it stays missing (but counted, via child_count) until
  // the expander fetches it. That cut is provider-specific — see
  // INITIAL_COMMENT_DEPTH.
  const chain = seedCommentChain(api, INITIAL_COMMENT_DEPTH[provider]);
  const deepest = chain.at(-1)!;

  api.seed.comment({
    content: "deep child comment",
    id: 21,
    path: `${deepest.path}.21`,
  });

  await page.goto(postUrl(api));

  // The chain loads down to the cut, the reply below it doesn't
  await expect(page.getByText("comment 1", { exact: true })).toBeVisible();
  await expect(page.getByText(deepest.content, { exact: true })).toBeVisible();
  await expect(page.getByText("deep child comment")).toHaveCount(0);

  await page.getByText("1 more reply").click();

  await expect(page.getByText("deep child comment")).toBeVisible();

  const payload = await api.waitForPayload(
    "getComments",
    (payload) => payload.parent_id === deepest.id,
  );
  expect(payload.parent_id).toBe(deepest.id);
});
