// Moderation + reporting: reporting posts (preset reason) and comments
// (custom reason), the modqueue, and removing a post as a moderator.

import { build, fixturePosts, me, NOW, V1_HOST } from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";

test.use({ loggedIn: true });

const POST_URL = `/posts/${V1_HOST}/c/test_comm/comments/${fixturePosts[0]!.id}`;

const wireMe = build.person({
  id: me.id,
  name: me.name,
  display_name: me.displayName,
});

function wirePost() {
  return build.postView({ ...fixturePosts[0]!, creator: wireMe });
}

// Raw v1 PostReportView (postView fields + report extras)
function postReportView(reason: string) {
  return {
    ...wirePost(),
    post_creator: wireMe,
    post_report: {
      id: 1,
      creator_id: me.id,
      post_id: fixturePosts[0]!.id,
      original_post_name: fixturePosts[0]!.name,
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

// GET /account override making `me` a moderator of the fixture community.
// The seed store can't express moderator status, so this stays wire-level.
function asModerator(api: MockApi) {
  api.mock("GET /api/v4/account", {
    json: {
      ...build.myUserInfo({ person: wireMe }),
      moderates: [{ community: build.community(), moderator: wireMe }],
    },
  });
}

function seedThread(api: MockApi) {
  api.seed.comment({ id: 10, content: "reportable comment", creator: api.me });
}

test("v1: reporting a post with a preset reason", async ({ api, page }) => {
  seedThread(api);
  api.mock("POST /api/v4/post/report", {
    json: { post_report_view: postReportView("Breaks Community Rules") },
  });

  await page.goto(POST_URL);
  await expect(page.getByText("reportable comment")).toBeVisible();

  await page.getByRole("button", { name: "More options" }).click();
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
  seedThread(api);
  api.mock("POST /api/v4/comment/report", { json: {} });

  await page.goto(POST_URL);
  await expect(page.getByText("reportable comment")).toBeVisible();

  await page
    .locator(".comment-10")
    .first()
    .getByRole("button", { name: "Open comment options" })
    .click();
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
    json: build.pagedResponse([
      { type_: "post", ...postReportView("Reported for testing") },
    ]),
  });

  await page.goto(`/posts/${V1_HOST}/mod/modqueue`);

  await expect(page.getByText(fixturePosts[0]!.name)).toBeVisible();
  await expect(page.getByText("1 Report")).toBeVisible();
});

test("v1: moderator can remove a post", async ({ api, page }) => {
  asModerator(api);
  seedThread(api);
  api.mock("POST /api/v4/post/remove", () => {
    const removed = wirePost();
    removed.post.removed = true;
    return { json: { post_view: removed } };
  });

  await page.goto(POST_URL);
  await expect(page.getByText("reportable comment")).toBeVisible();

  await page.getByRole("button", { name: "Moderator actions" }).click();
  await page.getByRole("button", { name: "Remove", exact: true }).click();

  const call = await api.waitForCall("POST /api/v4/post/remove");
  expect(call.body).toMatchObject({ post_id: 1, removed: true });

  await expect(page.getByText("Post removed!")).toBeVisible();
});
