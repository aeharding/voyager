import type { Page } from "@playwright/test";

/**
 * A button in the topmost *presented* action sheet. Scoping matters:
 * hidden declarative sheets also exist in the DOM, and background buttons
 * (e.g. the post action bar) can share names with sheet options.
 */
export function actionSheetButton(page: Page, name: string) {
  return page
    .locator("ion-action-sheet", { hasText: name })
    .last()
    .getByRole("button", { name, exact: true });
}

/** A header (toolbar) button, disambiguated from same-named feed buttons. */
export function headerButton(page: Page, name: string) {
  return page.locator("ion-toolbar").getByRole("button", { name });
}
