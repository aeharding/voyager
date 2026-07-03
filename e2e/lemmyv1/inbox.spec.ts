// Inbox: unread badge, unified unread list (replies/mentions/messages),
// marking single items and everything read, conversations + sending a
// private message, and boxes navigation.

import { build, me, V1_HOST } from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";

test.use({ loggedIn: true });

const other = { id: 200, name: "otheruser" };

// A reply (id 301), a mention (id 302), and a private message — all unread.
// The fake derives the unified list, the type_/unread_only filters, and the
// unread count from these.
function seedNotifications(api: MockApi) {
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
}

test("v1: tab badge shows unread count", async ({ api, page }) => {
  seedNotifications(api);

  await page.goto(`/posts/${V1_HOST}/all`);

  // The badge is part of the tab's accessible name
  await expect(page.getByRole("tab", { name: "Inbox 3" })).toBeVisible();
});

test("v1: unread view lists replies, mentions, and messages", async ({
  api,
  page,
}) => {
  seedNotifications(api);

  await page.goto("/inbox/unread");

  await expect(page.getByText("someone replied to you")).toBeVisible();
  await expect(page.getByText("someone mentioned you")).toBeVisible();
  await expect(page.getByText("psst, a private message")).toBeVisible();

  const payload = await api.waitForPayload(
    "getNotifications",
    (payload) => payload.unread_only === true,
  );
  expect(payload.unread_only).toBe(true);
});

test("v1: opening a reply marks the notification read", async ({
  api,
  page,
}) => {
  seedNotifications(api);

  await page.goto("/inbox/unread");
  await page.getByText("someone replied to you").click();

  // v1 drops `kind` on the wire, so the decoded payload is partial
  const payload = await api.waitForPayload("markNotificationAsRead");
  expect(payload).toEqual({ notification_id: 301, read: true });

  // The fake's mark-as-read mutates seed state — the derived unread count
  // reflects it (badge is part of the tab's accessible name)
  await expect(page.getByRole("tab", { name: "Inbox 2" })).toBeVisible();
});

test("v1: mark all as read", async ({ api, page }) => {
  seedNotifications(api);

  await page.goto("/inbox/unread");
  await expect(page.getByText("someone replied to you")).toBeVisible();

  await page.getByRole("button", { name: "Mark all as read" }).click();
  await page.getByRole("button", { name: "Mark All Read" }).click();

  // The fake's mark-all mutates seed state — the refetched derived unread
  // count is 0, so the tab badge clears
  await expect(
    page.getByRole("tab", { name: "Inbox", exact: true }),
  ).toBeVisible();
});

test("v1: conversation renders and sends a private message", async ({
  api,
  page,
}) => {
  seedNotifications(api);
  api.on.createPrivateMessage((call) => ({
    json: {
      private_message_view: build.privateMessageView({
        id: 42,
        content: (call.body as { content: string }).content,
        creator: build.person({
          id: me.id,
          name: me.name,
          display_name: me.displayName,
        }),
        recipient: build.person(other),
      }),
    },
  }));

  // Local users are keyed by bare name (getHandle drops the host)
  await page.goto("/inbox/messages/otheruser");

  await expect(page.getByText("psst, a private message")).toBeVisible();

  await page.getByPlaceholder("Message").fill("hello back!");
  await page.getByRole("button", { name: "Send message" }).click();

  const payload = await api.waitForPayload("createPrivateMessage");
  expect(payload).toEqual({ content: "hello back!", recipient_id: 200 });

  await expect(page.getByText("hello back!")).toBeVisible();
});

test("v1: boxes page navigates to mentions", async ({ api, page }) => {
  seedNotifications(api);

  await page.goto("/inbox");

  await page.getByText("Mentions", { exact: true }).click();

  await expect(page).toHaveURL(/\/inbox\/mentions/);
  await expect(page.getByText("someone mentioned you")).toBeVisible();
});
