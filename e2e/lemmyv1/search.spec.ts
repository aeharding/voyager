// The random community jump from the search tab's special menu.
//
// Stays lemmyv1-only: `getRandomCommunity` is unsupported on piefed. (Post
// and community lookups plus the empty state are now provider-agnostic —
// see e2e/matrix/search.spec.ts.)

import { build, V1_HOST } from "../fixtures/builders";
import { expect, test } from "../fixtures/test";

// The search tab operates on the connected instance, so log into the fake
// host (logged out it would hit the unmocked default instance)
test.use({ loggedIn: true });

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
