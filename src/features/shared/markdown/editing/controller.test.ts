import { afterEach, describe, expect, it } from "vitest";

import { createEditateController } from "./controller";

/**
 * Tests for `createEditateController`'s snapshot/freeze logic — the stateful
 * heart of the editate backend. A contenteditable loses its selection on blur
 * (and refocusing collapses it to 0), so the controller snapshots the caret on
 * toolbar pointerdown and protects it until the action inserts or the user
 * genuinely returns to the editor.
 *
 * Driven against a fake editor implementing the slice of the editate contract
 * the controller relies on (selection get/set fires `selectionchange`;
 * `on`/`exec`/`doc`), plus a real jsdom host for focus + pointer/key events.
 */

function fakeEditor(initialText: string) {
  let value = initialText;
  let selection: readonly [number, number] = [0, 0];
  const listeners: Record<string, Set<() => void>> = {
    change: new Set(),
    selectionchange: new Set(),
  };
  const emit = (event: string) => listeners[event]?.forEach((cb) => cb());

  const editor = {
    get selection() {
      return selection;
    },
    set selection(next: readonly [number, number]) {
      if (selection[0] === next[0] && selection[1] === next[1]) return;
      selection = next;
      emit("selectionchange");
    },
    get doc() {
      return {
        children: value
          .split("\n")
          .map((line) => ({ children: [{ text: line }] })),
      };
    },
    on(event: string, cb: () => void) {
      listeners[event]?.add(cb);
      return () => listeners[event]?.delete(cb);
    },
    // The controller only ever calls exec(ReplaceText, text) — simulate it.
    exec(_command: unknown, text: string) {
      const start = Math.min(selection[0], selection[1]);
      const end = Math.max(selection[0], selection[1]);
      value = value.slice(0, start) + text + value.slice(end);
      selection = [start + text.length, start + text.length];
      emit("change");
      emit("selectionchange");
      return editor;
    },
  };
  return editor;
}

function setup(text = "hello world") {
  const editor = fakeEditor(text);
  const host = document.createElement("div");
  host.tabIndex = 0;
  document.body.appendChild(host);
  const controller = createEditateController(
    editor as unknown as Parameters<typeof createEditateController>[0],
    () => host,
  );
  return { editor, host, controller };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("createEditateController", () => {
  it("reports the live selection while the host is focused", () => {
    const { editor, host, controller } = setup();
    host.focus();
    editor.selection = [3, 5];
    expect(controller.getSelection()).toEqual({ start: 3, end: 5 });
  });

  it("normalizes a reversed selection", () => {
    const { editor, host, controller } = setup();
    host.focus();
    editor.selection = [5, 2];
    expect(controller.getSelection()).toEqual({ start: 2, end: 5 });
  });

  it("inserts at the snapshotted caret after focus leaves (toolbar action)", () => {
    const { editor, host, controller } = setup();
    host.focus();
    editor.selection = [5, 5];
    controller.snapshotSelection(); // toolbar pointerdown
    host.blur();

    controller.insertText("X");
    expect(controller.getValue()).toBe("helloX world");
  });

  it("ignores a spurious refocus-to-0 while frozen (image upload)", () => {
    const { editor, host, controller } = setup();
    host.focus();
    editor.selection = [5, 5];
    controller.snapshotSelection();

    // file picker closes -> host refocuses, caret collapses to 0
    host.focus();
    editor.selection = [0, 0];

    expect(controller.getSelection()).toEqual({ start: 5, end: 5 });
    controller.insertText("X");
    expect(controller.getValue()).toBe("helloX world");
  });

  it("follows the caret when a composition commits after the snapshot (Android GBoard)", () => {
    // On Android the IME keeps a word composing; editate's *model* selection
    // lags at where the composition started while the DOM caret advances. The
    // toolbar snapshots on pointerdown (stale), then the composition commits
    // (a `change`) with the caret now correct — the snapshot must follow it,
    // else the action lands mid-word (e.g. Quote split "> hello world").
    const { editor, host, controller } = setup("> hello ");
    host.focus();
    editor.selection = [8, 8]; // composition of "world" started here
    controller.snapshotSelection(); // toolbar pointerdown (model still lags at 8)
    host.blur(); // toolbar takes focus

    editor.exec(null, "world"); // composition commits -> "> hello world", caret 13

    expect(controller.getSelection()).toEqual({ start: 13, end: 13 });
  });

  it("releases the freeze when the user taps back into the editor (cancelled action)", () => {
    const { editor, host, controller } = setup();
    host.focus();
    editor.selection = [5, 5];
    controller.snapshotSelection(); // opened a toolbar action...

    // ...cancelled it, then tapped into the editor at a new spot
    host.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    editor.selection = [2, 2];

    expect(controller.getSelection()).toEqual({ start: 2, end: 2 });
    controller.insertText("X");
    expect(controller.getValue()).toBe("heXllo world");
  });

  it("releases the freeze on an edit", () => {
    const { editor, host, controller } = setup();
    host.focus();
    editor.selection = [5, 5];
    controller.snapshotSelection();

    editor.exec(null, "z"); // an edit fires `change`, which releases the freeze
    editor.selection = [1, 1]; // a later genuine move should now be tracked

    expect(controller.getSelection()).toEqual({ start: 1, end: 1 });
  });

  it("setSelection updates both the model and the snapshot", () => {
    const { editor, controller } = setup();
    controller.setSelection(4, 7);
    expect(editor.selection).toEqual([4, 7]);
    // host not focused -> getSelection returns the committed snapshot
    expect(controller.getSelection()).toEqual({ start: 4, end: 7 });
  });

  it("reads the document text", () => {
    const { controller } = setup("line one\nline two");
    expect(controller.getValue()).toBe("line one\nline two");
  });
});
