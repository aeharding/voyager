// Comment thread interactions: nested rendering + collapse/expand, comment
// sort switching, voting/saving via the comment action sheet, and fetching
// missing children ("N more replies") for deep threads.

import type { Page } from "@playwright/test";

import {
  commentView,
  fixturePosts,
  me,
  pagedResponse,
  person,
  V1_HOST,
} from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";

const other = person({ id: 200, name: "otheruser" });

const parentComment = commentView({
  id: 10,
  content: "parent comment",
  creator: other,
  path: "0.10",
  child_count: 1,
});
const childComment = commentView({
  id: 11,
  content: "child comment",
  creator: me,
  path: "0.10.11",
});

const POST_URL = `/posts/${V1_HOST}/c/test_comm/comments/${fixturePosts[0]!.post.id}`;

function mockThread(api: MockApi) {
  api.mock("GET /api/v4/post", { json: { post_view: fixturePosts[0] } });
  api.mock("GET /api/v4/comment/list", {
    json: pagedResponse([parentComment, childComment]),
  });
}

// The ellipsis is the last header icon of a comment
function commentEllipsis(page: Page, commentId: number) {
  return page.locator(`.comment-${commentId} ion-icon[class*='icon']`).last();
}

test("v1: nested comments render and collapse on tap", async ({
  api,
  page,
}) => {
  mockThread(api);

  await page.goto(POST_URL);

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

test("v1: changing comment sort refetches the thread", async ({
  api,
  page,
}) => {
  mockThread(api);

  await page.goto(POST_URL);
  await expect(page.getByText("parent comment")).toBeVisible();

  // Header end buttons: [comment sort] [post ellipsis]
  await page.locator('ion-buttons[slot="end"] ion-button').first().click();
  await page.getByRole("button", { name: "New", exact: true }).click();

  const call = await api.waitForCall(
    "GET /api/v4/comment/list",
    (call) => call.query.get("sort") === "new",
  );
  expect(call.query.get("sort")).toBe("new");
});

test.describe("logged in", () => {
  test.use({ loggedIn: true });

  test("v1: upvote comment from action sheet", async ({ api, page }) => {
    mockThread(api);
    api.mock("POST /api/v4/comment/like", () => {
      const liked = structuredClone(parentComment);
      Object.assign(liked.comment, { score: 2, upvotes: 2 });
      return { json: { comment_view: liked } };
    });

    await page.goto(POST_URL);
    await expect(page.getByText("parent comment")).toBeVisible();

    await commentEllipsis(page, 10).click();
    await page.getByRole("button", { name: "Upvote", exact: true }).click();

    const call = await api.waitForCall("POST /api/v4/comment/like");
    expect(call.body).toEqual({ comment_id: 10, is_upvote: true });
  });

  test("v1: save comment from action sheet", async ({ api, page }) => {
    mockThread(api);
    api.mock("PUT /api/v4/comment/save", () => {
      const saved = structuredClone(parentComment);
      Object.assign(saved, { comment_actions: { saved_at: "2026-05-21" } });
      return { json: { comment_view: saved } };
    });

    await page.goto(POST_URL);
    await expect(page.getByText("parent comment")).toBeVisible();

    await commentEllipsis(page, 10).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();

    const call = await api.waitForCall("PUT /api/v4/comment/save");
    expect(call.body).toEqual({ comment_id: 10, save: true });
  });
});

test("v1: missing children fetch on 'more replies' tap", async ({
  api,
  page,
}) => {
  const deepChild = commentView({
    id: 12,
    content: "deep child comment",
    creator: me,
    path: "0.10.12",
  });

  api.mock("GET /api/v4/post", { json: { post_view: fixturePosts[0] } });
  api.mock("GET /api/v4/comment/list", (call) =>
    call.query.get("parent_id") === "10"
      ? { json: pagedResponse([deepChild]) }
      : { json: pagedResponse([parentComment]) },
  );

  await page.goto(POST_URL);

  await expect(page.getByText("parent comment")).toBeVisible();
  await page.getByText("1 more reply").click();

  await expect(page.getByText("deep child comment")).toBeVisible();

  const call = await api.waitForCall(
    "GET /api/v4/comment/list",
    (call) => call.query.get("parent_id") === "10",
  );
  expect(call.query.get("parent_id")).toBe("10");
});
