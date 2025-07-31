import "@github/markdown-toolbar-element";
import { IonContent } from "@ionic/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cx } from "#/helpers/css";
import useKeyboardOpen from "#/helpers/useKeyboardOpen";

import CommunityAutocomplete from "./modes/autocomplete/CommunityAutocompleteMode";
import UsernameAutocompleteMode from "./modes/autocomplete/UsernameAutocompleteMode";
import DefaultMode, { SharedModeProps } from "./modes/DefaultMode";

import styles from "./MarkdownToolbar.module.css";

export const TOOLBAR_TARGET_ID = "toolbar-target";

export function MarkdownEditorIonContent(
  props: Omit<React.ComponentProps<typeof IonContent>, "className">,
) {
  return <IonContent {...props} className={styles.markdownEditorIonContent} />;
}

type MarkdownToolbarMode =
  | {
      type: "default";
    }
  | {
      type: "username";
      match: string;
      index: number;
      prefix: string;
    }
  | {
      type: "community";
      match: string;
      index: number;
      prefix: string;
    };

interface MarkdownToolbarProps extends SharedModeProps {
  slot?: string;
}

export default function MarkdownToolbar({
  slot,
  ...rest
}: MarkdownToolbarProps) {
  const { textareaRef } = rest;

  const keyboardOpen = useKeyboardOpen();
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<MarkdownToolbarMode>({ type: "default" });

  const calculateMode = useCallback(() => {
    if (!textareaRef.current) return;

    const text = textareaRef.current.value;
    const cursorPosition = textareaRef.current.selectionStart;

    // Use a regex to check if the entered text matches the pattern "@username@domain.com"
    const TYPEAHEAD_HANDLE_REGEX =
      /(^|\s|\(|\[)(@|!|\/c\/|\/u\/)(\w*(@[\w.]*)?)/g;

    const textToCursorPosition = text.slice(0, cursorPosition);

    /**
     * Say cursor is at the following position:
     * ```
     * ! h e l l o b o b
     *            ^
     * ```
     * Then match should only match against partial string `"!hello"`.
     * But, with:
     * ```
     * ! h e l l o b o b
     *  ^
     * ```
     * Match against entire string `"!hellobob"`
     */
    const textToCursorEndsWithPrefix = /(?:@|!|\/c\/|\/u\/)$/.test(
      textToCursorPosition,
    );
    const textToMatch = textToCursorEndsWithPrefix
      ? text
      : textToCursorPosition;

    let match;
    while ((match = TYPEAHEAD_HANDLE_REGEX.exec(textToMatch)) !== null) {
      const [, spacer, prefix, handle] = match;
      if (spacer == null || prefix == null || handle == null) continue;

      if (
        cursorPosition < match.index ||
        cursorPosition > TYPEAHEAD_HANDLE_REGEX.lastIndex
      ) {
        continue;
      }

      const type = getModeTypeForPrefix(prefix);

      if (type) {
        // the TYPEAHEAD_HANDLE_REGEX includes the space/parenthesis/bracket (separator) before the match
        // so take that out
        const index = match.index + spacer.length;

        setMode({
          type,
          prefix,
          match: handle,
          index,
        });
        return;
      }
      // Do something with the detected handle
    }

    setMode({ type: "default" });
  }, [textareaRef]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.addEventListener("input", calculateMode);

    return () => {
      textarea.removeEventListener("input", calculateMode);
    };
  }, [calculateMode, textareaRef]);

  const toolbar = (() => {
    switch (mode.type) {
      case "default":
        return <DefaultMode {...rest} calculateMode={calculateMode} />;
      case "username":
        return <UsernameAutocompleteMode {...mode} {...rest} />;
      case "community":
        return <CommunityAutocomplete {...mode} {...rest} />;
    }
  })();

  return (
    <>
      <div className={styles.toolbarContainer} slot={slot}>
        <div
          className={cx(styles.toolbar, keyboardOpen && styles.keyboardOpen)}
          ref={toolbarRef}
        >
          {toolbar}
        </div>
      </div>
    </>
  );
}

function getModeTypeForPrefix(prefix: string) {
  switch (prefix) {
    case "@":
    case "/u/":
      return "username";
    case "!":
    case "/c/":
      return "community";
  }
}
