// Community actions: subscribe/unsubscribe (server), favorite (local-only),
// and blocking.

import type { Page } from "@playwright/test";

import {
  community,
  communityResponse,
  NOW,
  V1_HOST,
} from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";

test.use({ loggedIn: true });

const COMMUNITY_URL = `/posts/${V1_HOST}/c/test_comm`;

// The header ellipsis stays disabled until the community loads
async function openCommunityActions(
  page: Page,
  api: MockApi,
  view: unknown = communityResponse().community_view,
) {
  api.mock("GET /api/v4/community", {
    json: { ...communityResponse(), community_view: view },
  });

  await page.goto(COMMUNITY_URL);
  await expect(page.getByText("First v1 post")).toBeVisible();

  // Community header end buttons: [sort] [ellipsis]
  await page.locator('ion-buttons[slot="end"] ion-button').last().click();
}

function subscribedCommunityView() {
  return {
    community: community(),
    community_actions: { follow_state: "accepted", followed_at: NOW },
    banned_from_community: false,
  };
}

test("v1: subscribing posts follow and confirms", async ({ api, page }) => {
  api.mock("POST /api/v4/community/follow", {
    json: { community_view: subscribedCommunityView() },
  });

  await openCommunityActions(page, api);
  await page.getByRole("button", { name: "Subscribe", exact: true }).click();

  const call = await api.waitForCall("POST /api/v4/community/follow");
  expect(call.body).toEqual({ community_id: 111, follow: true });

  await expect(page.getByText("Subscribed!")).toBeVisible();
});

test("v1: unsubscribing posts unfollow", async ({ api, page }) => {
  api.mock("POST /api/v4/community/follow", {
    json: { community_view: communityResponse().community_view },
  });

  // Already subscribed
  await openCommunityActions(page, api, subscribedCommunityView());
  await page.getByRole("button", { name: "Unsubscribe", exact: true }).click();

  const call = await api.waitForCall("POST /api/v4/community/follow");
  expect(call.body).toEqual({ community_id: 111, follow: false });

  await expect(page.getByText("Unsubscribed!")).toBeVisible();
});

test("v1: favoriting is local-only", async ({ api, page }) => {
  await openCommunityActions(page, api);
  await page.getByRole("button", { name: "Favorite", exact: true }).click();

  // Reflected in the action sheet on reopen...
  await page.locator('ion-buttons[slot="end"] ion-button').last().click();
  await expect(
    page.getByRole("button", { name: "Unfavorite", exact: true }),
  ).toBeVisible();

  // ...without any community API traffic
  expect(api.calls("POST /api/v4/community/follow")).toHaveLength(0);
});

test("v1: blocking a community posts block", async ({ api, page }) => {
  api.mock("POST /api/v4/account/block/community", {
    json: {
      community_view: communityResponse().community_view,
      blocked: true,
    },
  });

  await openCommunityActions(page, api);
  await page
    .getByRole("button", { name: "Block Community", exact: true })
    .click();

  const call = await api.waitForCall("POST /api/v4/account/block/community");
  expect(call.body).toEqual({ community_id: 111, block: true });

  await expect(page.getByText("Community blocked!")).toBeVisible();
});
