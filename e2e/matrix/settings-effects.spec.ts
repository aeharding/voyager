// Settings that change app behavior, client-side and backend-independent:
// post size, keyword/website filters (client-side hiding). Pattern: flip the
// setting through the real UI, wait for the Dexie write, then assert the
// effect on a fresh page load. Runs on every provider — the feed is derived
// from seeded content, the filtering is pure UI/redux.

import { getSetting } from "../fixtures/db";
import { expect, test } from "./fixtures";

test.use({ loggedIn: true });

test("compact post size hides body previews in the feed", async ({
  api,
  page,
}) => {
  await page.goto("/settings/appearance");
  // "Post Size Per Community" also exists — match the exact label
  await page.locator("ion-label", { hasText: /^Post Size$/ }).click();
  await page.getByRole("button", { name: "Compact", exact: true }).click();

  await expect
    .poll(() => getSetting(page, "post_appearance_type"))
    .toBe("compact");

  await page.goto(`/posts/${api.host}/all`);

  await expect(page.getByText("First v1 post")).toBeVisible();
  // Large (default) shows the body preview; compact does not
  await expect(page.getByText("v1 body 1")).not.toBeVisible();
});

test("keyword filter hides matching posts client-side", async ({
  api,
  page,
}) => {
  await page.goto("/settings/blocks");
  await page.getByText("Add Keyword").click();
  await page.getByPlaceholder("Keyword").fill("Second");
  await page.getByRole("button", { name: "OK" }).click();

  await expect
    .poll(async () => getSetting(page, "filtered_keywords"))
    .toEqual(["Second"]);

  await page.goto(`/posts/${api.host}/all`);

  await expect(page.getByText("First v1 post")).toBeVisible();
  await expect(page.getByText("Second v1 post")).not.toBeVisible();
  // Filtering is local — the full page was still requested
  expect(api.callsTo("getPosts").length).toBeGreaterThan(0);
});

test("website filter hides posts linking to the domain", async ({
  api,
  page,
}) => {
  // The feed must be *exactly* these two posts — replace the fixture's
  // default seed (clear() also wipes the logged-in state, so restore it)
  api.seed.clear();
  api.seed.loggedInAs(api.me);
  api.seed.post({
    id: 70,
    name: "Linked post",
    url: "https://filtered.example/article",
    creator: api.me,
  });
  api.seed.post({ id: 71, name: "Text post", body: "hi", creator: api.me });

  await page.goto("/settings/blocks");
  await page.getByText("Add Website").click();
  await page.getByPlaceholder("example.org").fill("filtered.example");
  await page.getByRole("button", { name: "OK" }).click();

  await expect
    .poll(async () => getSetting(page, "filtered_websites"))
    .toEqual(["filtered.example"]);

  await page.goto(`/posts/${api.host}/all`);

  await expect(page.getByText("Text post")).toBeVisible();
  await expect(page.getByText("Linked post")).not.toBeVisible();
});
