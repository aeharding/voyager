// Search: posts and communities lookups (flat v1 /search response shape),
// the empty state, and the random community jump.
//
// Stays lemmyv1-only: there's no seed-derived /search (results are v1 wire
// shapes), and piefed doesn't support getRandomCommunity.

import { build, fixturePosts, me, V1_HOST } from "../fixtures/builders";
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

const wireMe = build.person({
  id: me.id,
  name: me.name,
  display_name: me.displayName,
});

// TODO(seed): no seed-derived /search yet — results stay wire-level
function mockSearch(
  api: MockApi,
  results: Partial<typeof emptySearchResponse>,
) {
  api.on.search({ json: { ...emptySearchResponse, ...results } });
}

test("v1: searching posts renders results", async ({ api, page }) => {
  mockSearch(api, {
    posts: fixturePosts.map((post) =>
      build.postView({ ...post, creator: wireMe }),
    ),
  });

  await page.goto("/search");
  await page.getByRole("searchbox").fill("v1");
  await page.getByText("Posts with “v1”").click();

  await expect(page.getByText("First v1 post")).toBeVisible();

  const payload = await api.waitForPayload("search");
  expect(payload.search_term).toBe("v1");
  expect(payload.type_).toBe("posts");
});

test("v1: searching communities renders results", async ({ api, page }) => {
  mockSearch(api, { communities: [build.communityView()] });

  await page.goto("/search");
  await page.getByRole("searchbox").fill("test");
  await page.getByText("Communities with “test”").click();

  // Community results render name + subscriber count
  await expect(page.getByText("test_comm").first()).toBeVisible();
  await expect(page.getByText("1 Subscriber")).toBeVisible();

  const payload = await api.waitForPayload("search");
  expect(payload.type_).toBe("communities");
});

test("v1: empty search results show the empty state", async ({ api, page }) => {
  mockSearch(api, {});

  await page.goto("/search");
  await page.getByRole("searchbox").fill("zilch");
  await page.getByText("Posts with “zilch”").click();

  await expect(page.getByText(/Nothing to see here/)).toBeVisible();
});

test("v1: random community navigates to a community", async ({ api, page }) => {
  api.on.getRandomCommunity({
    json: { community_view: build.communityView() },
  });
  // The special search menu only renders once trending communities resolve
  api.mock("GET /api/v4/community/list", {
    json: build.pagedResponse([build.communityView()]),
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
