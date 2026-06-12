// Content creation: replying to posts/comments, editing and deleting own
// comments and posts, the opt-in rich markdown editor, and the dirty-composer
// dismiss guard.

import type { Page } from "@playwright/test";

import {
  commentView,
  fixturePosts,
  me,
  pagedResponse,
  postView,
  V1_HOST,
} from "../fixtures/builders";
import { getSetting } from "../fixtures/db";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";

test.use({ loggedIn: true });

const myComment = commentView({
  id: 20,
  content: "my own comment",
  creator: me,
});

const POST_URL = `/posts/${V1_HOST}/c/test_comm/comments/${fixturePosts[0]!.post.id}`;

function mockThread(api: MockApi) {
  api.mock("GET /api/v4/post", { json: { post_view: fixturePosts[0] } });
  api.mock("GET /api/v4/comment/list", {
    json: pagedResponse([myComment]),
  });
}

// Post detail header end buttons: [comment sort] [post ellipsis]
function postEllipsis(page: Page) {
  return page.locator('ion-buttons[slot="end"] ion-button').last();
}

// Post header action bar (its own borderless item below the post):
// [up] [down] [save] [reply] [share]. (The post-ellipsis "Reply"
// intentionally skips the thread update, so use the action bar like a user
// would on the detail page.)
function postReplyButton(page: Page) {
  return page
    .locator("ion-item[class*='borderlessIonItem']")
    .last()
    .locator("button")
    .nth(3);
}

// The ellipsis is the last header icon of a comment
function commentEllipsis(page: Page, commentId: number) {
  return page.locator(`.comment-${commentId} ion-icon[class*='icon']`).last();
}

// The reply/edit composer's submit ("Post" text on iOS, send icon on MD)
function composerSubmit(page: Page) {
  return page
    .locator("ion-modal", { hasText: "Comment" })
    .locator('ion-buttons[slot="end"] ion-button');
}

test("v1: replying to a post submits and renders the comment", async ({
  api,
  page,
}) => {
  mockThread(api);
  api.mock("POST /api/v4/comment", (call) => ({
    json: {
      comment_view: commentView({
        id: 9999,
        content: (call.body as { content: string }).content,
        creator: me,
      }),
    },
  }));

  await page.goto(POST_URL);
  await expect(page.getByText("my own comment")).toBeVisible();

  await postReplyButton(page).click();

  await page.locator("ion-modal textarea").fill("fresh reply");
  await composerSubmit(page).click();

  const call = await api.waitForCall("POST /api/v4/comment");
  expect(call.body).toEqual({ content: "fresh reply", post_id: 1 });

  await expect(page.getByText("fresh reply")).toBeVisible();
});

test("v1: replying to a comment sets parent_id", async ({ api, page }) => {
  mockThread(api);
  api.mock("POST /api/v4/comment", {
    json: {
      comment_view: commentView({
        id: 9999,
        content: "nested reply",
        creator: me,
        path: "0.20.9999",
      }),
    },
  });

  await page.goto(POST_URL);
  await expect(page.getByText("my own comment")).toBeVisible();

  await commentEllipsis(page, 20).click();
  await page.getByRole("button", { name: "Reply", exact: true }).click();

  await page.locator("ion-modal textarea").fill("nested reply");
  await composerSubmit(page).click();

  const call = await api.waitForCall("POST /api/v4/comment");
  expect(call.body).toEqual({
    content: "nested reply",
    post_id: 1,
    parent_id: 20,
  });
});

test("v1: editing own comment sends PUT and updates the thread", async ({
  api,
  page,
}) => {
  mockThread(api);
  api.mock("PUT /api/v4/comment", (call) => ({
    json: {
      comment_view: commentView({
        id: 20,
        content: (call.body as { content: string }).content,
        creator: me,
      }),
    },
  }));

  await page.goto(POST_URL);
  await expect(page.getByText("my own comment")).toBeVisible();

  await commentEllipsis(page, 20).click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();

  await page.locator("ion-modal textarea").fill("edited comment");
  await composerSubmit(page).click();

  const call = await api.waitForCall("PUT /api/v4/comment");
  expect(call.body).toEqual({ comment_id: 20, content: "edited comment" });

  await expect(page.locator(".comment-20").first()).toContainText(
    "edited comment",
  );
});

test("v1: deleting own comment sends DELETE", async ({ api, page }) => {
  mockThread(api);
  api.mock("DELETE /api/v4/comment", () => {
    const deleted = structuredClone(myComment);
    deleted.comment.deleted = true;
    deleted.comment.content = "";
    return { json: { comment_view: deleted } };
  });

  await page.goto(POST_URL);
  await expect(page.getByText("my own comment")).toBeVisible();

  await commentEllipsis(page, 20).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  // Confirmation sheet
  await page.getByRole("button", { name: "Delete Comment" }).click();

  const call = await api.waitForCall("DELETE /api/v4/comment");
  expect((call.body as { comment_id: number }).comment_id).toBe(20);

  await expect(page.getByText("my own comment")).not.toBeVisible();
});

test("v1: creating a text post submits and navigates to it", async ({
  api,
  page,
}) => {
  const createdPost = postView({
    id: 999,
    name: "Fresh new post",
    body: "fresh post body",
    creator: me,
  });
  api.mock("POST /api/v4/post", { json: { post_view: createdPost } });
  api.mock("GET /api/v4/post", { json: { post_view: createdPost } });
  api.mock("GET /api/v4/community", {
    json: {
      community_view: {
        community: fixturePosts[0]!.community,
        community_actions: undefined,
        banned_from_community: false,
      },
      moderators: [],
      site: undefined,
      discussion_languages: [],
    },
  });

  await page.goto(`/posts/${V1_HOST}/c/test_comm`);
  await expect(page.getByText("First v1 post")).toBeVisible();

  // Community header end buttons: [sort] [ellipsis]
  await page.locator('ion-buttons[slot="end"] ion-button').last().click();
  await page.getByRole("button", { name: "Submit Post" }).click();

  const editor = page.locator("ion-modal", { hasText: "Post" }).first();
  await editor.locator("ion-segment-button", { hasText: "Text" }).click();
  await editor.locator('input[placeholder="Title"]').fill("Fresh new post");

  // Body text is a pushed sub-page within the editor modal
  await editor.getByText("Text (optional)").click();
  await editor.locator("textarea").fill("fresh post body");
  await editor.getByRole("button", { name: "Back" }).click();

  await editor.getByRole("button", { name: "Post", exact: true }).click();

  const call = await api.waitForCall("POST /api/v4/post");
  expect(call.body).toMatchObject({
    name: "Fresh new post",
    body: "fresh post body",
    community_id: 111,
  });

  // Creation shows a toast; tapping it navigates to the new post
  await page.getByText("Posted! Tap to view.").click();
  await expect(page).toHaveURL(/\/comments\/999/);
});

test("v1: editing own post sends PUT", async ({ api, page }) => {
  mockThread(api);
  api.mock("PUT /api/v4/post", (call) => {
    const edited = structuredClone(fixturePosts[0]!);
    edited.post.name = (call.body as { name: string }).name;
    return { json: { post_view: edited } };
  });

  await page.goto(POST_URL);
  await expect(page.getByText("my own comment")).toBeVisible();

  await postEllipsis(page).click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();

  const editor = page.locator("ion-modal", { hasText: "Edit Post" });
  await editor.locator('input[placeholder="Title"]').fill("Renamed post");
  await editor.getByRole("button", { name: "Save", exact: true }).click();

  const call = await api.waitForCall("PUT /api/v4/post");
  expect(call.body).toMatchObject({ post_id: 1, name: "Renamed post" });
});

test("v1: deleting own post sends DELETE", async ({ api, page }) => {
  mockThread(api);
  api.mock("DELETE /api/v4/post", () => {
    const deleted = structuredClone(fixturePosts[0]!);
    deleted.post.deleted = true;
    return { json: { post_view: deleted } };
  });

  await page.goto(POST_URL);
  await expect(page.getByText("my own comment")).toBeVisible();

  await postEllipsis(page).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  // Confirmation sheet
  await page.getByRole("button", { name: "Delete Post" }).click();

  const call = await api.waitForCall("DELETE /api/v4/post");
  expect((call.body as { post_id: number }).post_id).toBe(1);
});

test("v1: rich editor (opt-in) still submits plain markdown", async ({
  api,
  page,
}) => {
  mockThread(api);
  api.mock("POST /api/v4/comment", {
    json: {
      comment_view: commentView({
        id: 9999,
        content: "rich editor reply",
        creator: me,
      }),
    },
  });

  // Enable the opt-in rich editor through the real settings UI
  await page.goto("/settings/general");
  const toggle = page.locator("ion-toggle", {
    hasText: "Rich Markdown Editor",
  });
  await toggle.click();
  await expect(toggle).toHaveJSProperty("checked", true);
  await expect.poll(() => getSetting(page, "rich_markdown_editor")).toBe(true);

  await page.goto(POST_URL);
  await expect(page.getByText("my own comment")).toBeVisible();

  await postReplyButton(page).click();

  const richEditor = page.locator('ion-modal [contenteditable="true"]');
  await richEditor.fill("rich editor reply");
  await composerSubmit(page).click();

  const call = await api.waitForCall("POST /api/v4/comment");
  expect(call.body).toEqual({ content: "rich editor reply", post_id: 1 });
});

test("v1: dirty composer requires confirmation to dismiss", async ({
  api,
  page,
}) => {
  mockThread(api);

  await page.goto(POST_URL);
  await expect(page.getByText("my own comment")).toBeVisible();

  await postReplyButton(page).click();

  const composer = page.locator("ion-modal", { hasText: "New Comment" });
  const composerCancel = composer.locator(
    'ion-buttons[slot="start"] ion-button',
  );

  const textarea = page.locator("ion-modal textarea");
  await textarea.fill("not done typing");

  // The presented sheet must be singled out by content: hidden declarative
  // ion-action-sheet elements (e.g. Report's) also exist in the DOM, and a
  // just-dismissed sheet may still be detaching — .last() is the newest.
  const dismissSheet = () =>
    page.locator("ion-action-sheet", { hasText: "Discard" }).last();

  // Attempting to dismiss prompts instead of discarding silently
  await composerCancel.click();
  await expect(
    dismissSheet().getByRole("button", { name: "Discard" }),
  ).toBeVisible();

  // Cancel keeps the draft
  await dismissSheet().getByRole("button", { name: "Cancel" }).click();
  await expect(textarea).toHaveValue("not done typing");

  // Discarding actually closes the composer
  await composerCancel.click();
  await dismissSheet().getByRole("button", { name: "Discard" }).click();
  await expect(textarea).not.toBeVisible();
});
