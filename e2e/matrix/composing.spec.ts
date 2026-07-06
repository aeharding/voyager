// Content-composition behavior that's backend-independent: creating/editing/
// deleting posts and comments (the fakes derive the write response from
// mutated seed state, so the thread updates on either provider), the
// composer's outgoing request payload, the opt-in rich markdown editor, the
// vger.to link unwrap, and the dirty-composer dismiss guard.

import type { Page } from "@playwright/test";

import { fixturePosts } from "../fixtures/builders";
import { getSetting } from "../fixtures/db";
import { actionSheetButton, headerButton } from "../fixtures/ui";
import { expect, test } from "./fixtures";

test.use({ loggedIn: true });

function postUrl(host: string) {
  return `/posts/${host}/c/test_comm/comments/${fixturePosts[0]!.id}`;
}

function postEllipsis(page: Page) {
  return headerButton(page, "More options");
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

// Flip on the opt-in rich editor through the real settings UI.
async function enableRichEditor(page: Page) {
  await page.goto("/settings/general");
  const toggle = page.locator("ion-toggle", {
    hasText: "Rich Markdown Editor",
  });
  await toggle.click();
  await expect(toggle).toHaveJSProperty("checked", true);
  await expect.poll(() => getSetting(page, "rich_markdown_editor")).toBe(true);
}

async function copyUrlToClipboard(page: Page, url: string) {
  await page
    .context()
    .grantPermissions(["clipboard-read", "clipboard-write"])
    .catch(() => undefined);
  await page.evaluate(async (u) => {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob(
          [`<meta charset='utf-8'><a href="${u}">${u}</a>`],
          {
            type: "text/html",
          },
        ),
        "text/plain": new Blob([u], { type: "text/plain" }),
      }),
    ]);
  }, url);
}

test("replying to a comment sets parent_id", async ({ api, page }) => {
  api.seed.comment({ id: 20, content: "my own comment", creator: api.me });

  await page.goto(postUrl(api.host));
  await expect(page.getByText("my own comment")).toBeVisible();

  await commentEllipsis(page, 20).click();
  await actionSheetButton(page, "Reply").click();

  await page.locator("ion-modal textarea").fill("nested reply");
  await composerSubmit(page).click();

  const payload = await api.waitForPayload("createComment");
  expect(payload).toEqual({
    content: "nested reply",
    post_id: 1,
    parent_id: 20,
  });
});

test("editing own post sends the edit payload", async ({ api, page }) => {
  await page.goto(postUrl(api.host));
  await expect(page.getByText(fixturePosts[0]!.name).first()).toBeVisible();

  await postEllipsis(page).click();
  await actionSheetButton(page, "Edit").click();

  const editor = page.locator("ion-modal", { hasText: "Edit Post" });
  await editor.locator('input[placeholder="Title"]').fill("Renamed post");
  await editor.getByRole("button", { name: "Save", exact: true }).click();

  const payload = await api.waitForPayload("editPost");
  expect(payload).toMatchObject({ post_id: 1, name: "Renamed post" });
});

test("deleting own post sends the delete payload", async ({ api, page }) => {
  await page.goto(postUrl(api.host));
  await expect(page.getByText(fixturePosts[0]!.name).first()).toBeVisible();

  await postEllipsis(page).click();
  await actionSheetButton(page, "Delete").click();
  // Confirmation sheet
  await page.getByRole("button", { name: "Delete Post" }).click();

  const payload = await api.waitForPayload("deletePost");
  expect(payload.post_id).toBe(1);
});

test("rich editor (opt-in) still submits plain markdown", async ({
  api,
  page,
}) => {
  api.seed.comment({ id: 20, content: "my own comment", creator: api.me });

  await enableRichEditor(page);

  await page.goto(postUrl(api.host));
  await expect(page.getByText("my own comment")).toBeVisible();

  await postReplyButton(page).click();

  const richEditor = page.locator('ion-modal [contenteditable="true"]');
  await richEditor.fill("rich editor reply");
  await composerSubmit(page).click();

  const payload = await api.waitForPayload("createComment");
  expect(payload).toEqual({ content: "rich editor reply", post_id: 1 });
});

test("editor unwraps a pasted vger.to link", async ({ api, page }) => {
  api.seed.comment({ id: 20, content: "my own comment", creator: api.me });

  await page.goto(postUrl(api.host));
  await expect(page.getByText("my own comment")).toBeVisible();

  await postReplyButton(page).click();

  const textarea = page.locator("ion-modal textarea");
  await expect(textarea).toBeVisible();

  await copyUrlToClipboard(page, "https://vger.to/lemmy.world/post/123");
  await textarea.click();
  await page.keyboard.press("ControlOrMeta+v");

  await expect(textarea).toHaveValue("https://lemmy.world/post/123");

  await composerSubmit(page).click();

  const payload = await api.waitForPayload("createComment");
  expect(payload).toEqual({
    content: "https://lemmy.world/post/123",
    post_id: 1,
  });
});

test("rich editor unwraps a pasted vger.to link", async ({ api, page }) => {
  api.seed.comment({ id: 20, content: "my own comment", creator: api.me });

  await enableRichEditor(page);

  await page.goto(postUrl(api.host));
  await expect(page.getByText("my own comment")).toBeVisible();

  await postReplyButton(page).click();

  const richEditor = page.locator('ion-modal [contenteditable="true"]');
  await expect(richEditor).toBeVisible();

  await copyUrlToClipboard(page, "https://vger.to/lemmy.world/post/123");
  await richEditor.click();
  await page.keyboard.press("ControlOrMeta+v");

  await expect(richEditor).toContainText("https://lemmy.world/post/123");
  await expect(richEditor).not.toContainText("vger.to");

  await composerSubmit(page).click();

  const payload = await api.waitForPayload("createComment");
  expect(payload).toEqual({
    content: "https://lemmy.world/post/123",
    post_id: 1,
  });
});

test("dirty composer requires confirmation to dismiss", async ({
  api,
  page,
}) => {
  api.seed.comment({ id: 20, content: "my own comment", creator: api.me });

  await page.goto(postUrl(api.host));
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

test("replying to a post submits and renders the comment", async ({
  api,
  page,
}) => {
  api.seed.comment({ id: 20, content: "my own comment", creator: api.me });

  await page.goto(postUrl(api.host));
  await expect(page.getByText("my own comment")).toBeVisible();

  await postReplyButton(page).click();

  await page.locator("ion-modal textarea").fill("fresh reply");
  await composerSubmit(page).click();

  const payload = await api.waitForPayload("createComment");
  expect(payload).toEqual({ content: "fresh reply", post_id: 1 });

  // The fake derives the write response, so the new comment renders
  await expect(page.getByText("fresh reply")).toBeVisible();
});

test("editing own comment sends the edit and updates the thread", async ({
  api,
  page,
}) => {
  api.seed.comment({ id: 20, content: "my own comment", creator: api.me });

  await page.goto(postUrl(api.host));
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

test("deleting own comment removes it from the thread", async ({
  api,
  page,
}) => {
  api.seed.comment({ id: 20, content: "my own comment", creator: api.me });

  await page.goto(postUrl(api.host));
  await expect(page.getByText("my own comment")).toBeVisible();

  await commentEllipsis(page, 20).click();
  await actionSheetButton(page, "Delete").click();
  await page.getByRole("button", { name: "Delete Comment" }).click();

  const payload = await api.waitForPayload("deleteComment");
  expect(payload.comment_id).toBe(20);

  await expect(page.getByText("my own comment")).not.toBeVisible();
});

test("creating a text post submits and navigates to it", async ({
  api,
  page,
}) => {
  await page.goto(`/posts/${api.host}/c/test_comm`);
  await expect(page.getByText(fixturePosts[0]!.name)).toBeVisible();

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
    body: "fresh post body",
    community_id: 111,
    name: "Fresh new post",
  });

  // "Posted! Tap to view." → tap it to navigate to the newly-created post.
  // The fake derived it into the seed store, so getPost resolves and the
  // detail page renders — proving the create round-trips on either provider.
  await page.getByText("Posted! Tap to view.").click();
  await expect(page).toHaveURL(/\/comments\/\d+/);
  await expect(page.getByText("fresh post body")).toBeVisible();
});
