// Moderation + reporting: reporting posts (preset reason) and comments
// (custom reason), the modqueue, and removing a post as a moderator.

import {
  commentView,
  community,
  fixturePosts,
  me,
  myUserInfo,
  NOW,
  pagedResponse,
  V1_HOST,
} from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";

test.use({ loggedIn: true });

const POST_URL = `/posts/${V1_HOST}/c/test_comm/comments/${fixturePosts[0]!.post.id}`;

// Raw v1 PostReportView (postView fields + report extras)
function postReportView(reason: string) {
  return {
    ...fixturePosts[0]!,
    post_creator: me,
    post_report: {
      id: 1,
      creator_id: me.id,
      post_id: fixturePosts[0]!.post.id,
      original_post_name: fixturePosts[0]!.post.name,
      original_post_url: undefined,
      original_post_body: undefined,
      reason,
      resolved: false,
      resolver_id: undefined,
      published_at: NOW,
      updated_at: undefined,
      violates_instance_rules: false,
    },
  };
}

// GET /account override making `me` a moderator of the fixture community
function asModerator(api: MockApi) {
  api.mock("GET /api/v4/account", {
    json: {
      ...myUserInfo(me),
      moderates: [{ community: community(), moderator: me }],
    },
  });
}

function mockThread(api: MockApi) {
  api.mock("GET /api/v4/post", { json: { post_view: fixturePosts[0] } });
  api.mock("GET /api/v4/comment/list", {
    json: pagedResponse([
      commentView({ id: 10, content: "reportable comment", creator: me }),
    ]),
  });
}

test("v1: reporting a post with a preset reason", async ({ api, page }) => {
  mockThread(api);
  api.mock("POST /api/v4/post/report", {
    json: { post_report_view: postReportView("Breaks Community Rules") },
  });

  await page.goto(POST_URL);
  await expect(page.getByText("reportable comment")).toBeVisible();

  await page.locator('ion-buttons[slot="end"] ion-button').last().click();
  await page.getByRole("button", { name: "Report", exact: true }).click();
  await page
    .getByRole("button", { name: "Breaks Community Rules", exact: true })
    .click();

  const call = await api.waitForCall("POST /api/v4/post/report");
  expect(call.body).toEqual({
    post_id: 1,
    reason: "Breaks Community Rules",
  });

  await expect(page.getByText("Post reported!")).toBeVisible();
});

test("v1: reporting a comment with a custom reason", async ({ api, page }) => {
  mockThread(api);
  api.mock("POST /api/v4/comment/report", { json: {} });

  await page.goto(POST_URL);
  await expect(page.getByText("reportable comment")).toBeVisible();

  await page.locator(".comment-10 ion-icon[class*='icon']").last().click();
  await page.getByRole("button", { name: "Report", exact: true }).click();
  await page
    .getByRole("button", { name: "Custom Response", exact: true })
    .click();

  await page
    .getByPlaceholder("Custom report details")
    .fill("my custom report reason");
  await page.getByRole("button", { name: "OK" }).click();

  const call = await api.waitForCall("POST /api/v4/comment/report");
  expect(call.body).toEqual({
    comment_id: 10,
    reason: "my custom report reason",
  });

  await expect(page.getByText("Comment reported!")).toBeVisible();
});

test("v1: modqueue lists open reports", async ({ api, page }) => {
  asModerator(api);
  api.mock("GET /api/v4/report/list", {
    json: pagedResponse([
      { type_: "post", ...postReportView("Reported for testing") },
    ]),
  });

  await page.goto(`/posts/${V1_HOST}/mod/modqueue`);

  await expect(page.getByText(fixturePosts[0]!.post.name)).toBeVisible();
  await expect(page.getByText("1 Report")).toBeVisible();
});

test("v1: moderator can remove a post", async ({ api, page }) => {
  asModerator(api);
  mockThread(api);
  api.mock("POST /api/v4/post/remove", () => {
    const removed = structuredClone(fixturePosts[0]!);
    removed.post.removed = true;
    return { json: { post_view: removed } };
  });

  await page.goto(POST_URL);
  await expect(page.getByText("reportable comment")).toBeVisible();

  // Header end buttons (as mod): [shield] [comment sort] [post ellipsis]
  await page.locator('ion-buttons[slot="end"] ion-button').first().click();
  await page.getByRole("button", { name: "Remove", exact: true }).click();

  const call = await api.waitForCall("POST /api/v4/post/remove");
  expect(call.body).toMatchObject({ post_id: 1, removed: true });

  await expect(page.getByText("Post removed!")).toBeVisible();
});
