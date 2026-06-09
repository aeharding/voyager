import type { KeyboardEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { EditorController } from "./controller";
import { continueListOnEnter } from "./listContinuation";

/**
 * The helper drives an {@link EditorController}, so it must behave identically on
 * both backends. They differ only in where `insertText` reads its range:
 * - "snapshot" (editate): from the snapshot that `setSelection`/`snapshotSelection` set.
 * - "live" (textarea): from the live selection directly (`snapshotSelection` is a no-op).
 * We run every case against both to prove parity.
 */
type Mode = "snapshot" | "live";

function makeController(
  mode: Mode,
  value: string,
  anchor: number,
  focus = anchor,
) {
  const state = {
    value,
    sel: [anchor, focus] as [number, number],
    committed: [anchor, focus] as [number, number],
  };
  const range = (r: [number, number]) =>
    [Math.min(...r), Math.max(...r)] as const;

  const controller: EditorController = {
    getValue: () => state.value,
    getSelection: () => {
      const [start, end] = range(state.sel);
      return { start, end };
    },
    setSelection: (s, e = s) => {
      state.sel = [s, e];
      state.committed = [s, e];
    },
    snapshotSelection: () => {
      if (mode === "snapshot") state.committed = [...state.sel];
    },
    insertText: (text) => {
      const [a, b] = range(mode === "snapshot" ? state.committed : state.sel);
      state.value = state.value.slice(0, a) + text + state.value.slice(b);
      const caret = a + text.length;
      state.sel = [caret, caret];
      state.committed = [caret, caret];
    },
    focus: () => {
      // no-op: tests don't touch the DOM
    },
    subscribe: () => () => {
      // no-op unsubscribe
    },
  };
  return { controller, state };
}

function press(
  mode: Mode,
  value: string,
  anchor: number,
  focus = anchor,
  isComposing = false,
) {
  const { controller, state } = makeController(mode, value, anchor, focus);
  const preventDefault = vi.fn();
  const event = {
    nativeEvent: { isComposing },
    preventDefault,
  } as unknown as KeyboardEvent;
  const handled = continueListOnEnter(controller, event);
  return {
    handled,
    prevented: preventDefault.mock.calls.length > 0,
    value: state.value,
    caret: state.sel[0],
  };
}

describe.each<Mode>(["snapshot", "live"])(
  "continueListOnEnter (%s backend)",
  (mode) => {
    const at = (value: string, caret: number, ...rest: [number?, boolean?]) =>
      press(mode, value, caret, ...rest);

    it("continues an unordered item (- / * / +)", () => {
      for (const m of ["-", "*", "+"]) {
        const r = at(`${m} a`, 3);
        expect(r.handled).toBe(true);
        expect(r.prevented).toBe(true);
        expect(r.value).toBe(`${m} a\n${m} `);
        expect(r.caret).toBe(6);
      }
    });

    it("continues and increments an ordered item", () => {
      expect(at("1. a", 4).value).toBe("1. a\n2. ");
      expect(at("3. a", 4).value).toBe("3. a\n4. ");
    });

    it("works on a line that isn't the first", () => {
      const r = at("foo\n- bar", 9);
      expect(r.value).toBe("foo\n- bar\n- ");
      expect(r.caret).toBe(12);
    });

    it("splits the item when the caret is mid-line", () => {
      const r = at("- helloworld", 7); // caret before "world"
      expect(r.value).toBe("- hello\n- world");
      expect(r.caret).toBe(10);
    });

    it("exits the list on an empty item (drops the marker)", () => {
      const unordered = at("- ", 2);
      expect(unordered.handled).toBe(true);
      expect(unordered.value).toBe("");
      expect(unordered.caret).toBe(0);

      expect(at("2. ", 3).value).toBe("");
    });

    it("exits an empty nested marker without leftover newline", () => {
      const r = at("- a\n- ", 6); // second item is empty
      expect(r.value).toBe("- a\n");
      expect(r.caret).toBe(4);
    });

    it("stops auto-numbering at 9 (lets the default newline happen)", () => {
      const r = at("9. a", 4);
      expect(r.handled).toBe(false);
      expect(r.prevented).toBe(false);
      expect(r.value).toBe("9. a");
    });

    it("ignores non-list lines", () => {
      const r = at("hello", 5);
      expect(r.handled).toBe(false);
      expect(r.value).toBe("hello");
    });

    it("ignores a non-collapsed selection", () => {
      expect(at("- abc", 2, 4).handled).toBe(false);
    });

    it("ignores Enter during IME composition", () => {
      expect(at("- a", 3, 3, true).handled).toBe(false);
    });
  },
);
