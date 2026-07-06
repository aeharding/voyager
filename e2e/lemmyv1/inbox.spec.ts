// v1-only inbox coverage. The provider-agnostic inbox specs (badge, unread
// list, single mark-as-read, mark-all-as-read, boxes navigation) live in
// e2e/matrix/inbox.spec.ts. This stays lemmyv1-only because:
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
