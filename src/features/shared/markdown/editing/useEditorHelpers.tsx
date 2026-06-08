import { useCallback, useEffect, useMemo, useRef } from "react";

import { getSelectionHtml } from "#/helpers/dom";

import { EditorController } from "./controller";

export default function useEditorHelpers(controller: EditorController) {
  const selectionLocation = useRef(0);
  const selectionLocationEnd = useRef(0);
  const replySelectionRef = useRef<{ text: string; html: string } | undefined>(
    undefined,
  );

  useEffect(() => {
    const updateEditorSelection = () => {
      const { start, end } = controller.getSelection();
      selectionLocation.current = start;
      selectionLocationEnd.current = end;
    };

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

    const unsubscribe = controller.subscribe(
      "selectionchange",
      updateEditorSelection,
    );
    document.addEventListener("selectionchange", updateReplySelection);

    return () => {
      unsubscribe();
      document.removeEventListener("selectionchange", updateReplySelection);
    };
  }, [controller]);

  const insertInline = useCallback(
    (insertText: string, placeCursorFromEnd = 0, selectLength = 0) => {
      const text = controller.getValue();
      const currentSelectionLocation = selectionLocation.current;

      const initiallySelectedText = text
        .slice(selectionLocation.current, selectionLocationEnd.current)
        .trim();

      controller.focus();

      controller.insertText(insertText);

      const endCursorLocation =
        currentSelectionLocation + insertText.length - placeCursorFromEnd;

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
      const currentSelectionLocation = selectionLocation.current;

      const before = (() => {
        if (
          text[currentSelectionLocation - 1] &&
          text[currentSelectionLocation - 1] === "\n" &&
          text[currentSelectionLocation - 2] &&
          text[currentSelectionLocation - 2] !== "\n"
        )
          return "\n";

        if (
          text[currentSelectionLocation - 2] &&
          text[currentSelectionLocation - 2] !== "\n"
        )
          return "\n\n";

        return "";
      })();

      const after = (() => {
        if (
          text[currentSelectionLocation] &&
          text[currentSelectionLocation] === "\n" &&
          text[currentSelectionLocation + 1] &&
          text[currentSelectionLocation + 1] !== "\n"
        )
          return "\n";

        if (
          text[currentSelectionLocation + 1] &&
          text[currentSelectionLocation + 1] !== "\n"
        )
          return "\n\n";

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
      selectionLocation,
      selectionLocationEnd,
      replySelectionRef,
    }),
    [
      insertBlock,
      insertInline,
      selectionLocation,
      selectionLocationEnd,
      replySelectionRef,
    ],
  );
}
