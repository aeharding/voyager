// Broad v1 smoke tests covering: post detail + comments, community page,
// and user profile. These hit a wider surface than the focused specs so we
// catch shape mismatches between the v1 wire format and threadiverse's
// public types.

import {
  commentView,
  communityResponse,
  fixturePosts,
  pagedResponse,
  personResponse,
  V1_HOST,
} from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";

function mockExtras(api: MockApi) {
  api.mock("GET /api/v4/post", { json: { post_view: fixturePosts[0] } });
  api.mock("GET /api/v4/comment/list", {
    json: pagedResponse([
      commentView({ id: 5001, content: "A v1 comment body" }),
    ]),
  });
  api.mock("GET /api/v4/community", { json: communityResponse() });
  api.mock("GET /api/v4/person", {
    json: personResponse(fixturePosts[0]!.creator),
  });
  api.mock("GET /api/v4/person/content", { json: pagedResponse([]) });
}

test("v1: post detail page renders post + comments", async ({ api, page }) => {
  mockExtras(api);

  await page.goto(
    `/posts/${V1_HOST}/c/test_comm/comments/${fixturePosts[0]!.post.id}`,
  );

  await expect(
    page.getByText(fixturePosts[0]!.post.name).first(),
  ).toBeVisible();
  await expect(page.getByText("A v1 comment body").first()).toBeVisible();
});

test("v1: community page loads with posts", async ({ api, page }) => {
  mockExtras(api);

  await page.goto(`/posts/${V1_HOST}/c/test_comm`);

  // Verify the community feed renders by checking for posts in it.
  await expect(
    page.getByText(fixturePosts[0]!.post.name).first(),
  ).toBeVisible();
});

test("v1: user profile loads from handle", async ({ api, page }) => {
  mockExtras(api);

  await page.goto(`/posts/${V1_HOST}/u/alex`);

  await expect(page.getByText(/alex/i).first()).toBeVisible();
});
