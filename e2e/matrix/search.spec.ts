// Search: query preservation, lookups derived from seeded content,
// and the empty state. (The random-community jump stays provider-specific —
// see e2e/lemmyv1/search.spec.ts.)

import { fixturePosts } from "../fixtures/builders";
import { expect, test } from "./fixtures";

// The search tab operates on the connected instance, so log into the fake
// host (logged out it would hit the unmocked default instance)
test.use({ loggedIn: true });

const queries = ["two words; 100% café /?#+=", "literal %20 %2F %25"];

for (const [type, label] of [
  ["posts", "Posts"],
  ["comments", "Comments"],
  ["communities", "Communities"],
] as const) {
  for (const query of queries) {
    test(`searching ${type} preserves ${JSON.stringify(query)}`, async ({
      api,
      page,
    }) => {
      await page.goto("/search");
      await page.getByRole("searchbox").fill(query);
      await page.getByText(`${label} with “${query}”`, { exact: true }).click();

      const payload = await api.waitForPayload("search");
      expect(payload.search_term).toBe(query);
      expect(payload.type_).toBe(type);
      await expect(
        page.getByText(`“${query}”`, { exact: true }).filter({ visible: true }),
      ).toBeVisible();
    });
  }
}

for (const query of queries) {
  test(`submitting search preserves ${JSON.stringify(query)}`, async ({
    api,
    page,
  }) => {
    await page.goto("/search");
    await page.getByRole("searchbox").fill(query);
    await page.getByRole("searchbox").press("Enter");

    const payload = await api.waitForPayload("search");
    expect(payload.search_term).toBe(query);
    expect(payload.type_).toBe("posts");
    await expect(
      page.getByText(`“${query}”`, { exact: true }).filter({ visible: true }),
    ).toBeVisible();
  });

  for (const action of ["posts", "comments", "submit"] as const) {
    test(`community search via ${action} preserves ${JSON.stringify(query)}`, async ({
      api,
      page,
    }) => {
      await page.goto(`/posts/${api.host}/c/test_comm`);
      await page.locator("ion-content").getByRole("searchbox").click();
      const searchbox = page.locator("ion-toolbar").getByRole("searchbox");
      await searchbox.fill(query);
      if (action === "submit") {
        await searchbox.press("Enter");
      } else {
        await page
          .getByText(`Search ${action} on c/test_comm for “${query}”`, {
            exact: true,
          })
          .click();
      }

      const payload = await api.waitForPayload("search");
      expect(payload.search_term).toBe(query);
      expect(payload.type_).toBe(action === "comments" ? "comments" : "posts");
      // The search decoder omits community_name; both providers send it on the wire.
      const request = api
        .allCalls()
        .find((call) => call.pathname.endsWith("/search"));
      expect(request?.query.get("community_name")).toBe("test_comm");
      await expect(
        page.getByText(`“${query}”`, { exact: true }).filter({ visible: true }),
      ).toBeVisible();
    });
  }
}

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
  expect(payload.search_term).toBe("test");
  expect(payload.type_).toBe("communities");
});

test("empty search results show the empty state", async ({ api, page }) => {
  await page.goto("/search");
  await page.getByRole("searchbox").fill("zilch");
  await page.getByText("Posts with “zilch”").click();

  await expect(page.getByText(/Nothing to see here/)).toBeVisible();

  const payload = await api.waitForPayload("search");
  expect(payload.search_term).toBe("zilch");
  expect(payload.type_).toBe("posts");
});
