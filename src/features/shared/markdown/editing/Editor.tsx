import { useMergedRef } from "@mantine/hooks";
import {
  ClipboardEvent,
  Dispatch,
  DragEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import { useOnPaste } from "#/helpers/clipboard";
import { cx } from "#/helpers/css";
import { preventModalSwipeOnTextSelection } from "#/helpers/ionic";
import useKeyboardOpen from "#/helpers/useKeyboardOpen";
import useTextRecovery from "#/helpers/useTextRecovery";
import { useAppSelector } from "#/store";

import TextareaAutosizedForOnScreenKeyboard from "../../TextareaAutosizedForOnScreenKeyboard";
import { createTextareaEditor } from "./controller";
import { continueListOnEnter } from "./listContinuation";
import MarkdownToolbar from "./MarkdownToolbar";
import RichTextEditor from "./rich/RichTextEditor";
import useEditorHelpers from "./useEditorHelpers";
import useUploadImage from "./useUploadImage";

import styles from "./Editor.module.css";

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
  const richMarkdownEditor = useAppSelector(
    (state) => state.settings.general.richMarkdownEditor,
  );
  // The element lives in the factory (set via a ref callback), so nothing reads
  // a React ref during render — keeping this component React-Compiler-compilable.
  const [{ controller, setTextarea, getTextarea }] =
    useState(createTextareaEditor);
  const mergedRef = useMergedRef(setTextarea, ref);

  const { insertBlock } = useEditorHelpers(controller);

  const { uploadImage, jsx: uploadImageJsx } = useUploadImage("body");

  const { onKeyUpDown: onKeyUpDownPaste, onPaste: onPasteMarkdown } =
    useOnPaste("markdown");

  useTextRecovery(text, setText, !canRecoverText);

  useEffect(() => {
    getTextarea()?.focus({ preventScroll: true });

    // iOS safari native has race sometimes
    setTimeout(() => {
      const textarea = getTextarea();
      if (!textarea) return;

      textarea.focus({ preventScroll: true });

      // Place cursor at end
      const len = textarea.value.length;
      textarea.setSelectionRange(len, len);
    }, 100);
  }, [getTextarea]);

  // Opt-in experimental editor (off by default)
  if (richMarkdownEditor) {
    return (
      <RichTextEditor
        text={text}
        setText={setText}
        onSubmit={onSubmit}
        onDismiss={onDismiss}
      >
        {children}
      </RichTextEditor>
    );
  }

  async function onPaste(e: ClipboardEvent) {
    const image = e.clipboardData.files?.[0];

    if (image) {
      e.preventDefault();

      onReceivedImage(image);
      return;
    }

    onPasteMarkdown(e);
  }

  async function onDragCapture(event: DragEvent) {
    const image = event.dataTransfer.files[0];

    if (!image) return;

    onReceivedImage(image);
  }

  async function onReceivedImage(image: File) {
    const markdown = await uploadImage(image, true);

    getTextarea()?.focus();
    insertBlock(markdown);
  }

  async function onDragOver(event: DragEvent) {
    event.preventDefault();
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
          ref={mergedRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          autoCapitalize="on"
          autoCorrect="on"
          spellCheck
          onKeyDown={(e) => {
            onKeyUpDownPaste(e);

            switch (e.key) {
              case "Enter": {
                if (e.ctrlKey || e.metaKey) {
                  onSubmit?.();
                } else {
                  continueListOnEnter(controller, e);
                }
                break;
              }
              case "Escape":
                onDismiss?.();
                break;
            }
          }}
          onKeyUp={onKeyUpDownPaste}
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
        controller={controller}
      />
    </>
  );
}
