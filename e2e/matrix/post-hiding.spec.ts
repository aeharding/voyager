// Local-only post hiding: persisted client-side (Dexie) and never sent to
// the server.

import { readDbRows } from "../fixtures/db";
import { expect, test } from "./fixtures";

test.use({ loggedIn: true });

test("hiding a post is local-only and removes it from the feed", async ({
  api,
  page,
}) => {
  await page.goto(`/posts/${api.host}/all`);

  const item = page.locator("ion-item", { hasText: "First v1 post" }).first();
  await expect(item).toBeVisible();

  // Hiding must not write to the server. Counting writes rather than all
  // calls keeps an incidental background read from making this flaky,
  // while still failing loudly if hiding ever becomes a request.
  const writes = () =>
    api.allCalls().filter((call) => call.method !== "GET").length;
  const before = writes();

  await item.getByRole("button", { name: "More options" }).click();
  await page.getByRole("button", { name: "Hide", exact: true }).click();

  await expect(
    page.locator("ion-item", { hasText: "First v1 post" }),
  ).toHaveCount(0);
  await expect(page.getByText("Second v1 post")).toBeVisible();

  // Hiding is persisted client-side (Dexie)...
  await expect
    .poll(async () => {
      const rows = await readDbRows<{ hidden: number; post_id: number }>(
        page,
        "postMetadatas",
      );
      return rows.find((row) => row.post_id === 1)?.hidden;
    })
    .toBeTruthy();

  // ...and never written to the server
  expect(writes()).toBe(before);
});
