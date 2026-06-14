import { createPlainEditor, ReplaceText } from "editate";

/**
 * Abstraction over the two editor backends (plain `<textarea>` and the
 * editate `contenteditable`) so the toolbar, autocomplete, and insert helpers
 * don't care which one is mounted.
 *
 * All offsets are global plain-text offsets (newlines count as one char),
 * matching `textarea.selectionStart`/`selectionEnd` and editate's
 * `editor.selection` — so consumers need no coordinate conversion.
 */
export interface EditorController {
  getValue(): string;
  /** Normalized so `start <= end`. */
  getSelection(): { start: number; end: number };
  setSelection(start: number, end?: number): void;
  /** Replace the current selection with text; caret lands after it. */
  insertText(text: string): void;
  focus(): void;
  /**
   * Capture the current selection as the insertion point. Call when a toolbar
   * interaction begins (pointerdown), before focus leaves the editor — needed
   * for the contenteditable backend, which loses its selection on blur.
   */
  snapshotSelection(): void;
  /** Subscribe to text/selection changes. Returns an unsubscribe fn. */
  subscribe(event: EditorControllerEvent, callback: () => void): () => void;
}

export type EditorControllerEvent = "change" | "selectionchange";

export function createTextareaController(
  getTextarea: () => HTMLTextAreaElement | null | undefined,
): EditorController {
  return {
    getValue: () => getTextarea()?.value ?? "",
    getSelection: () => {
      const textarea = getTextarea();
      return {
        start: textarea?.selectionStart ?? 0,
        end: textarea?.selectionEnd ?? 0,
      };
    },
    setSelection: (start, end = start) =>
      getTextarea()?.setSelectionRange(start, end),
    insertText: (text) => {
      getTextarea()?.focus();
      document.execCommand("insertText", false, text);
    },
    focus: () => getTextarea()?.focus(),
    snapshotSelection: () => {
      // A textarea retains selectionStart across blur, so nothing to snapshot.
    },
    subscribe: (event, callback) => {
      if (event === "change") {
        const textarea = getTextarea();
        textarea?.addEventListener("input", callback);
        return () => textarea?.removeEventListener("input", callback);
      }

      document.addEventListener("selectionchange", callback);
      return () => document.removeEventListener("selectionchange", callback);
    },
  };
}

export interface TextareaEditor {
  controller: EditorController;
  /** Ref callback for the `<textarea>`. */
  setTextarea: (node: HTMLTextAreaElement | null) => void;
  /**
   * The current `<textarea>`, for imperative use in effects/handlers. It's a
   * plain closure variable (not a React ref), so reaching the DOM through it
   * never reads a ref during render — which keeps the component compilable by
   * the React Compiler. Mirrors `createRichEditor`'s `setHost` host handling.
   */
  getTextarea: () => HTMLTextAreaElement | null;
}

/**
 * Bundles a textarea {@link EditorController} with the element it operates on,
 * captured via a ref callback into a plain variable (never a React ref read
 * during render).
 */
export function createTextareaEditor(): TextareaEditor {
  let textarea: HTMLTextAreaElement | null = null;
  return {
    controller: createTextareaController(() => textarea),
    setTextarea: (node) => {
      textarea = node;
    },
    getTextarea: () => textarea,
  };
}

type PlainEditor = ReturnType<typeof createPlainEditor>;

function docToText(editor: PlainEditor): string {
  return editor.doc.children
    .map((block) => block.children.map((inline) => inline.text).join(""))
    .join("\n");
}

export function createEditateController(
  editor: PlainEditor,
  getHost: () => HTMLElement | null,
): EditorController {
  // A contenteditable loses its DOM selection on blur, and refocusing collapses
  // the caret to the start (unlike a textarea, which retains selectionStart).
  // Toolbar actions blur the editor — image upload even refocuses it mid-flow —
  // so we keep a "committed" selection: snapshotted when a toolbar interaction
  // begins (pointerdown) and frozen against spurious selection changes until the
  // action inserts or the user genuinely returns to the editor.
  let committed: readonly [number, number] = editor.selection;
  let frozen = false;

  const isHostFocused = () => {
    const host = getHost();
    return (
      !!host &&
      (host === document.activeElement || host.contains(document.activeElement))
    );
  };

  const release = () => {
    frozen = false;
  };

  // The freeze must survive a *spurious* refocus (e.g. closing the image picker
  // collapses the caret to 0) but end on a *genuine* return to the editor.
  // Distinguish them: only a real user interaction with the host — a tap, a
  // key, or an edit — releases the freeze. Listeners are attached lazily once a
  // snapshot is taken (by which point the host is mounted).
  let releaseListenersAttached = false;
  const attachReleaseListeners = () => {
    const host = getHost();
    if (!host || releaseListenersAttached) return;
    releaseListenersAttached = true;
    host.addEventListener("pointerdown", release);
    host.addEventListener("keydown", release);
  };

  editor.on("selectionchange", () => {
    if (!frozen && isHostFocused()) committed = editor.selection;
  });
  editor.on("change", () => {
    // A model change carries the post-edit caret. If a toolbar snapshot is
    // frozen and waiting to act, follow that caret before releasing — this is
    // how an IME composition committing (Android GBoard) updates an otherwise
    // stale snapshot: at toolbar pointerdown the composition's model selection
    // still lags at where it started, and only catches up when it commits.
    if (frozen) committed = editor.selection;
    release();
  });

  return {
    getValue: () => docToText(editor),
    getSelection: () => {
      const [anchor, focus] =
        !frozen && isHostFocused() ? editor.selection : committed;
      return { start: Math.min(anchor, focus), end: Math.max(anchor, focus) };
    },
    setSelection: (start, end = start) => {
      committed = [start, end];
      editor.selection = [start, end];
    },
    insertText: (text) => {
      getHost()?.focus();
      // Restore the captured caret (focus() may have collapsed it to the start)
      editor.selection = committed;
      editor.exec(ReplaceText, text);
      committed = editor.selection;
      frozen = false;
    },
    focus: () => getHost()?.focus(),
    snapshotSelection: () => {
      attachReleaseListeners();
      committed = editor.selection;
      frozen = true;
    },
    subscribe: (event, callback) => editor.on(event, callback),
  };
}
