import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

import { cx } from "#/helpers/css";
import { preventModalSwipeOnTextSelection } from "#/helpers/ionic";
import useKeyboardOpen from "#/helpers/useKeyboardOpen";

import TextareaAutosizedForOnScreenKeyboard from "../../TextareaAutosizedForOnScreenKeyboard";
import { createTextareaEditor } from "./controller";
import { continueListOnEnter } from "./listContinuation";
import MarkdownToolbar from "./MarkdownToolbar";
import useEditorBodyHandlers from "./useEditorBodyHandlers";

import styles from "./Editor.module.css";

export interface PlainTextEditorProps {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  onSubmit?: () => unknown;
  onDismiss?: () => void;
  children?: React.ReactNode;
  ref?: React.RefObject<HTMLElement | null>;
}

/**
 * Plain `<textarea>` markdown editor — the default backend. All textarea-only
 * concerns (the controller, focus/caret handling, DOM specifics) live here so
 * the parent {@link Editor} stays a backend-agnostic router. Mirrors
 * `RichTextEditor`.
 */
export default function PlainTextEditor({
  text,
  setText,
  children,
  onSubmit,
  onDismiss,
  ref,
}: PlainTextEditorProps) {
  const keyboardOpen = useKeyboardOpen();
  // The element lives in the factory (set via a ref callback), so nothing reads
  // a React ref during render — keeping this component React-Compiler-compilable.
  const [{ controller, setTextarea, getTextarea }] =
    useState(createTextareaEditor);
  // Expose the textarea through the external ref (used to refocus the editor,
  // e.g. after the account switcher dismisses) alongside the controller's
  // setter. Stable, so the textarea isn't detached/reattached on every render.
  const setTextareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      setTextarea(node);
      if (ref) ref.current = node;
    },
    [setTextarea, ref],
  );

  const { jsx, onPaste, onDropCapture, onDragOver, onKeyUpDown } =
    useEditorBodyHandlers(controller);

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

  return (
    <>
      {jsx}
      <div
        className={cx(styles.container, keyboardOpen && styles.keyboardOpen)}
      >
        <TextareaAutosizedForOnScreenKeyboard
          {...preventModalSwipeOnTextSelection}
          className={styles.textarea}
          ref={setTextareaRef}
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
