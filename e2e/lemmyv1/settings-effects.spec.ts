// Settings that change app behavior: post size, keyword/website filters
// (client-side hiding), blocking a user, and disabling infinite scroll.
// Pattern: flip the setting through the real UI, wait for the Dexie write,
// then assert the effect on a fresh page load.

import {
  me,
  pagedResponse,
  person,
  personResponse,
  postView,
  V1_HOST,
} from "../fixtures/builders";
import { getSetting } from "../fixtures/db";
import { scrollFeedUntilVisible } from "../fixtures/scroll";
import { expect, test } from "../fixtures/test";

test.use({ loggedIn: true });

test("v1: compact post size hides body previews in the feed", async ({
  page,
}) => {
  await page.goto("/settings/appearance");
  // "Post Size Per Community" also exists — match the exact label
  await page.locator("ion-label", { hasText: /^Post Size$/ }).click();
  await page.getByRole("button", { name: "Compact", exact: true }).click();

  await expect
    .poll(() => getSetting(page, "post_appearance_type"))
    .toBe("compact");

  await page.goto(`/posts/${V1_HOST}/all`);

  await expect(page.getByText("First v1 post")).toBeVisible();
  // Large (default) shows the body preview; compact does not
  await expect(page.getByText("v1 body 1")).not.toBeVisible();
});

test("v1: keyword filter hides matching posts client-side", async ({
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

  await page.goto(`/posts/${V1_HOST}/all`);

  await expect(page.getByText("First v1 post")).toBeVisible();
  await expect(page.getByText("Second v1 post")).not.toBeVisible();
  // Filtering is local — the full page was still requested
  expect(api.calls("GET /api/v4/post/list").length).toBeGreaterThan(0);
});

test("v1: website filter hides posts linking to the domain", async ({
  api,
  page,
}) => {
  api.mock("GET /api/v4/post/list", {
    json: pagedResponse([
      postView({
        id: 70,
        name: "Linked post",
        url: "https://filtered.example/article",
        creator: me,
      }),
      postView({ id: 71, name: "Text post", body: "hi", creator: me }),
    ]),
  });

  await page.goto("/settings/blocks");
  await page.getByText("Add Website").click();
  await page.getByPlaceholder("example.org").fill("filtered.example");
  await page.getByRole("button", { name: "OK" }).click();

  await expect
    .poll(async () => getSetting(page, "filtered_websites"))
    .toEqual(["filtered.example"]);

  await page.goto(`/posts/${V1_HOST}/all`);

  await expect(page.getByText("Text post")).toBeVisible();
  await expect(page.getByText("Linked post")).not.toBeVisible();
});

test("v1: blocking a user from their profile", async ({ api, page }) => {
  const other = person({ id: 200, name: "otheruser" });
  api.mock("GET /api/v4/person", { json: personResponse(other) });
  api.mock("GET /api/v4/person/content", { json: pagedResponse([]) });
  api.mock("POST /api/v4/account/block/person", {
    json: { person_view: personResponse(other).person_view, blocked: true },
  });

  await page.goto(`/posts/${V1_HOST}/u/otheruser`);

  await page.getByRole("button", { name: "More options" }).click();
  await page.getByRole("button", { name: "Block User", exact: true }).click();

  const call = await api.waitForCall("POST /api/v4/account/block/person");
  expect(call.body).toEqual({ person_id: 200, block: true });

  await expect(page.getByText("User blocked!")).toBeVisible();
});

test("v1: disabling infinite scroll shows a load-page button", async ({
  api,
  page,
}) => {
  // Page 1 must exceed the auto-fill threshold (limit / 2) or the feed
  // fetches page 2 on its own regardless of the setting
  api.mock("GET /api/v4/post/list", (call) =>
    call.query.get("page_cursor") === "cursor-2"
      ? {
          json: pagedResponse([
            postView({ id: 99, name: "Page two post", creator: me }),
          ]),
        }
      : {
          json: pagedResponse(
            Array.from({ length: 30 }, (_, i) =>
              postView({ id: i + 1, name: `Feed post ${i + 1}`, creator: me }),
            ),
            "cursor-2",
          ),
        },
  );

  await page.goto("/settings/general");
  const toggle = page.locator("ion-toggle", { hasText: "Infinite Scrolling" });
  await toggle.click();
  await expect(toggle).toHaveJSProperty("checked", false);
  await expect.poll(() => getSetting(page, "infinite_scrolling")).toBe(false);

  await page.goto(`/posts/${V1_HOST}/all`);
  await expect(page.getByText("Feed post 1", { exact: true })).toBeVisible();

  await scrollFeedUntilVisible(page, "Load Page 2");
  await page.getByText("Load Page 2").click();

  await scrollFeedUntilVisible(page, "Page two post");

  const calls = api.calls("GET /api/v4/post/list");
  expect(calls.at(-1)!.query.get("page_cursor")).toBe("cursor-2");
});
