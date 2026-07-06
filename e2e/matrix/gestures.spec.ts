// Swipe gestures, driven via mouse drag (SlidingItem also listens to
// onMouseDown). Best-effort: gesture simulation is only reliable on desktop
// chromium, so other projects skip. Provider-agnostic: the swipe drives a
// vote the fake derives, identically on either backend.

import type { Locator, Page } from "@playwright/test";

import { getSetting } from "../fixtures/db";
import { expect, test } from "./fixtures";

test.use({ loggedIn: true });

test.skip(
  ({ browserName, isMobile }) => browserName !== "chromium" || !!isMobile,
  "gesture simulation is only reliable on desktop chromium",
);

async function swipeRight(page: Page, item: Locator) {
  const box = await item.boundingBox();
  if (!box) throw new Error("item has no bounding box");

  const y = box.y + box.height / 2;
  const startX = box.x + 40;

  await page.mouse.move(startX, y);
  await page.mouse.down();
  // Drag until just past FIRST_ACTION_RATIO (1.75 would select the far
  // action instead). Ionic's drag events are rAF-driven, so the steps need
  // real time between them or the active action never registers.
  for (let i = 1; i <= 40; i++) {
    await page.mouse.move(startX + i * 25, y);
    await page.waitForTimeout(40);

    const ratio = await item.evaluate((el) =>
      (el as HTMLIonItemSlidingElement).getSlidingRatio(),
    );
    if (Math.abs(ratio) >= 1.2) break;
  }
  // Let React commit the active-action state before releasing
  await page.waitForTimeout(200);
  await page.mouse.up();
}

test("swiping a post right upvotes it", async ({ api, page }) => {
  await page.goto(`/posts/${api.host}/all`);

  const item = page.locator("ion-item-sliding", {
    hasText: "First v1 post",
  });
  await swipeRight(page, item);

  const payload = await api.waitForPayload("likePost");
  expect(payload).toEqual({ post_id: 1, is_upvote: true });

  // The fake derives the vote; the feed reflects the new score (base 1 → 2)
  await expect(item.getByText("2", { exact: true })).toBeVisible();
});

test("disabling left swipes turns the gesture off", async ({ api, page }) => {
  await page.goto("/settings/gestures");

  const toggle = page.locator("ion-toggle", {
    hasText: "Disable Left Swipes",
  });
  await toggle.click();
  await expect(toggle).toHaveJSProperty("checked", true);
  await expect.poll(() => getSetting(page, "disable_left_swipes")).toBe(true);

  await page.goto(`/posts/${api.host}/all`);
  await expect(page.getByText("First v1 post")).toBeVisible();

  const item = page.locator("ion-item-sliding", {
    hasText: "First v1 post",
  });
  await swipeRight(page, item);

  // Give a would-be vote time to fire, then confirm nothing was sent
  await page.waitForTimeout(1000);
  expect(api.callsTo("likePost")).toHaveLength(0);
});
