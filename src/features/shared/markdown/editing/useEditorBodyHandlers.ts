import { ClipboardEvent, DragEvent } from "react";

import { useOnPaste } from "#/helpers/clipboard";

import { EditorController } from "./controller";
import useEditorHelpers from "./useEditorHelpers";
import useUploadImage from "./useUploadImage";

/**
 * Body-level editor interactions shared by both backends — the `<textarea>` and
 * the editate rich editor: paste an image or rich text, and drag-and-drop an
 * image. Returns the handlers to spread onto the editable element plus the
 * upload-progress `jsx` to render. Everything goes through the
 * {@link EditorController}, so the behavior is identical on both.
 */
export default function useEditorBodyHandlers(controller: EditorController) {
  const { insertBlock } = useEditorHelpers(controller);
  const { uploadImage, jsx } = useUploadImage("body");
  const { onKeyUpDown, onPaste: onPasteMarkdown } = useOnPaste(
    "markdown",
    (text) => {
      controller.snapshotSelection(); // capture the live caret as the insert point
      controller.insertText(text);
    },
  );

  async function onReceivedImage(image: File) {
    // Snapshot the caret *before* the async upload: the rich editor's
    // contenteditable loses its selection on blur, and the freeze survives it
    // (the same path the toolbar's image button uses). No-op for the textarea,
    // which keeps its selection natively.
    controller.snapshotSelection();
    const markdown = await uploadImage(image, true);
    controller.focus();
    insertBlock(markdown);
  }

  function onPaste(e: ClipboardEvent) {
    const image = e.clipboardData.files?.[0];
    if (image) {
      e.preventDefault();
      onReceivedImage(image);
      return;
    }
    // Plain/rich text → markdown. `onPasteMarkdown` preventDefaults + inserts via
    // `execCommand("insertText")`, which works in both a textarea and editate.
    onPasteMarkdown(e);
  }

  function onDropCapture(e: DragEvent) {
    const image = e.dataTransfer.files[0];
    if (!image) return;
    onReceivedImage(image);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
  }

  return { jsx, onPaste, onDropCapture, onDragOver, onKeyUpDown };
}
