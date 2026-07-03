// v1-only inbox coverage. The provider-agnostic inbox specs (badge, unread
// list, single mark-as-read, boxes navigation) live in
// e2e/matrix/inbox.spec.ts. These stay lemmyv1-only because:
// - mark-all-as-read: the piefed fake has no derived
//   `POST /api/alpha/user/mark_all_as_read` yet
// - conversations: the send response is a wire-level v1 payload (the fake
//   has no private-message write state — the response is the spec's to
//   define)

import { build, me } from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";

test.use({ loggedIn: true });

const other = { id: 200, name: "otheruser" };

// A reply (id 301), a mention (id 302), and a private message — all unread.
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
