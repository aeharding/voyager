// Comment thread interactions: nested rendering + collapse/expand, comment
// sort switching, voting/saving via the comment action sheet, and fetching
// missing children ("N more replies") for deep threads.
//
// Stays lemmyv1-only: sort payloads are mode-specific ("new" here vs
// piefed's "New"), and the more-replies response is a wire-level v1 payload
// (the fakes have no max_depth model). Vote/save are now seed-derived.

import type { Page } from "@playwright/test";

import { build, fixturePosts, me, V1_HOST } from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";
import { actionSheetButton } from "../fixtures/ui";

const other = { id: 200, name: "otheruser" };

const POST_URL = `/posts/${V1_HOST}/c/test_comm/comments/${fixturePosts[0]!.id}`;

function seedThread(api: MockApi) {
  api.seed.comment({
    id: 10,
    content: "parent comment",
    creator: api.seed.person(other),
    path: "0.10",
    childCount: 1,
  });
  api.seed.comment({
    id: 11,
    content: "child comment",
    creator: api.me,
    path: "0.10.11",
  });
}

const wireMe = build.person({
  id: me.id,
  name: me.name,
  display_name: me.displayName,
});

// Wire view of the seeded parent comment, for custom write-response payloads
function wireParentComment() {
  return build.commentView({
    id: 10,
    content: "parent comment",
    creator: build.person(other),
    path: "0.10",
    child_count: 1,
    post: build.postView({ ...fixturePosts[0]!, creator: wireMe }),
  });
}

function commentEllipsis(page: Page, commentId: number) {
  return page
    .locator(`.comment-${commentId}`)
    .first()
    .getByRole("button", { name: "Open comment options" });
}

test("v1: nested comments render and collapse on tap", async ({
  api,
  page,
}) => {
  seedThread(api);

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
  seedThread(api);

  await page.goto(POST_URL);
  await expect(page.getByText("parent comment")).toBeVisible();

  await page.getByRole("button", { name: "Change sort" }).click();
  await page.getByRole("button", { name: "New", exact: true }).click();

  const payload = await api.waitForPayload(
    "getComments",
    (payload) => payload.sort === "new",
  );
  expect(payload.sort).toBe("new");
});

test.describe("logged in", () => {
  test.use({ loggedIn: true });

  test("v1: upvote comment from action sheet", async ({ api, page }) => {
    seedThread(api);

    await page.goto(POST_URL);
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

  test("v1: save comment from action sheet", async ({ api, page }) => {
    seedThread(api);

    await page.goto(POST_URL);
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

test("v1: missing children fetch on 'more replies' tap", async ({
  api,
  page,
}) => {
  // TODO(seed): the derived comment list honors parent_id but not max_depth,
  // so seeding the deep child would surface it in the *initial* load too —
  // `missing` would compute to 0 and hide the "more replies" affordance
  // under test. Response side stays wire-level until seeds model depth.
  const deepChild = build.commentView({
    id: 12,
    content: "deep child comment",
    creator: wireMe,
    path: "0.10.12",
    post: build.postView({ ...fixturePosts[0]!, creator: wireMe }),
  });

  api.on.getComments((call) =>
    call.query.get("parent_id") === "10"
      ? { json: build.pagedResponse([deepChild]) }
      : { json: build.pagedResponse([wireParentComment()]) },
  );

  await page.goto(POST_URL);

  await expect(page.getByText("parent comment")).toBeVisible();
  await page.getByText("1 more reply").click();

  await expect(page.getByText("deep child comment")).toBeVisible();

  const payload = await api.waitForPayload(
    "getComments",
    (payload) => payload.parent_id === 10,
  );
  expect(payload.parent_id).toBe(10);
});
