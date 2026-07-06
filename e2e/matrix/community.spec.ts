// Community actions that run on every provider: subscribing (followCommunity,
// asserted by canonical payload) and favoriting (local-only, no API traffic).
// The community page and its action sheet are derived from seeded content.
// Provider-specific bits (unsubscribe needs a seeded "already subscribed"
// state; blocking hits a v1-only wire route) stay in e2e/lemmyv1/community.

import { headerButton } from "../fixtures/ui";
import { expect, test } from "./fixtures";

test.use({ loggedIn: true });

test("subscribing posts follow and confirms", async ({ api, page }) => {
  // followCommunity isn't derived; echo a valid provider community response
  // so the write parses. The assertion is on the canonical request payload.
  api.on.followCommunity({ json: api.communityResponse });

  await page.goto(`/posts/${api.host}/c/test_comm`);
  await expect(page.getByText("First v1 post")).toBeVisible();

  await headerButton(page, "More options").click();
  await page.getByRole("button", { name: "Subscribe", exact: true }).click();

  const payload = await api.waitForPayload("followCommunity");
  expect(payload).toEqual({ community_id: 111, follow: true });

  await expect(page.getByText("Subscribed!")).toBeVisible();
});

test("favoriting is local-only", async ({ api, page }) => {
  await page.goto(`/posts/${api.host}/c/test_comm`);
  await expect(page.getByText("First v1 post")).toBeVisible();

  await headerButton(page, "More options").click();
  await page.getByRole("button", { name: "Favorite", exact: true }).click();

  // Reflected in the action sheet on reopen...
  await page.locator('ion-buttons[slot="end"] ion-button').last().click();
  await expect(
    page.getByRole("button", { name: "Unfavorite", exact: true }),
  ).toBeVisible();

  // ...without any community API traffic
  expect(api.callsTo("followCommunity")).toHaveLength(0);
});
