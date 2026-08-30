import { expect, test } from "./fixtures";

test.skip(
  ({ browserName, isMobile }) => browserName !== "chromium" || !!isMobile,
  "programmatic smooth-scroll regression is exercised in desktop Chromium",
);

test("virtual feed resynchronizes after its page is hidden mid-scroll", async ({
  api,
  page,
}) => {
  for (let index = 4; index <= 50; index++) {
    api.seed.post({
      name: `Momentum post ${index}`,
      body: `Body ${index} `.repeat(100),
    });
  }

  await page.goto(`/posts/${api.host}/all`, { waitUntil: "domcontentloaded" });
  const scroller = page.locator(".virtual-scroller").first();
  await expect(scroller).toBeVisible();
  await expect
    .poll(() => scroller.evaluate((element) => element.scrollHeight))
    .toBeGreaterThan(1_000);

  await scroller.evaluate((element) => element.scrollTo({ top: 100_000 }));
  await expect
    .poll(() => scroller.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(1_000);

  await scroller.evaluate((element) => {
    const events: number[] = [];
    Object.assign(window, { __scrollEvents: events });
    element.addEventListener("scroll", () => events.push(element.scrollTop));
    element.scrollTo({ behavior: "smooth", top: 0 });
  });
  await page.waitForTimeout(100);

  // Ionic hides inactive route stacks with display: none. If that interrupts a
  // smooth scroll, Chromium can restore the DOM offset without another event.
  const feedPage = scroller.locator(
    "xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' ion-page ')][1]",
  );
  await feedPage.evaluate((element) => {
    (element as HTMLElement).style.display = "none";
  });
  await page.waitForTimeout(1_000);
  await feedPage.evaluate((element) => {
    (element as HTMLElement).style.removeProperty("display");
  });
  await page.waitForTimeout(300);

  const state = await scroller.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const rendered = Array.from(element.querySelectorAll(":scope > div > div"));
    const events = (window as typeof window & { __scrollEvents: number[] })
      .__scrollEvents;
    return {
      lastScrollEvent: events.at(-1),
      scrollTop: element.scrollTop,
      visibleCount: rendered.filter((item) => {
        const itemBounds = item.getBoundingClientRect();
        return itemBounds.bottom > bounds.top && itemBounds.top < bounds.bottom;
      }).length,
    };
  });

  expect(state.lastScrollEvent).toBe(0);
  expect(state.scrollTop).toBeGreaterThan(1_000);
  expect(state.visibleCount).toBeGreaterThan(0);
});
