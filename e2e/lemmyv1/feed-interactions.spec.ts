// Local-only post hiding: persisted client-side (Dexie) and never sent to
// the server.
//
// Stays lemmyv1-only: hiding isn't a threadiverse operation, so "nothing was
// sent" can only be asserted against a concrete v1 route. (Pagination, sort,
// listing type, mark-read-on-open and load-failure recovery are now
// provider-agnostic — see e2e/matrix/feed-interactions.spec.ts.)

import { V1_HOST } from "../fixtures/builders";
import { readDbRows } from "../fixtures/db";
import { expect, test } from "../fixtures/test";

test.use({ loggedIn: true });

test("v1: hiding a post is local-only and removes it from the feed", async ({
  api,
  page,
}) => {
  await page.goto(`/posts/${V1_HOST}/all`);

  const item = page.locator("ion-item", { hasText: "First v1 post" }).first();
  await item.getByRole("button", { name: "More options" }).click();
  await page.getByRole("button", { name: "Hide", exact: true }).click();

  await expect(
    page.locator("ion-item", { hasText: "First v1 post" }),
  ).toHaveCount(0);
  await expect(page.getByText("Second v1 post")).toBeVisible();

  // Hiding is persisted client-side (Dexie), not sent to the server
  await expect
    .poll(async () => {
      const rows = await readDbRows<{ post_id: number; hidden: number }>(
        page,
        "postMetadatas",
      );
      return rows.find((row) => row.post_id === 1)?.hidden;
    })
    .toBeTruthy();
  expect(api.calls("POST /api/v4/post/hide")).toHaveLength(0);
});
