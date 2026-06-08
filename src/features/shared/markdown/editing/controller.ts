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

type PlainEditor = ReturnType<typeof createPlainEditor>;

function docToText(editor: PlainEditor): string {
  return editor.doc.children
    .map((block) => block.children.map((inline) => inline.text).join(""))
    .join("\n");
}

/** Locate a text node + offset for a global plain-text offset within a block. */
function offsetWithinBlock(block: HTMLElement, offset: number): [Node, number] {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let last: Node | null = null;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const len = node.textContent?.length ?? 0;
    if (remaining <= len) return [node, remaining];
    remaining -= len;
    last = node;
  }
  // Past the end (e.g. an empty line with only a <br>) — clamp to the block end
  if (last) return [last, last.textContent?.length ?? 0];
  return [block, 0];
}

/**
 * Set the DOM selection for a global offset range by walking our own
 * `data-block` line structure. editate's offset→DOM mapping goes stale when
 * React re-renders the decorated children, so we resolve positions ourselves
 * (one block per source line, joined by newlines) and let editate's
 * selectionchange listener sync its model back from the DOM.
 */
function setDomSelection(host: HTMLElement, start: number, end: number): void {
  const blocks = Array.from(host.querySelectorAll<HTMLElement>("[data-block]"));
  if (!blocks.length) return;

  const locate = (offset: number): [Node, number] => {
    let consumed = 0;
    for (const block of blocks) {
      const len = block.textContent?.length ?? 0;
      if (offset <= consumed + len) {
        return offsetWithinBlock(block, offset - consumed);
      }
      consumed += len + 1; // +1 for the newline between blocks
    }
    const lastBlock = blocks[blocks.length - 1]!;
    return offsetWithinBlock(lastBlock, lastBlock.textContent?.length ?? 0);
  };

  const [startNode, startOffset] = locate(start);
  const [endNode, endOffset] = locate(end);

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
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
  editor.on("change", release);

  return {
    getValue: () => docToText(editor),
    getSelection: () => {
      const [anchor, focus] =
        !frozen && isHostFocused() ? editor.selection : committed;
      return { start: Math.min(anchor, focus), end: Math.max(anchor, focus) };
    },
    setSelection: (start, end = start) => {
      committed = [start, end];
      // Set the model (used by an immediately-following insertText) and the DOM
      // directly — the latter is robust after a re-render, where editate's own
      // offset→DOM mapping would otherwise collapse the selection.
      editor.selection = [start, end];
      const host = getHost();
      if (host) setDomSelection(host, start, end);
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
