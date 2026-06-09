import { KeyboardEvent } from "react";

import { EditorController } from "./controller";

const ORDERED_LIST = /^(\d+)\. /;
const UNORDERED_LIST = /^[-*+] /;

/**
 * On Enter inside a markdown list item, continue the list — insert the next
 * marker (`- `/`* `/`+ ` for bullets, the incremented `n. ` for ordered) — or,
 * if the current item is empty, remove the marker to exit the list. Returns
 * `true` if it handled the event (and called `preventDefault`); `false` to let
 * the default newline happen.
 *
 * Backend-agnostic: it drives the {@link EditorController}, so the same logic
 * serves both the `<textarea>` and the editate rich editor. editate's
 * `insertText` inserts at the *snapshotted* caret (the toolbar captures it on
 * pointerdown), so for an in-editor edit we snapshot the live caret right before
 * inserting; `setSelection` already updates that snapshot, so the exit path
 * needs no explicit snapshot.
 */
export function continueListOnEnter(
  controller: EditorController,
  e: KeyboardEvent,
): boolean {
  if (e.nativeEvent.isComposing) return false; // don't disrupt IME composition

  const { start, end } = controller.getSelection();
  if (start !== end) return false; // only a collapsed caret

  const value = controller.getValue();
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const line = value.slice(lineStart, start);

  const ordered = ORDERED_LIST.exec(line);
  const marker = ordered?.[0] ?? UNORDERED_LIST.exec(line)?.[0];
  if (!marker) return false;

  // Empty item (just the marker) → remove it and drop out of the list.
  if (line === marker) {
    e.preventDefault();
    controller.setSelection(lineStart, start);
    controller.insertText("");
    return true;
  }

  if (ordered) {
    // Stop auto-numbering at 9 (parity with the textarea editor — avoids
    // runaway numbering on long lists).
    const n = Number(ordered[1]);
    if (n >= 9) return false;
    e.preventDefault();
    controller.snapshotSelection(); // capture the live caret as the insert point
    controller.insertText(`\n${n + 1}. `);
    return true;
  }

  e.preventDefault();
  controller.snapshotSelection();
  controller.insertText(`\n${marker}`);
  return true;
}
