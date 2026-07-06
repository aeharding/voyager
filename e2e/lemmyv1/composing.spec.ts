// Content creation whose assertion depends on the write *response* the fake
// doesn't derive — so each supplies a v1 wire response and can't run on the
// shared matrix: replying renders the returned comment, editing/deleting a
// comment updates the thread from the response, and creating a post navigates
// via the returned id. Payload-only and pure-UI composer behavior (reply
// parent_id, edit/delete post payloads, rich editor, vger.to unwrap, the
// dirty-composer guard) moved to e2e/matrix/composing.spec.ts.

import type { Page } from "@playwright/test";

import { build, fixturePosts, me, V1_HOST } from "../fixtures/builders";
import type { MockApi } from "../fixtures/mocks";
import { expect, test } from "../fixtures/test";
import { actionSheetButton, headerButton } from "../fixtures/ui";

test.use({ loggedIn: true });

const POST_URL = `/posts/${V1_HOST}/c/test_comm/comments/${fixturePosts[0]!.id}`;

function seedThread(api: MockApi) {
  api.seed.comment({ id: 20, content: "my own comment", creator: api.me });
}

// Wire shapes for custom write-response payloads (the fake derives reads
// from seeds, but write responses are the spec's to define)
const wireMe = build.person({
  id: me.id,
  name: me.name,
  display_name: me.displayName,
});

function wirePost() {
  return build.postView({ ...fixturePosts[0]!, creator: wireMe });
}

function wireComment(over: { id: number; content: string; path?: string }) {
  return build.commentView({ ...over, creator: wireMe, post: wirePost() });
}

// The post action bar's reply. (The post-ellipsis "Reply" intentionally
// skips the thread update, so use the action bar like a user would.)
function postReplyButton(page: Page) {
  return page.getByRole("button", { name: "Reply", exact: true });
}

function commentEllipsis(page: Page, commentId: number) {
  return page
    .locator(`.comment-${commentId}`)
    .first()
    .getByRole("button", { name: "Open comment options" });
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
  seedThread(api);
  api.on.createComment((call) => ({
    json: {
      comment_view: wireComment({
        id: 9999,
        content: (call.body as { content: string }).content,
      }),
    },
  }));

  await page.goto(POST_URL);
  await expect(page.getByText("my own comment")).toBeVisible();

  await postReplyButton(page).click();

  await page.locator("ion-modal textarea").fill("fresh reply");
  await composerSubmit(page).click();

  const payload = await api.waitForPayload("createComment");
  expect(payload).toEqual({ content: "fresh reply", post_id: 1 });

  await expect(page.getByText("fresh reply")).toBeVisible();
});

test("v1: editing own comment sends PUT and updates the thread", async ({
  api,
  page,
}) => {
  seedThread(api);
  api.on.editComment((call) => ({
    json: {
      comment_view: wireComment({
        id: 20,
        content: (call.body as { content: string }).content,
      }),
    },
  }));

  await page.goto(POST_URL);
  await expect(page.getByText("my own comment")).toBeVisible();

  await commentEllipsis(page, 20).click();
  await actionSheetButton(page, "Edit").click();

  await page.locator("ion-modal textarea").fill("edited comment");
  await composerSubmit(page).click();

  const payload = await api.waitForPayload("editComment");
  expect(payload).toEqual({ comment_id: 20, content: "edited comment" });

  await expect(page.locator(".comment-20").first()).toContainText(
    "edited comment",
  );
});

test("v1: deleting own comment sends DELETE", async ({ api, page }) => {
  seedThread(api);
  api.on.deleteComment(() => {
    const deleted = wireComment({ id: 20, content: "" });
    deleted.comment.deleted = true;
    return { json: { comment_view: deleted } };
  });

  await page.goto(POST_URL);
  await expect(page.getByText("my own comment")).toBeVisible();

  await commentEllipsis(page, 20).click();
  await actionSheetButton(page, "Delete").click();
  // Confirmation sheet
  await page.getByRole("button", { name: "Delete Comment" }).click();

  const payload = await api.waitForPayload("deleteComment");
  expect(payload.comment_id).toBe(20);

  await expect(page.getByText("my own comment")).not.toBeVisible();
});

test("v1: creating a text post submits and navigates to it", async ({
  api,
  page,
}) => {
  const createdPost = build.postView({
    id: 999,
    name: "Fresh new post",
    body: "fresh post body",
    creator: wireMe,
  });
  api.on.createPost({ json: { post_view: createdPost } });
  api.on.getPost({ json: build.postResponse(createdPost) });

  await page.goto(`/posts/${V1_HOST}/c/test_comm`);
  await expect(page.getByText("First v1 post")).toBeVisible();

  await headerButton(page, "More options").click();
  await page.getByRole("button", { name: "Submit Post" }).click();

  const editor = page.locator("ion-modal", { hasText: "Post" }).first();
  await editor.locator("ion-segment-button", { hasText: "Text" }).click();
  await editor.locator('input[placeholder="Title"]').fill("Fresh new post");

  // Body text is a pushed sub-page within the editor modal
  await editor.getByText("Text (optional)").click();
  await editor.locator("textarea").fill("fresh post body");
  await editor.getByRole("button", { name: "Back" }).click();

  await editor.getByRole("button", { name: "Post", exact: true }).click();

  const payload = await api.waitForPayload("createPost");
  expect(payload).toMatchObject({
    name: "Fresh new post",
    body: "fresh post body",
    community_id: 111,
  });

  // Creation shows a toast; tapping it navigates to the new post
  await page.getByText("Posted! Tap to view.").click();
  await expect(page).toHaveURL(/\/comments\/999/);
});
