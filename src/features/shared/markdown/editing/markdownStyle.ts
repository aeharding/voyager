import { EditorController } from "./controller";

/**
 * Toolbar styling logic (bold / italic / quote) ported from
 * `@github/markdown-toolbar-element` to operate on an {@link EditorController}
 * instead of a `<textarea>`, so the same behaviors — toggling a style on/off,
 * expanding a bare caret to the surrounding word, surrounding block styles with
 * blank lines — work for both the textarea and editate (contenteditable)
 * backends.
 *
 * Source: https://github.com/github/markdown-toolbar-element (MIT)
 */

interface StyleArgs {
  prefix: string;
  suffix: string;
  blockPrefix: string;
  blockSuffix: string;
  multiline: boolean;
  replaceNext: string;
  prefixSpace: boolean;
  scanFor: string;
  surroundWithNewlines: boolean;
  trimFirst: boolean;
}

/** A minimal textarea-like target the ported logic reads from and mutates. */
interface Field {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

interface StyleResult {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

const defaults: StyleArgs = {
  prefix: "",
  suffix: "",
  blockPrefix: "",
  blockSuffix: "",
  multiline: false,
  replaceNext: "",
  prefixSpace: false,
  scanFor: "",
  surroundWithNewlines: false,
  trimFirst: false,
};

export const BOLD: Partial<StyleArgs> = {
  prefix: "**",
  suffix: "**",
  trimFirst: true,
};
export const ITALIC: Partial<StyleArgs> = {
  prefix: "_",
  suffix: "_",
  trimFirst: true,
};
export const QUOTE: Partial<StyleArgs> = {
  prefix: "> ",
  multiline: true,
  surroundWithNewlines: true,
};

function isMultipleLines(string: string): boolean {
  return string.trim().split("\n").length > 1;
}

function repeat(string: string, n: number): string {
  return Array(n + 1).join(string);
}

function wordSelectionStart(text: string, i: number): number {
  let index = i;
  while (
    text[index] &&
    text[index - 1] != null &&
    !text[index - 1]!.match(/\s/)
  ) {
    index--;
  }
  return index;
}

function wordSelectionEnd(text: string, i: number, multiline: boolean): number {
  let index = i;
  const breakpoint = multiline ? /\n/ : /\s/;
  while (text[index] && !text[index]!.match(breakpoint)) {
    index++;
  }
  return index;
}

function expandSelectedText(
  field: Field,
  prefixToUse: string,
  suffixToUse: string,
  multiline: boolean,
): string {
  if (field.selectionStart === field.selectionEnd) {
    field.selectionStart = wordSelectionStart(
      field.value,
      field.selectionStart,
    );
    field.selectionEnd = wordSelectionEnd(
      field.value,
      field.selectionEnd,
      multiline,
    );
  } else {
    const expandedSelectionStart = field.selectionStart - prefixToUse.length;
    const expandedSelectionEnd = field.selectionEnd + suffixToUse.length;
    const beginsWithPrefix =
      field.value.slice(expandedSelectionStart, field.selectionStart) ===
      prefixToUse;
    const endsWithSuffix =
      field.value.slice(field.selectionEnd, expandedSelectionEnd) ===
      suffixToUse;
    if (beginsWithPrefix && endsWithSuffix) {
      field.selectionStart = expandedSelectionStart;
      field.selectionEnd = expandedSelectionEnd;
    }
  }
  return field.value.slice(field.selectionStart, field.selectionEnd);
}

function newlinesToSurroundSelectedText(field: Field): {
  newlinesToAppend: string;
  newlinesToPrepend: string;
} {
  const beforeSelection = field.value.slice(0, field.selectionStart);
  const afterSelection = field.value.slice(field.selectionEnd);

  const breaksBefore = beforeSelection.match(/\n*$/);
  const breaksAfter = afterSelection.match(/^\n*/);
  const newlinesBeforeSelection = breaksBefore ? breaksBefore[0].length : 0;
  const newlinesAfterSelection = breaksAfter ? breaksAfter[0].length : 0;

  let newlinesToAppend = "";
  let newlinesToPrepend = "";
  if (beforeSelection.match(/\S/) && newlinesBeforeSelection < 2) {
    newlinesToAppend = repeat("\n", 2 - newlinesBeforeSelection);
  }
  if (afterSelection.match(/\S/) && newlinesAfterSelection < 2) {
    newlinesToPrepend = repeat("\n", 2 - newlinesAfterSelection);
  }

  return { newlinesToAppend, newlinesToPrepend };
}

function blockStyle(field: Field, arg: StyleArgs): StyleResult {
  const {
    prefix,
    suffix,
    blockPrefix,
    blockSuffix,
    replaceNext,
    prefixSpace,
    scanFor,
    surroundWithNewlines,
  } = arg;
  const originalSelectionStart = field.selectionStart;
  const originalSelectionEnd = field.selectionEnd;

  let selectedText = field.value.slice(
    field.selectionStart,
    field.selectionEnd,
  );
  let prefixToUse =
    isMultipleLines(selectedText) && blockPrefix.length > 0
      ? `${blockPrefix}\n`
      : prefix;
  let suffixToUse =
    isMultipleLines(selectedText) && blockSuffix.length > 0
      ? `\n${blockSuffix}`
      : suffix;

  if (prefixSpace) {
    const beforeSelection = field.value[field.selectionStart - 1];
    if (
      field.selectionStart !== 0 &&
      beforeSelection != null &&
      !beforeSelection.match(/\s/)
    ) {
      prefixToUse = ` ${prefixToUse}`;
    }
  }

  selectedText = expandSelectedText(
    field,
    prefixToUse,
    suffixToUse,
    arg.multiline,
  );
  let selectionStart = field.selectionStart;
  let selectionEnd: number;
  const hasReplaceNext =
    replaceNext.length > 0 &&
    suffixToUse.indexOf(replaceNext) > -1 &&
    selectedText.length > 0;

  if (surroundWithNewlines) {
    const ref = newlinesToSurroundSelectedText(field);
    prefixToUse = ref.newlinesToAppend + prefix;
    suffixToUse += ref.newlinesToPrepend;
  }

  if (
    selectedText.startsWith(prefixToUse) &&
    selectedText.endsWith(suffixToUse)
  ) {
    const replacementText = selectedText.slice(
      prefixToUse.length,
      selectedText.length - suffixToUse.length,
    );
    if (originalSelectionStart === originalSelectionEnd) {
      let position = originalSelectionStart - prefixToUse.length;
      position = Math.max(position, selectionStart);
      position = Math.min(position, selectionStart + replacementText.length);
      selectionStart = selectionEnd = position;
    } else {
      selectionEnd = selectionStart + replacementText.length;
    }
    return { text: replacementText, selectionStart, selectionEnd };
  } else if (!hasReplaceNext) {
    let replacementText = prefixToUse + selectedText + suffixToUse;
    selectionStart = originalSelectionStart + prefixToUse.length;
    selectionEnd = originalSelectionEnd + prefixToUse.length;
    const whitespaceEdges = selectedText.match(/^\s*|\s*$/g);
    if (arg.trimFirst && whitespaceEdges) {
      const leadingWhitespace = whitespaceEdges[0] || "";
      const trailingWhitespace = whitespaceEdges[1] || "";
      replacementText =
        leadingWhitespace +
        prefixToUse +
        selectedText.trim() +
        suffixToUse +
        trailingWhitespace;
      selectionStart += leadingWhitespace.length;
      selectionEnd -= trailingWhitespace.length;
    }
    return { text: replacementText, selectionStart, selectionEnd };
  } else if (scanFor.length > 0 && selectedText.match(scanFor)) {
    suffixToUse = suffixToUse.replace(replaceNext, selectedText);
    const replacementText = prefixToUse + suffixToUse;
    selectionStart = selectionEnd = selectionStart + prefixToUse.length;
    return { text: replacementText, selectionStart, selectionEnd };
  } else {
    const replacementText = prefixToUse + selectedText + suffixToUse;
    selectionStart =
      selectionStart +
      prefixToUse.length +
      selectedText.length +
      suffixToUse.indexOf(replaceNext);
    selectionEnd = selectionStart + replaceNext.length;
    return { text: replacementText, selectionStart, selectionEnd };
  }
}

function multilineStyle(field: Field, arg: StyleArgs): StyleResult {
  const { prefix, suffix, surroundWithNewlines } = arg;
  let text = field.value.slice(field.selectionStart, field.selectionEnd);
  let selectionStart = field.selectionStart;
  let selectionEnd = field.selectionEnd;
  const lines = text.split("\n");
  const undoStyle = lines.every(
    (line) => line.startsWith(prefix) && line.endsWith(suffix),
  );

  if (undoStyle) {
    text = lines
      .map((line) => line.slice(prefix.length, line.length - suffix.length))
      .join("\n");
    selectionEnd = selectionStart + text.length;
  } else {
    text = lines.map((line) => prefix + line + suffix).join("\n");
    if (surroundWithNewlines) {
      const { newlinesToAppend, newlinesToPrepend } =
        newlinesToSurroundSelectedText(field);
      selectionStart += newlinesToAppend.length;
      selectionEnd = selectionStart + text.length;
      text = newlinesToAppend + text + newlinesToPrepend;
    }
  }

  return { text, selectionStart, selectionEnd };
}

/**
 * Applies a markdown style (e.g. {@link BOLD}) to the controller's current
 * selection, reproducing the GitHub toolbar's toggle/expand/surround behaviors.
 */
export function applyMarkdownStyle(
  controller: EditorController,
  stylesToApply: Partial<StyleArgs>,
): void {
  const arg: StyleArgs = { ...defaults, ...stylesToApply };
  const selection = controller.getSelection();
  const field: Field = {
    value: controller.getValue(),
    selectionStart: selection.start,
    selectionEnd: selection.end,
  };

  const selectedText = field.value.slice(
    field.selectionStart,
    field.selectionEnd,
  );
  const result =
    arg.multiline && isMultipleLines(selectedText)
      ? multilineStyle(field, arg)
      : blockStyle(field, arg);

  // `field.selectionStart/End` were mutated to the (possibly expanded) range to
  // replace; `result` is the replacement text + the resulting selection.
  controller.focus();
  controller.setSelection(field.selectionStart, field.selectionEnd);
  controller.insertText(result.text);
  controller.setSelection(result.selectionStart, result.selectionEnd);
}
