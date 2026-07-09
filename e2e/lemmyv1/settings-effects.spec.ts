// Provider-specific settings effects that can't run on the shared matrix:
// - blocking a user hits a v1-only wire route (POST /account/block/person;
//   blockPerson isn't a canonical threadiverse operation).
// - disabling infinite scroll needs cursor pagination, which the derived
//   seed feed doesn't model — page *responses* stay wire-level.
// Client-side settings effects (post size, keyword/website filters) moved to
// e2e/matrix/settings-effects.spec.ts.

import { build, me, V1_HOST } from "../fixtures/builders";
import { getSetting } from "../fixtures/db";
import { scrollFeedUntilVisible } from "../fixtures/scroll";
import { expect, test } from "../fixtures/test";

test.use({ loggedIn: true });

const wireMe = build.person({
  id: me.id,
  name: me.name,
  display_name: me.displayName,
});

test("v1: blocking a user from their profile", async ({ api, page }) => {
  api.seed.person({ id: 200, name: "otheruser" });
  api.mock("POST /api/v4/account/block/person", {
    json: {
      person_view: build.personResponse(
        build.person({ id: 200, name: "otheruser" }),
      ).person_view,
      blocked: true,
    },
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
  // fetches page 2 on its own regardless of the setting.
  // TODO(seed): the derived post list has no cursor pagination — page
  // *response* shapes stay wire-level (request assertions are canonical)
  api.on.getPosts((call) =>
    call.query.get("page_cursor") === "cursor-2"
      ? {
          json: build.pagedResponse([
            build.postView({ id: 99, name: "Page two post", creator: wireMe }),
          ]),
        }
      : {
          json: build.pagedResponse(
            Array.from({ length: 30 }, (_, i) =>
              build.postView({
                id: i + 1,
                name: `Feed post ${i + 1}`,
                creator: wireMe,
              }),
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

  expect(api.callsTo("getPosts").at(-1)!.page_cursor).toBe("cursor-2");
});
