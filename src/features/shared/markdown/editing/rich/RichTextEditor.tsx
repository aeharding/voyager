import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cx } from "#/helpers/css";
import { preventModalSwipeOnTextSelection } from "#/helpers/ionic";
import useKeyboardOpen from "#/helpers/useKeyboardOpen";

import { continueListOnEnter } from "../listContinuation";
import MarkdownToolbar from "../MarkdownToolbar";
import useEditorBodyHandlers from "../useEditorBodyHandlers";
import { createRichEditor } from "./createRichEditor";
import { decorateMarkdown } from "./markdownDecorator";

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
 *
 * editate is uncontrolled (its model is initialized once), so this wrapper
 * re-initializes it whenever `text` changes from *outside* — text recovery, a
 * parent reset, HMR — rather than from editate's own edits. Without this, the
 * decorated DOM and editate's internal model would diverge and the editor would
 * stop responding.
 */
export default function RichTextEditor({
  text,
  setText,
  ...rest
}: RichTextEditorProps) {
  // The last value editate produced; anything else is an external change.
  const producedRef = useRef(text);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    if (text !== producedRef.current) {
      // External change (text recovery, parent reset, HMR) — remount the
      // instance so editate re-initializes from the new text.
      producedRef.current = text;
      setGeneration((g) => g + 1);
    }
  }, [text]);

  const handleChange = (value: string) => {
    producedRef.current = value;
    setText(value);
  };

  return (
    <RichTextEditorInstance
      key={generation}
      text={text}
      onChange={handleChange}
      {...rest}
    />
  );
}

interface RichTextEditorInstanceProps extends Omit<
  RichTextEditorProps,
  "setText"
> {
  onChange: (text: string) => void;
}

function RichTextEditorInstance({
  text,
  onChange,
  onSubmit,
  onDismiss,
  children,
}: RichTextEditorInstanceProps) {
  const keyboardOpen = useKeyboardOpen();

  // Created once per mount. `text` is the initial value; `onChange` is stable.
  const [{ controller, setHost }] = useState(() =>
    createRichEditor(text, onChange),
  );

  const { jsx, onPaste, onDropCapture, onDragOver, onKeyUpDown } =
    useEditorBodyHandlers(controller);

  const rendered = useMemo(() => {
    try {
      return decorateMarkdown(text);
    } catch {
      // Never let a decoration error break editing — fall back to plain lines
      return text.split("\n").map((line, i) => (
        <div key={i} data-block>
          {line || <br />}
        </div>
      ));
    }
  }, [text]);

  function onKeyDown(e: KeyboardEvent) {
    onKeyUpDown(e); // track the paste-as-plain modifier (shift+meta/ctrl)
    switch (e.key) {
      case "Enter":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onSubmit?.();
        } else {
          continueListOnEnter(controller, e);
        }
        break;
      case "Escape":
        onDismiss?.();
        break;
    }
  }

  return (
    <>
      {jsx}
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
          onKeyUp={onKeyUpDown}
          onPaste={onPaste}
          onDropCapture={onDropCapture}
          onDragOver={onDragOver}
          {...preventModalSwipeOnTextSelection}
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
