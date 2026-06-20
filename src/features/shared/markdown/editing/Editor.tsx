import { useMergedRef } from "@mantine/hooks";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { cx } from "#/helpers/css";
import { preventModalSwipeOnTextSelection } from "#/helpers/ionic";
import useKeyboardOpen from "#/helpers/useKeyboardOpen";
import useTextRecovery from "#/helpers/useTextRecovery";
import { useAppSelector } from "#/store";

import MarkdownTextarea from "../../MarkdownTextarea";
import TextareaAutosizedForOnScreenKeyboard from "../../TextareaAutosizedForOnScreenKeyboard";
import { createTextareaEditor } from "./controller";
import { continueListOnEnter } from "./listContinuation";
import MarkdownToolbar from "./MarkdownToolbar";
import RichTextEditor from "./rich/RichTextEditor";
import useEditorBodyHandlers from "./useEditorBodyHandlers";

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

  const { jsx, onPaste, onDropCapture, onDragOver, onKeyUpDown } =
    useEditorBodyHandlers(controller);

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

  return (
    <>
      {jsx}
      <div
        className={cx(styles.container, keyboardOpen && styles.keyboardOpen)}
      >
        <MarkdownTextarea
          {...preventModalSwipeOnTextSelection}
          textareaComponent={TextareaAutosizedForOnScreenKeyboard}
          className={styles.textarea}
          ref={mergedRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          autoCapitalize="on"
          autoCorrect="on"
          spellCheck
          onKeyDown={(e) => {
            onKeyUpDown(e);

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
          onKeyUp={onKeyUpDown}
          onPaste={onPaste}
          onDropCapture={onDropCapture}
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
