import { useMergedRef } from "@mantine/hooks";
import {
  ClipboardEvent,
  Dispatch,
  DragEvent,
  KeyboardEvent,
  SetStateAction,
  useEffect,
  useRef,
} from "react";

import {
  extractLemmyLinkFromPotentialFediRedirectService,
  GO_VOYAGER_HOST,
} from "#/features/share/fediRedirect";
import { cx } from "#/helpers/css";
import { preventModalSwipeOnTextSelection } from "#/helpers/ionic";
import { htmlToMarkdown } from "#/helpers/markdown";
import { parseUriList } from "#/helpers/url";
import useKeyboardOpen from "#/helpers/useKeyboardOpen";
import useTextRecovery from "#/helpers/useTextRecovery";

import TextareaAutosizedForOnScreenKeyboard from "../../TextareaAutosizedForOnScreenKeyboard";
import MarkdownToolbar, { TOOLBAR_TARGET_ID } from "./MarkdownToolbar";
import useEditorHelpers from "./useEditorHelpers";
import useUploadImage from "./useUploadImage";

import styles from "./Editor.module.css";

const ORDERED_LIST_REGEX = /^(\d)\. /;
const UNORDERED_LIST_REGEX = /^(-|\*|\+) /;

export interface EditorProps {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  onSubmit?: () => unknown;
  canRecoverText?: boolean;
  onDismiss?: () => void;

  children?: React.ReactNode;

  ref?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function Editor({
  text,
  setText,
  children,
  onSubmit,
  onDismiss,
  canRecoverText = true,
  ref,
}: EditorProps) {
  const keyboardOpen = useKeyboardOpen();
  const textareaRef = useRef<HTMLTextAreaElement>(undefined);
  const onPastePlainRef = useRef(false);

  const { insertBlock } = useEditorHelpers(textareaRef);

  const { uploadImage, jsx: uploadImageJsx } = useUploadImage("body");

  useTextRecovery(text, setText, !canRecoverText);

  useEffect(() => {
    textareaRef.current?.focus({ preventScroll: true });

    // iOS safari native has race sometimes
    setTimeout(() => {
      if (!textareaRef.current) return;

      textareaRef.current.focus({ preventScroll: true });

      // Place cursor at end
      const len = textareaRef.current.value.length;
      textareaRef.current?.setSelectionRange(len, len);
    }, 100);
  }, []);

  async function onPaste(e: ClipboardEvent) {
    const image = e.clipboardData.files?.[0];

    if (image) {
      e.preventDefault();

      onReceivedImage(image);
      return;
    }

    // Bail on paste modifiers if user is holding down shift
    if (onPastePlainRef.current) return;

    const html = e.clipboardData.getData("text/html");

    if (html) {
      e.preventDefault();

      let toInsert;

      try {
        toInsert = await htmlToMarkdown(html);
      } catch (_) {
        toInsert = e.clipboardData.getData("text");
        console.error("Parse error", e);
      }

      document.execCommand("insertText", false, toInsert);
      return;
    }

    const uriList = e.clipboardData.getData("text/uri-list");

    if (uriList) {
      const urls = parseUriList(uriList);

      if (urls.length !== 1) return;

      const potentialUrl = extractLemmyLinkFromPotentialFediRedirectService(
        urls[0]!,
        [GO_VOYAGER_HOST],
      );

      if (!potentialUrl) return;

      e.preventDefault();

      document.execCommand("insertText", false, potentialUrl);

      return;
    }

    const text = e.clipboardData.getData("text");

    if (text) {
      const potentialUrl = extractLemmyLinkFromPotentialFediRedirectService(
        text,
        [GO_VOYAGER_HOST],
      );

      if (!potentialUrl) return;

      e.preventDefault();

      document.execCommand("insertText", false, potentialUrl);
    }
  }

  async function onDragCapture(event: DragEvent) {
    const image = event.dataTransfer.files[0];

    if (!image) return;

    onReceivedImage(image);
  }

  async function onReceivedImage(image: File) {
    const markdown = await uploadImage(image, true);

    textareaRef.current?.focus();
    insertBlock(markdown);
  }

  async function onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  async function autocompleteListIfNeeded(e: KeyboardEvent) {
    if (
      !textareaRef.current ||
      textareaRef.current.selectionStart !== textareaRef.current.selectionStart
    )
      return;

    const currentText = textareaRef.current.value.slice(
      0,
      textareaRef.current.selectionStart,
    ); // -1: already hit enter

    const lastNewlineIndex = currentText.lastIndexOf("\n") ?? 0;

    const lastLine = currentText.slice(
      lastNewlineIndex + 1,
      currentText.length,
    );

    const orderedMatch = lastLine.match(ORDERED_LIST_REGEX);
    if (orderedMatch?.[1]) {
      const listNumber = +orderedMatch[1];
      if (listNumber >= 9) return; // only support up to 9 items for now to avoid annoying autocomplete

      // if pressing <enter> on empty list item, bail and remove empty item
      if (orderedMatch[0] === lastLine) {
        textareaRef.current.setSelectionRange(
          textareaRef.current.selectionStart - orderedMatch[0].length,
          textareaRef.current.selectionStart,
        );
        return;
      }

      e.preventDefault();
      document.execCommand("insertText", false, `\n${listNumber + 1}. `);
    }

    const unorderedMatch = lastLine.match(UNORDERED_LIST_REGEX);
    if (unorderedMatch?.[1]) {
      // if pressing <enter> on empty list item, bail and remove empty item
      if (unorderedMatch[0] === lastLine) {
        textareaRef.current.setSelectionRange(
          textareaRef.current.selectionStart - unorderedMatch[0].length,
          textareaRef.current.selectionStart,
        );
        return;
      }

      e.preventDefault();
      document.execCommand("insertText", false, `\n${unorderedMatch?.[1]} `);
    }
  }

  function updateMetaRef(e: KeyboardEvent) {
    const meta = e.shiftKey;
    onPastePlainRef.current = meta;
    return meta;
  }

  return (
    <>
      {uploadImageJsx}
      <div
        className={cx(styles.container, keyboardOpen && styles.keyboardOpen)}
      >
        <TextareaAutosizedForOnScreenKeyboard
          {...preventModalSwipeOnTextSelection}
          className={styles.textarea}
          ref={useMergedRef(textareaRef, ref)}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          autoCapitalize="on"
          autoCorrect="on"
          spellCheck
          id={TOOLBAR_TARGET_ID}
          onKeyDown={(e) => {
            updateMetaRef(e);

            switch (e.key) {
              case "Enter": {
                if (e.ctrlKey || e.metaKey) {
                  onSubmit?.();
                } else {
                  autocompleteListIfNeeded(e);
                }
                break;
              }
              case "Escape":
                onDismiss?.();
                break;
            }
          }}
          onKeyUp={updateMetaRef}
          onPaste={onPaste}
          onDropCapture={onDragCapture}
          onDragOver={onDragOver}
        />
        {children}
      </div>

      <MarkdownToolbar
        slot="fixed"
        type="comment"
        text={text}
        textareaRef={textareaRef}
      />
    </>
  );
}
