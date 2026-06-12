// Inbox: unread badge, unified unread list (replies/mentions/messages),
// marking single items and everything read, conversations + sending a
// private message, and boxes navigation.

import {
  commentNotification,
  commentView,
  fixturePosts,
  me,
  pagedResponse,
  person,
  personResponse,
  privateMessageNotification,
  privateMessageView,
  V1_HOST,
} from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";

test.use({ loggedIn: true });

const other = person({ id: 200, name: "otheruser" });

const replyNotification = commentNotification({
  id: 301,
  kind: "reply",
  comment: commentView({
    id: 31,
    content: "someone replied to you",
    creator: other,
  }),
});
const mentionNotification = commentNotification({
  id: 302,
  kind: "mention",
  comment: commentView({
    id: 32,
    content: "someone mentioned you",
    creator: other,
  }),
});
const messageNotification = privateMessageNotification({
  id: 303,
  message: privateMessageView({
    id: 41,
    content: "psst, a private message",
    creator: other,
    recipient: me,
  }),
});

// The same endpoint serves the unified inbox and (filtered) the messages sync
function mockNotifications(api: MockApi) {
  api.mock("GET /api/v4/account/notification/list", (call) =>
    call.query.get("type_") === "private_message"
      ? { json: pagedResponse([messageNotification]) }
      : {
          json: pagedResponse([
            replyNotification,
            mentionNotification,
            messageNotification,
          ]),
        },
  );
}

test("v1: tab badge shows unread count", async ({ api, page }) => {
  api.mock("GET /api/v4/account/unread_counts", {
    json: { notification_count: 3 },
  });

  await page.goto(`/posts/${V1_HOST}/all`);

  // The badge is part of the tab's accessible name
  await expect(page.getByRole("tab", { name: "Inbox 3" })).toBeVisible();
});

test("v1: unread view lists replies, mentions, and messages", async ({
  api,
  page,
}) => {
  mockNotifications(api);

  await page.goto("/inbox/unread");

  await expect(page.getByText("someone replied to you")).toBeVisible();
  await expect(page.getByText("someone mentioned you")).toBeVisible();
  await expect(page.getByText("psst, a private message")).toBeVisible();

  const call = await api.waitForCall(
    "GET /api/v4/account/notification/list",
    (call) => call.query.get("unread_only") === "true",
  );
  expect(call.query.get("unread_only")).toBe("true");
});

test("v1: opening a reply marks the notification read", async ({
  api,
  page,
}) => {
  mockNotifications(api);
  api.mock("GET /api/v4/post", { json: { post_view: fixturePosts[0] } });
  api.mock("GET /api/v4/comment/list", {
    json: pagedResponse([replyNotification.data]),
  });
  api.mock("POST /api/v4/account/notification/mark_as_read", {
    json: { success: true },
  });

  await page.goto("/inbox/unread");
  await page.getByText("someone replied to you").click();

  const call = await api.waitForCall(
    "POST /api/v4/account/notification/mark_as_read",
  );
  expect(call.body).toEqual({ notification_id: 301, read: true });
});

test("v1: mark all as read", async ({ api, page }) => {
  mockNotifications(api);
  api.mock("POST /api/v4/account/notification/mark_as_read/all", {
    json: { success: true },
  });

  await page.goto("/inbox/unread");
  await expect(page.getByText("someone replied to you")).toBeVisible();

  // Header checkmark button presents a confirmation sheet
  await page.locator('ion-buttons[slot="end"] ion-button').last().click();
  await page.getByRole("button", { name: "Mark All Read" }).click();

  await api.waitForCall("POST /api/v4/account/notification/mark_as_read/all");
});

test("v1: conversation renders and sends a private message", async ({
  api,
  page,
}) => {
  mockNotifications(api);
  api.mock("GET /api/v4/person", { json: personResponse(other) });
  api.mock("POST /api/v4/private_message", (call) => ({
    json: {
      private_message_view: privateMessageView({
        id: 42,
        content: (call.body as { content: string }).content,
        creator: me,
        recipient: other,
      }),
    },
  }));

  // Local users are keyed by bare name (getHandle drops the host)
  await page.goto("/inbox/messages/otheruser");

  await expect(page.getByText("psst, a private message")).toBeVisible();

  await page.getByPlaceholder("Message").fill("hello back!");
  await page.getByRole("button", { name: "Send message" }).click();

  const call = await api.waitForCall("POST /api/v4/private_message");
  expect(call.body).toEqual({ content: "hello back!", recipient_id: 200 });

  await expect(page.getByText("hello back!")).toBeVisible();
});

test("v1: boxes page navigates to mentions", async ({ api, page }) => {
  mockNotifications(api);

  await page.goto("/inbox");

  await page.getByText("Mentions", { exact: true }).click();

  await expect(page).toHaveURL(/\/inbox\/mentions/);
  await expect(page.getByText("someone mentioned you")).toBeVisible();
});
