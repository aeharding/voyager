import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { preventModalSwipeOnTextSelection } from "#/helpers/ionic";

import { EditorProps } from "../Editor";
import EditorFrame from "../EditorFrame";
import useEditorBodyHandlers from "../useEditorBodyHandlers";
import { createRichEditor } from "./createRichEditor";
import { decorateMarkdownToHtml } from "./markdownDecorator";

import styles from "./RichTextEditor.module.css";

export interface RichTextEditorProps extends EditorProps {}

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
  ref,
}: RichTextEditorInstanceProps) {
  // Created once per mount. `text` is the initial value; `onChange` is stable.
  const [{ controller, setHost }] = useState(() =>
    createRichEditor(text, onChange),
  );

  useImperativeHandle(ref, () => controller, [controller]);

  const { jsx, onPaste, onDropCapture, onDragOver, onKeyDown, onKeyUp } =
    useEditorBodyHandlers(controller, { onSubmit, onDismiss });

  // Rendered as an HTML string via dangerouslySetInnerHTML (not React child
  // elements) so React never reconciles nodes inside the contenteditable — the
  // browser/IME mutate that subtree, and React-managed children there crash
  // with a stale `removeChild` on Android (composition, rapid backspace, …).
  const rendered = useMemo(() => decorateMarkdownToHtml(text), [text]);

  return (
    <EditorFrame controller={controller} text={text} uploadProgress={jsx}>
      <div
        ref={setHost}
        className={styles.editor}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onPasteCapture={onPaste}
        onDropCapture={onDropCapture}
        onDragOver={onDragOver}
        {...preventModalSwipeOnTextSelection}
        autoCapitalize="on"
        autoCorrect="on"
        spellCheck
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
      {children}
    </EditorFrame>
  );
}
