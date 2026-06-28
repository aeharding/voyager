import { ReactNode } from "react";

import { cx } from "#/helpers/css";
import useKeyboardOpen from "#/helpers/useKeyboardOpen";

import { EditorController } from "./controller";
import MarkdownToolbar from "./MarkdownToolbar";

import styles from "./Editor.module.css";

interface EditorFrameProps {
  controller: EditorController;
  text: string;
  /** Upload-progress UI from `useEditorBodyHandlers`. */
  uploadProgress: ReactNode;
  /** The editable element (textarea or contenteditable host) plus any extras. */
  children: ReactNode;
}

/**
 * Shared chrome around both editor backends — the keyboard-aware container, the
 * upload-progress UI, and the markdown toolbar. The editable element itself
 * (a `<textarea>` or the editate contenteditable) is passed in as children, so
 * each backend only owns its element and the controller behind it.
 */
export default function EditorFrame({
  controller,
  text,
  uploadProgress,
  children,
}: EditorFrameProps) {
  const keyboardOpen = useKeyboardOpen();

  return (
    <>
      {uploadProgress}
      <div
        className={cx(styles.container, keyboardOpen && styles.keyboardOpen)}
      >
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
