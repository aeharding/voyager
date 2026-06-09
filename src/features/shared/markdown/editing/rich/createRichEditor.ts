import { createPlainEditor } from "editate";

import { createEditateController, EditorController } from "../controller";

export interface RichEditorHandle {
  controller: EditorController;
  /**
   * Ref callback for the contenteditable host element. Attaches editate on
   * mount (element) and detaches on unmount (null).
   */
  setHost: (element: HTMLElement | null) => void;
}

/**
 * Encapsulates the imperative editate instance, its controller, and host
 * attachment so the React component stays declarative. Lives outside the
 * component on purpose — host access goes through a plain closure variable
 * (not a React ref), and the editate instance is mutated here rather than in a
 * component effect, both of which keep the React Compiler happy.
 */
export function createRichEditor(
  initialText: string,
  onChange: (text: string) => void,
): RichEditorHandle {
  const editor = createPlainEditor({
    text: initialText,
    isBlock: (node) => !!node.dataset.block,
    onChange,
  });

  let host: HTMLElement | null = null;
  let detach: (() => void) | null = null;
  let focusTimeout: ReturnType<typeof setTimeout> | undefined;

  const controller = createEditateController(editor, () => host);

  const focusToEnd = () => {
    host?.focus({ preventScroll: true });
    const len = controller.getValue().length;
    editor.selection = [len, len];
  };

  const setHost = (element: HTMLElement | null) => {
    if (element) {
      host = element;
      detach = editor.input(element);
      focusToEnd();
      // iOS safari native has a focus race sometimes (mirrors textarea Editor)
      focusTimeout = setTimeout(focusToEnd, 100);
    } else {
      clearTimeout(focusTimeout);
      detach?.();
      detach = null;
      host = null;
    }
  };

  return { controller, setHost };
}
