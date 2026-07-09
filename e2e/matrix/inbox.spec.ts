// Inbox: unread badge, unified unread list (replies/mentions/messages),
// marking an item read, and boxes navigation. Read state is asserted
// through seed-derived post-conditions (the fakes' mark-as-read writes
// mutate the seed store, so refetched unread counts reflect them) — the
// same spec text runs on both providers.
//
// v1-only inbox coverage (mark-all-as-read, conversations) lives in
// e2e/lemmyv1/inbox.spec.ts.

import type { MatrixApi } from "./fixtures";
import { expect, test } from "./fixtures";

test.use({ loggedIn: true });

const other = { id: 200, name: "otheruser" };

// A reply (id 301), a mention (id 302), and a private message — all unread.
// The fakes derive the notification lists, the unread filters, and the
// unread counts from these.
function seedNotifications(api: MatrixApi) {
  const otherPerson = api.seed.person(other);

  api.seed.reply({
    id: 301,
    comment: api.seed.comment({
      id: 31,
      content: "someone replied to you",
      creator: otherPerson,
    }),
  });
  api.seed.mention({
    id: 302,
    comment: api.seed.comment({
      id: 32,
      content: "someone mentioned you",
      creator: otherPerson,
    }),
  });
  api.seed.privateMessage({
    id: 41,
    content: "psst, a private message",
    creator: otherPerson,
  });

  return { otherPerson };
}

test("tab badge shows unread count", async ({ api, page }) => {
  seedNotifications(api);

  await page.goto(`/posts/${api.host}/all`);

  // The badge is part of the tab's accessible name
  await expect(page.getByRole("tab", { name: "Inbox 3" })).toBeVisible();
});

test("unread view lists replies, mentions, and messages", async ({
  api,
  page,
}) => {
  const { otherPerson } = seedNotifications(api);
  // Already-read notifications must not appear in the unread view
  api.seed.mention({
    id: 303,
    read: true,
    comment: api.seed.comment({
      id: 33,
      content: "an already-read mention",
      creator: otherPerson,
    }),
  });

  await page.goto("/inbox/unread");

  await expect(page.getByText("someone replied to you")).toBeVisible();
  await expect(page.getByText("someone mentioned you")).toBeVisible();
  await expect(page.getByText("psst, a private message")).toBeVisible();
  await expect(page.getByText("an already-read mention")).not.toBeVisible();
});

test("opening a reply marks the notification read", async ({ api, page }) => {
  seedNotifications(api);

  await page.goto("/inbox/unread");
  await page.getByText("someone replied to you").click();

  // The fake's mark-as-read mutates seed state — the refetched derived
  // unread count drops to 2 (badge is part of the tab's accessible name)
  await expect(page.getByRole("tab", { name: "Inbox 2" })).toBeVisible();
});

test("boxes page navigates to mentions", async ({ api, page }) => {
  seedNotifications(api);

  await page.goto("/inbox");

  await page.getByText("Mentions", { exact: true }).click();

  await expect(page).toHaveURL(/\/inbox\/mentions/);
  await expect(page.getByText("someone mentioned you")).toBeVisible();
});

test("mark all as read clears the unread badge", async ({ api, page }) => {
  seedNotifications(api);

  await page.goto("/inbox/unread");
  await expect(page.getByText("someone replied to you")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Inbox 3" })).toBeVisible();

  await page.getByRole("button", { name: "Mark all as read" }).click();
  await page.getByRole("button", { name: "Mark All Read" }).click();

  // The fake's mark-all mutates seed state — the refetched derived unread
  // count is 0, so the tab badge clears
  await expect(
    page.getByRole("tab", { name: "Inbox", exact: true }),
  ).toBeVisible();
});
