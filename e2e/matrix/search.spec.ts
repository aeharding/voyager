// Search: posts and communities lookups derived from the seeded content,
// plus the empty state. (The random-community jump stays provider-specific —
// see e2e/lemmyv1/search.spec.ts.)

import { fixturePosts } from "../fixtures/builders";
import { expect, test } from "./fixtures";

// The search tab operates on the connected instance, so log into the fake
// host (logged out it would hit the unmocked default instance)
test.use({ loggedIn: true });

test("searching posts renders results", async ({ api, page }) => {
  await page.goto("/search");
  await page.getByRole("searchbox").fill("v1");
  await page.getByText("Posts with “v1”").click();

  for (const post of fixturePosts) {
    await expect(page.getByText(post.name).first()).toBeVisible();
  }

  const payload = await api.waitForPayload("search");
  expect(payload.search_term).toBe("v1");
  expect(payload.type_).toBe("posts");
});

test("searching communities renders results", async ({ api, page }) => {
  await page.goto("/search");
  await page.getByRole("searchbox").fill("test");
  await page.getByText("Communities with “test”").click();

  // Community results render name + subscriber count
  await expect(page.getByText("test_comm").first()).toBeVisible();
  await expect(page.getByText("1 Subscriber")).toBeVisible();

  const payload = await api.waitForPayload("search");
  expect(payload.type_).toBe("communities");
});

test("empty search results show the empty state", async ({ page }) => {
  await page.goto("/search");
  await page.getByRole("searchbox").fill("zilch");
  await page.getByText("Posts with “zilch”").click();

  await expect(page.getByText(/Nothing to see here/)).toBeVisible();
});
