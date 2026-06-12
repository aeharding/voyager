// Search: posts and communities lookups (flat v1 /search response shape),
// the empty state, and the random community jump.

import {
  community,
  communityResponse,
  fixturePosts,
  pagedResponse,
  V1_HOST,
} from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";

// The search tab operates on the connected instance, so log into the fake
// host (logged out it would hit the unmocked default instance)
test.use({ loggedIn: true });

const emptySearchResponse = {
  posts: [] as unknown[],
  comments: [] as unknown[],
  communities: [] as unknown[],
  persons: [] as unknown[],
  next_page: null,
  prev_page: null,
};

function communityView() {
  return {
    community: community(),
    community_actions: undefined,
    banned_from_community: false,
  };
}

function mockSearch(
  api: MockApi,
  results: Partial<typeof emptySearchResponse>,
) {
  api.mock("GET /api/v4/search", {
    json: { ...emptySearchResponse, ...results },
  });
}

test("v1: searching posts renders results", async ({ api, page }) => {
  mockSearch(api, { posts: fixturePosts });

  await page.goto("/search");
  await page.getByRole("searchbox").fill("v1");
  await page.getByText("Posts with “v1”").click();

  await expect(page.getByText("First v1 post")).toBeVisible();

  const call = await api.waitForCall("GET /api/v4/search");
  expect(call.query.get("search_term")).toBe("v1");
  expect(call.query.get("type_")).toBe("posts");
});

test("v1: searching communities renders results", async ({ api, page }) => {
  mockSearch(api, { communities: [communityView()] });

  await page.goto("/search");
  await page.getByRole("searchbox").fill("test");
  await page.getByText("Communities with “test”").click();

  // Community results render name + subscriber count
  await expect(page.getByText("test_comm").first()).toBeVisible();
  await expect(page.getByText("1 Subscriber")).toBeVisible();

  const call = await api.waitForCall("GET /api/v4/search");
  expect(call.query.get("type_")).toBe("communities");
});

test("v1: empty search results show the empty state", async ({ api, page }) => {
  mockSearch(api, {});

  await page.goto("/search");
  await page.getByRole("searchbox").fill("zilch");
  await page.getByText("Posts with “zilch”").click();

  await expect(page.getByText(/Nothing to see here/)).toBeVisible();
});

test("v1: random community navigates to a community", async ({ api, page }) => {
  api.mock("GET /api/v4/community/random", {
    json: { community_view: communityView() },
  });
  api.mock("GET /api/v4/community", { json: communityResponse() });
  // The special search menu only renders once trending communities resolve
  api.mock("GET /api/v4/community/list", {
    json: pagedResponse([communityView()]),
  });

  await page.goto(`/posts/${V1_HOST}/all`);

  await page.getByRole("tab", { name: "Search" }).click();
  await page.getByText("Random Community").click();

  await expect(page).toHaveURL(/\/c\/test_comm/);
  // The posts tab keeps a hidden copy of the feed mounted — filter to the
  // community page's visible one
  await expect(
    page.getByText("First v1 post").filter({ visible: true }),
  ).toBeVisible();
});
