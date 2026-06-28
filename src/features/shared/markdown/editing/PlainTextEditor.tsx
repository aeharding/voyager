import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

import { preventModalSwipeOnTextSelection } from "#/helpers/ionic";

import TextareaAutosizedForOnScreenKeyboard from "../../TextareaAutosizedForOnScreenKeyboard";
import { createTextareaEditor } from "./controller";
import EditorFrame from "./EditorFrame";
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
 * `RichTextEditor`; shared chrome lives in {@link EditorFrame}.
 */
export default function PlainTextEditor({
  text,
  setText,
  children,
  onSubmit,
  onDismiss,
  ref,
}: PlainTextEditorProps) {
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

  const { jsx, onPaste, onDropCapture, onDragOver, onKeyDown, onKeyUp } =
    useEditorBodyHandlers(controller, { onSubmit, onDismiss });

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
    <EditorFrame controller={controller} text={text} uploadProgress={jsx}>
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
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onPaste={onPaste}
        onDropCapture={onDropCapture}
        onDragOver={onDragOver}
      />
      {children}
    </EditorFrame>
  );
}
