// Community actions that can't run on the shared matrix:
// - unsubscribing needs an "already subscribed" community_actions wire state,
//   which the seed store can't express (subscription state isn't seedable).
// - blocking hits a v1-only wire route (POST /account/block/community;
//   blockCommunity isn't a canonical threadiverse operation).
// Subscribe (followCommunity) and favorite (local-only) moved to
// e2e/matrix/community.spec.ts.

import type { Page } from "@playwright/test";

import { build, NOW, V1_HOST } from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";
import { headerButton } from "../fixtures/ui";

test.use({ loggedIn: true });

const COMMUNITY_URL = `/posts/${V1_HOST}/c/test_comm`;

// The header ellipsis stays disabled until the community loads.
// Subscription state (community_actions) can't be seeded, so the community
// response stays wire-level.
async function openCommunityActions(
  page: Page,
  api: MockApi,
  view: unknown = build.communityResponse().community_view,
) {
  api.on.getCommunity({
    json: { ...build.communityResponse(), community_view: view },
  });

  await page.goto(COMMUNITY_URL);
  await expect(page.getByText("First v1 post")).toBeVisible();

  await headerButton(page, "More options").click();
}

function subscribedCommunityView() {
  return {
    community: build.community(),
    community_actions: { follow_state: "accepted", followed_at: NOW },
    banned_from_community: false,
  };
}

test("v1: unsubscribing posts unfollow", async ({ api, page }) => {
  api.on.followCommunity({
    json: { community_view: build.communityResponse().community_view },
  });

  // Already subscribed
  await openCommunityActions(page, api, subscribedCommunityView());
  await page.getByRole("button", { name: "Unsubscribe", exact: true }).click();

  const payload = await api.waitForPayload("followCommunity");
  expect(payload).toEqual({ community_id: 111, follow: false });

  await expect(page.getByText("Unsubscribed!")).toBeVisible();
});

test("v1: blocking a community posts block", async ({ api, page }) => {
  api.mock("POST /api/v4/account/block/community", {
    json: {
      community_view: build.communityResponse().community_view,
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
