import { useCallback, useEffect, useMemo, useRef } from "react";

import { getSelectionHtml } from "#/helpers/dom";

import { EditorController } from "./controller";

export default function useEditorHelpers(controller: EditorController) {
  // The highlighted document text (e.g. a post being replied to), captured for
  // the quote button. This is the global window selection, not the editor's.
  const replySelectionRef = useRef<{ text: string; html: string } | undefined>(
    undefined,
  );

  useEffect(() => {
    const updateReplySelection = () => {
      // Not great to do this here, but if we don't,
      // safari will sometimes return selection.toString() === "" during onQuote
      const selection = window.getSelection();
      replySelectionRef.current =
        selection?.type === "Range"
          ? {
              text: selection.toString(),
              html: getSelectionHtml(selection),
            }
          : undefined;
    };

    document.addEventListener("selectionchange", updateReplySelection);
    return () =>
      document.removeEventListener("selectionchange", updateReplySelection);
  }, []);

  const insertInline = useCallback(
    (insertText: string, placeCursorFromEnd = 0, selectLength = 0) => {
      const text = controller.getValue();
      const { start, end } = controller.getSelection();

      const initiallySelectedText = text.slice(start, end).trim();

      controller.focus();

      controller.insertText(insertText);

      const endCursorLocation = start + insertText.length - placeCursorFromEnd;

      controller.setSelection(
        endCursorLocation,
        endCursorLocation + selectLength,
      );

      if (initiallySelectedText && selectLength) {
        controller.insertText(initiallySelectedText);
      }
    },
    [controller],
  );

  const insertBlock = useCallback(
    (blockText: string, placeCursorFromEnd = 0, selectLength = 0) => {
      const text = controller.getValue();
      const location = controller.getSelection().start;

      const before = (() => {
        if (
          text[location - 1] &&
          text[location - 1] === "\n" &&
          text[location - 2] &&
          text[location - 2] !== "\n"
        )
          return "\n";

        if (text[location - 2] && text[location - 2] !== "\n") return "\n\n";

        return "";
      })();

      const after = (() => {
        if (
          text[location] &&
          text[location] === "\n" &&
          text[location + 1] &&
          text[location + 1] !== "\n"
        )
          return "\n";

        if (text[location + 1] && text[location + 1] !== "\n") return "\n\n";

        return "";
      })();

      insertInline(
        `${before}${blockText}${after}`,
        placeCursorFromEnd + after.length,
        selectLength,
      );
    },
    [insertInline, controller],
  );

  return useMemo(
    () => ({
      insertBlock,
      insertInline,
      replySelectionRef,
    }),
    [insertBlock, insertInline, replySelectionRef],
  );
}
