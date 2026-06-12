import { expect, type Page } from "@playwright/test";

// Feeds are virtualized (virtua), so off-screen items aren't in the DOM:
// scroll the real scroll container and wait for the target to appear.
export async function scrollFeedUntilVisible(page: Page, text: string) {
  await expect(async () => {
    await page.evaluate(() => {
      const scroller = document.querySelector(".ion-content-scroll-host");
      scroller?.scrollTo({ top: scroller.scrollHeight });
    });
    await expect(page.getByText(text, { exact: true })).toBeVisible({
      timeout: 1000,
    });
  }).toPass({ timeout: 15_000 });
}
