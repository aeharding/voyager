import { V1_HOST } from "../fixtures/builders";
import { expect, test } from "../fixtures/test";

test("v1: modlog renders flat ModlogView entries", async ({ page }) => {
  await page.goto(`/posts/${V1_HOST}/mod/log`);

  // ModlogItem.tsx renders one of these per kind. These titles come
  // from the handlers in src/features/moderation/logs/types/*.
  await expect(page.getByText("Stickied Post").first()).toBeVisible();
  await expect(page.getByText("Banned User").first()).toBeVisible();
  await expect(page.getByText("Removed Comment").first()).toBeVisible();

  // The ban reason came through the flat `modlog.reason` shape
  await expect(page.getByText(/Reason:\s+Spam/i).first()).toBeVisible();
});
