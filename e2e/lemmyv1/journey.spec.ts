// Modlog walk-through against the v1 wire fixtures. Modlog has no seed
// support and PieFed derives no modlog, so this stays provider-specific.
// The rest of the journey (feed list, post detail body/author/comment, user
// profile) is provider-agnostic and covered by e2e/matrix/{post-feed,smoke}.

import { V1_HOST } from "../fixtures/builders";
import { expect, test } from "../fixtures/test";

test("v1: modlog dispatches and renders all three kinds", async ({ page }) => {
  await page.goto(`/posts/${V1_HOST}/mod/log`);

  // Three different modlog kinds, each handled by a different renderer
  await expect(page.getByText("Stickied Post").first()).toBeVisible();
  await expect(page.getByText("Banned User").first()).toBeVisible();
  await expect(page.getByText("Removed Comment").first()).toBeVisible();

  // Verify the ban reason from `modlog.reason` made it through
  await expect(page.getByText(/Spam/i).first()).toBeVisible();
});
