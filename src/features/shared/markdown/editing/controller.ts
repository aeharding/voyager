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

/**
 * Live plain-text value + caret offset read straight from the contenteditable,
 * for use while an IME composition is mid-flight (see `subscribe`). editate
 * doesn't update its model during composition, so its `doc`/`selection` lag the
 * on-screen text — but the decorator keeps the DOM an exact source mirror (one
 * `[data-block]` line per source line, raw characters preserved), so we can
 * reconstruct the same global offsets editate uses: walk text nodes in order and
 * join blocks with "\n".
 */
function liveDomState(
  host: HTMLElement | null,
): { value: string; caret: number } | null {
  if (!host) return null;
  const selection = host.ownerDocument.getSelection();
  let value = "";
  let caret: number | null = null;

  Array.from(host.children).forEach((block, i) => {
    if (i > 0) value += "\n";
    const walker = host.ownerDocument.createTreeWalker(
      block,
      NodeFilter.SHOW_TEXT,
    );
    let node: Node | null;
    while ((node = walker.nextNode()) !== null) {
      if (selection?.focusNode === node) {
        caret = value.length + selection.focusOffset;
      }
      value += node.nodeValue ?? "";
    }
    // An empty line holds only a <br>, so its caret sits on the block element
    // itself rather than on a text node.
    if (caret === null && selection?.focusNode === block) caret = value.length;
  });

  return { value, caret: caret ?? value.length };
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
  // True while an IME composition is active (see `subscribe`). editate's model
  // is stale during composition, so reads fall back to the live DOM.
  let composing = false;

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
    getValue: () => {
      if (composing) {
        const dom = liveDomState(getHost());
        if (dom) return dom.value;
      }
      return docToText(editor);
    },
    getSelection: () => {
      if (composing) {
        const dom = liveDomState(getHost());
        if (dom) return { start: dom.caret, end: dom.caret };
      }
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
    focus: () => {
      getHost()?.focus();
      // Restore the caret — focus() collapses a contenteditable to the start on
      // iOS/WebKit (same fixup as insertText). A textarea keeps its selection
      // natively, so the textarea controller needs none of this.
      editor.selection = committed;
    },
    snapshotSelection: () => {
      attachReleaseListeners();
      committed = editor.selection;
      frozen = true;
    },
    subscribe: (event, callback) => {
      if (event !== "change") return editor.on(event, callback);

      // editate records and replays IME mutations on compositionend rather than
      // updating its model mid-composition, so it emits no `change` event while
      // an Android IME (GBoard) composes a word — leaving `getValue`/
      // `getSelection` stale. Without this, the autocomplete typeahead freezes on
      // the first keystroke after `!`/`@` until the word is committed. So: track
      // composition, mirror the native `input` event while it's active (reads
      // come from the live DOM), and clear `composing` before the committed
      // `change` recompute so that one reads editate's now-fresh model.
      const host = getHost();
      const onCompositionStart = () => {
        composing = true;
      };
      const onCompositionEnd = () => {
        composing = false;
      };
      const onInput = () => {
        if (composing) callback();
      };
      const offChange = editor.on("change", () => {
        composing = false;
        callback();
      });
      host?.addEventListener("compositionstart", onCompositionStart);
      host?.addEventListener("compositionend", onCompositionEnd);
      host?.addEventListener("input", onInput);

      return () => {
        offChange();
        host?.removeEventListener("compositionstart", onCompositionStart);
        host?.removeEventListener("compositionend", onCompositionEnd);
        host?.removeEventListener("input", onInput);
      };
    },
  };
}
