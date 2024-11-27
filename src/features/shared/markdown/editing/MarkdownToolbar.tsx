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
    }
  | {
      type: "community";
      match: string;
      index: number;
    };

interface MarkdownToolbarProps extends SharedModeProps {
  slot?: string;
}

export default function MarkdownToolbar({
  slot,
  ...rest
}: MarkdownToolbarProps) {
  const { text, textareaRef } = rest;

  const keyboardOpen = useKeyboardOpen();
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<MarkdownToolbarMode>({ type: "default" });

  const calculateMode = useCallback(() => {
    if (!textareaRef.current) return;

    const text = textareaRef.current.value;
    const cursorPosition = textareaRef.current.selectionStart;

    // Use a regex to check if the entered text matches the pattern "@username@domain.com"
    const TYPEAHEAD_HANDLE_REGEX = /(?:^|\s|\(|\[)(?:@|!)(\w*(@[\w.]*)?)/g;
    const BEGINNING_SPACE_REGEX = /\s|\(|\[/;

    /**
     * Say cursor is at the following position:
     * ```
     * ! h e l l o b o b
     *            ^
     * ```
     * Then match should only match against partial string `"@hello"`.
     * But, with:
     * ```
     * ! h e l l o b o b
     *  ^
     * ```
     * Match against entire string `"@hellobob"`
     */
    const textToMatch = /@|!/.test(text[cursorPosition - 1] || "")
      ? text
      : text.slice(0, cursorPosition);

    let match;
    while ((match = TYPEAHEAD_HANDLE_REGEX.exec(textToMatch)) !== null) {
      if (
        cursorPosition >= match.index &&
        cursorPosition <= TYPEAHEAD_HANDLE_REGEX.lastIndex
      ) {
        if (match[1] != null) {
          // if match starts with a @ then mention is at the very beginning of the comment/post
          const index = BEGINNING_SPACE_REGEX.test(text[match.index] || "")
            ? match.index + 1
            : match.index;

          setMode({
            type: text[index] === "@" ? "username" : "community",
            match: match[1],
            index,
          });
          return;
        }
        // Do something with the detected handle
      }
    }

    setMode({ type: "default" });
  }, [textareaRef]);

  useEffect(() => {
    calculateMode();
  }, [calculateMode, text]);

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
