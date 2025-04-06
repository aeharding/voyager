import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";

import { getSelectionHtml } from "#/helpers/dom";

export default function useEditorHelpers(
  textareaRef: RefObject<HTMLTextAreaElement | undefined>,
) {
  const selectionLocation = useRef(0);
  const selectionLocationEnd = useRef(0);
  const replySelectionRef = useRef<{ text: string; html: string } | undefined>(
    undefined,
  );

  useEffect(() => {
    const onChange = () => {
      selectionLocation.current = textareaRef.current?.selectionStart ?? 0;
      selectionLocationEnd.current = textareaRef.current?.selectionEnd ?? 0;

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

    document.addEventListener("selectionchange", onChange);

    return () => {
      document.removeEventListener("selectionchange", onChange);
    };
  }, [textareaRef]);

  const insertInline = useCallback(
    (insertText: string, placeCursorFromEnd = 0, selectLength = 0) => {
      const text = textareaRef.current?.value ?? "";
      const currentSelectionLocation = selectionLocation.current;

      const initiallySelectedText = text
        .slice(selectionLocation.current, selectionLocationEnd.current)
        .trim();

      textareaRef.current?.focus();

      document.execCommand("insertText", false, insertText);

      const endCursorLocation =
        currentSelectionLocation + insertText.length - placeCursorFromEnd;

      textareaRef.current?.setSelectionRange(
        endCursorLocation,
        endCursorLocation + selectLength,
      );

      if (initiallySelectedText && selectLength) {
        document.execCommand("insertText", false, initiallySelectedText);
      }
    },
    [textareaRef],
  );

  const insertBlock = useCallback(
    (blockText: string, placeCursorFromEnd = 0, selectLength = 0) => {
      const text = textareaRef.current?.value ?? "";
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
    [insertInline, textareaRef],
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
