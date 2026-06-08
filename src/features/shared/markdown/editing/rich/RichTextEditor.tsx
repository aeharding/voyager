import { KeyboardEvent, ReactNode, useMemo, useState } from "react";

import { cx } from "#/helpers/css";
import useKeyboardOpen from "#/helpers/useKeyboardOpen";
import { useAppSelector } from "#/store";

import MarkdownToolbar from "../MarkdownToolbar";
import { createRichEditor } from "./createRichEditor";
import { buildMarkdownDecorator } from "./markdownDecorator";

import editorStyles from "../Editor.module.css";
import styles from "./RichTextEditor.module.css";

export interface RichTextEditorProps {
  text: string;
  setText: (text: string) => void;
  onSubmit?: () => unknown;
  onDismiss?: () => void;
  children?: ReactNode;
}

/**
 * Experimental "rich" markdown editor (opt-in via the `rich_markdown_editor`
 * setting). Built on editate's plain editor + a remark decorator so markdown
 * renders styled while typing. The contents stay plain markdown text. The whole
 * toolbar — including bold/italic/quote — is wired through the EditorController.
 * See RICH_MARKDOWN_EDITOR_PLAN.md.
 */
export default function RichTextEditor({
  text,
  setText,
  onSubmit,
  onDismiss,
  children,
}: RichTextEditorProps) {
  const keyboardOpen = useKeyboardOpen();
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  // Created once. `text`/`setText` are the initial value + a stable state setter.
  const [{ controller, setHost }] = useState(() =>
    createRichEditor(text, setText),
  );

  const processor = useMemo(
    () => buildMarkdownDecorator(connectedInstance),
    [connectedInstance],
  );

  const rendered = useMemo(() => {
    try {
      return processor.processSync(text).result;
    } catch {
      // Never let a decoration error break editing — fall back to plain lines
      return text.split("\n").map((line, i) => (
        <div key={i} data-block>
          {line || <br />}
        </div>
      ));
    }
  }, [processor, text]);

  function onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "Enter":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onSubmit?.();
        }
        break;
      case "Escape":
        onDismiss?.();
        break;
    }
  }

  return (
    <>
      <div
        className={cx(
          editorStyles.container,
          keyboardOpen && editorStyles.keyboardOpen,
        )}
      >
        <div
          ref={setHost}
          className={styles.editor}
          onKeyDown={onKeyDown}
          autoCapitalize="on"
          autoCorrect="on"
          spellCheck
        >
          {rendered}
        </div>
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
