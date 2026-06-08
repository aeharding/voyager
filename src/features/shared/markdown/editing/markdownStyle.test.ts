import { describe, expect, it } from "vitest";

import { EditorController } from "./controller";
import { applyMarkdownStyle, BOLD, ITALIC, QUOTE } from "./markdownStyle";

/**
 * Cases ported (close to verbatim) from `@github/markdown-toolbar-element`'s
 * test suite to verify our port of its styling logic preserves the original
 * toggle / word-expansion / surround-with-newlines behaviors.
 * Source: https://github.com/github/markdown-toolbar-element/blob/main/test/test.js
 *
 * The `|` marker convention matches upstream: `a |b| c` selects "b"; `a |b`
 * is a collapsed caret. We run against an in-memory controller whose insertText
 * mirrors a textarea (replace selection, caret after).
 */

function createMemoryController(visual: string): EditorController {
  const parts = visual.split("|");
  const state = { value: parts.join(""), selectionStart: 0, selectionEnd: 0 };
  if (parts.length === 2) {
    state.selectionStart = state.selectionEnd = parts[0]!.length;
  } else if (parts.length === 3) {
    state.selectionStart = parts[0]!.length;
    state.selectionEnd = state.selectionStart + parts[1]!.length;
  }

  const noop = () => {
    // controller side effects (focus/snapshot/subscribe) are irrelevant here
  };

  return {
    getValue: () => state.value,
    getSelection: () => ({
      start: Math.min(state.selectionStart, state.selectionEnd),
      end: Math.max(state.selectionStart, state.selectionEnd),
    }),
    setSelection: (start, end = start) => {
      state.selectionStart = start;
      state.selectionEnd = end;
    },
    insertText: (text) => {
      const before = state.value.slice(0, state.selectionStart);
      const after = state.value.slice(state.selectionEnd);
      state.value = before + text + after;
      state.selectionStart = state.selectionEnd =
        state.selectionStart + text.length;
    },
    focus: noop,
    snapshotSelection: noop,
    subscribe: () => noop,
  };
}

/** Apply a style and return the result in the `|`-marker visual format. */
function applyStyle(input: string, style: Partial<typeof BOLD>): string {
  const controller = createMemoryController(input);
  applyMarkdownStyle(controller, style);

  const value = controller.getValue();
  const { start, end } = controller.getSelection();
  const before = value.slice(0, start);
  const selection = value.slice(start, end);
  const after = value.slice(end);
  return selection ? `${before}|${selection}|${after}` : `${before}|${after}`;
}

describe("bold", () => {
  it("bold selected text when you click the bold icon", () => {
    expect(
      applyStyle("The |quick| brown fox jumps over the lazy dog", BOLD),
    ).toBe("The **|quick|** brown fox jumps over the lazy dog");
  });

  it("bold empty selection inserts ** with cursor ready to type inside", () => {
    expect(applyStyle("|", BOLD)).toBe("**|**");
  });

  it("bold empty selection with previous text inserts ** ready inside", () => {
    expect(applyStyle("The |", BOLD)).toBe("The **|**");
  });

  it("bold when there is leading whitespace in selection", () => {
    expect(applyStyle("|\n \t Hello world|", BOLD)).toBe(
      "\n \t **|Hello world|**",
    );
  });

  it("bold when there is trailing whitespace in selection", () => {
    expect(applyStyle("|Hello world \n|", BOLD)).toBe("**|Hello world|** \n");
  });

  it("bold selected word when cursor is at the start of the word", () => {
    expect(
      applyStyle("The |quick brown fox jumps over the lazy dog", BOLD),
    ).toBe("The **|quick** brown fox jumps over the lazy dog");
  });

  it("bold selected word when cursor is in the middle of the word", () => {
    expect(
      applyStyle("The qui|ck brown fox jumps over the lazy dog", BOLD),
    ).toBe("The **qui|ck** brown fox jumps over the lazy dog");
  });

  it("bold selected word when cursor is at the end of the word", () => {
    expect(
      applyStyle("The quick| brown fox jumps over the lazy dog", BOLD),
    ).toBe("The **quick|** brown fox jumps over the lazy dog");
  });

  it("bold selected word when cursor is at the start of the first word", () => {
    expect(
      applyStyle("|The quick brown fox jumps over the lazy dog", BOLD),
    ).toBe("**|The** quick brown fox jumps over the lazy dog");
  });

  it("bold selected word when cursor is in the middle of the first word", () => {
    expect(
      applyStyle("T|he quick brown fox jumps over the lazy dog", BOLD),
    ).toBe("**T|he** quick brown fox jumps over the lazy dog");
  });

  it("bold selected word when cursor is at the end of the first word", () => {
    expect(
      applyStyle("The| quick brown fox jumps over the lazy dog", BOLD),
    ).toBe("**The|** quick brown fox jumps over the lazy dog");
  });

  it("unbolds selected bold inner text when you click the bold icon", () => {
    expect(
      applyStyle("The **|quick|** brown fox jumps over the lazy dog", BOLD),
    ).toBe("The |quick| brown fox jumps over the lazy dog");
  });

  it("unbolds selected bold outer text when you click the bold icon", () => {
    expect(
      applyStyle("The |**quick**| brown fox jumps over the lazy dog", BOLD),
    ).toBe("The |quick| brown fox jumps over the lazy dog");
  });

  it("unbold selected word when cursor is at the start of the word", () => {
    expect(
      applyStyle("The **|quick** brown fox jumps over the lazy dog", BOLD),
    ).toBe("The |quick brown fox jumps over the lazy dog");
  });

  it("unbold selected word when cursor is in the middle of the word", () => {
    expect(
      applyStyle("The **qui|ck** brown fox jumps over the lazy dog", BOLD),
    ).toBe("The qui|ck brown fox jumps over the lazy dog");
  });

  it("unbold selected word when cursor is at the end of the word", () => {
    expect(
      applyStyle("The **quick|** brown fox jumps over the lazy dog", BOLD),
    ).toBe("The quick| brown fox jumps over the lazy dog");
  });

  it("unbold selected word when cursor is before the bold syntax", () => {
    expect(
      applyStyle("The |**quick** brown fox jumps over the lazy dog", BOLD),
    ).toBe("The |quick brown fox jumps over the lazy dog");
  });

  it("unbold selected word when cursor is after the bold syntax", () => {
    expect(
      applyStyle("The **quick**| brown fox jumps over the lazy dog", BOLD),
    ).toBe("The quick| brown fox jumps over the lazy dog");
  });

  it("unbold selected word when cursor is at the start of the first word", () => {
    expect(
      applyStyle("**|The** quick brown fox jumps over the lazy dog", BOLD),
    ).toBe("|The quick brown fox jumps over the lazy dog");
  });

  it("unbold selected word when cursor is in the middle of the first word", () => {
    expect(
      applyStyle("**T|he** quick brown fox jumps over the lazy dog", BOLD),
    ).toBe("T|he quick brown fox jumps over the lazy dog");
  });

  it("unbold selected word when cursor is at the end of the first word", () => {
    expect(
      applyStyle("**The|** quick brown fox jumps over the lazy dog", BOLD),
    ).toBe("The| quick brown fox jumps over the lazy dog");
  });
});

describe("italic", () => {
  it("italicizes selected text when you click the italics icon", () => {
    expect(
      applyStyle("The |quick| brown fox jumps over the lazy dog", ITALIC),
    ).toBe("The _|quick|_ brown fox jumps over the lazy dog");
  });

  it("italicize when there is leading whitespace in selection", () => {
    expect(applyStyle("|  \nHello world|", ITALIC)).toBe("  \n_|Hello world|_");
  });

  it("italicize when there is trailing whitespace in selection", () => {
    expect(applyStyle("|Hello world\n \t|", ITALIC)).toBe(
      "_|Hello world|_\n \t",
    );
  });

  it("italicize empty selection inserts _ with cursor ready to type inside", () => {
    expect(applyStyle("|", ITALIC)).toBe("_|_");
  });

  it("italicize empty selection with previous text inserts _ ready inside", () => {
    expect(applyStyle("The |", ITALIC)).toBe("The _|_");
  });

  it("italicize selected word when cursor is at the start of the word", () => {
    expect(
      applyStyle("The |quick brown fox jumps over the lazy dog", ITALIC),
    ).toBe("The _|quick_ brown fox jumps over the lazy dog");
  });

  it("italicize selected word when cursor is in the middle of the word", () => {
    expect(
      applyStyle("The qui|ck brown fox jumps over the lazy dog", ITALIC),
    ).toBe("The _qui|ck_ brown fox jumps over the lazy dog");
  });

  it("italicize selected word when cursor is at the end of the word", () => {
    expect(
      applyStyle("The quick| brown fox jumps over the lazy dog", ITALIC),
    ).toBe("The _quick|_ brown fox jumps over the lazy dog");
  });

  it("unitalicizes selected italic text when you click the italic icon", () => {
    expect(
      applyStyle("The _|quick|_ brown fox jumps over the lazy dog", ITALIC),
    ).toBe("The |quick| brown fox jumps over the lazy dog");
  });
});

describe("quote", () => {
  it("inserts selected quoted sample if you click the quote icon", () => {
    expect(applyStyle("", QUOTE)).toBe("> |");
  });

  it("quotes the selected text when you click the quote icon", () => {
    expect(
      applyStyle(
        "|Butts|\n\nThe quick brown fox jumps over the lazy dog",
        QUOTE,
      ),
    ).toBe("> |Butts|\n\nThe quick brown fox jumps over the lazy dog");
  });

  it("quotes full line of text when you click the quote icon", () => {
    expect(
      applyStyle("|The quick brown fox jumps over the lazy dog", QUOTE),
    ).toBe("> |The quick brown fox jumps over the lazy dog");
  });

  it("prefixes newlines when quoting an existing line", () => {
    expect(
      applyStyle("The quick brown fox jumps over the lazy dog|Butts|", QUOTE),
    ).toBe("The quick brown fox jumps over the lazy dog\n\n> |Butts|");
  });

  it("quotes multiple lines when you click the quote icon", () => {
    expect(
      applyStyle(
        "|Hey,\n\nThis looks great.\n\nThanks,\nJosh|\n\nEmailed me that last week.",
        QUOTE,
      ),
    ).toBe(
      "|> Hey,\n> \n> This looks great.\n> \n> Thanks,\n> Josh|\n\nEmailed me that last week.",
    );
  });

  it("unquotes multiple lines when you click the quote icon", () => {
    expect(
      applyStyle(
        "|> Hey,\n> \n> This looks great.\n> \n> Thanks,\n> Josh|\n\nEmailed me that last week.",
        QUOTE,
      ),
    ).toBe(
      "|Hey,\n\nThis looks great.\n\nThanks,\nJosh|\n\nEmailed me that last week.",
    );
  });
});
