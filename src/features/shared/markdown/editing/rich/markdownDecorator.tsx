import spoiler from "@aeharding/remark-lemmy-spoiler";
import superSub from "@aeharding/remark-lemmy-supersub";
import { parse, postprocess, preprocess } from "micromark";
import type { ReactElement, ReactNode } from "react";
import remarkParse from "remark-parse";
import { unified } from "unified";

import { cx } from "#/helpers/css";

import customRemarkGfm from "../../customRemarkGfm";

import styles from "./RichTextEditor.module.css";

/**
 * Decorates markdown *source* for the rich editor by tokenizing it with
 * micromark — the lexer remark/mdast are built on — and styling each token in
 * place. The text the user typed is never rewritten, only wrapped in styled
 * spans, so editate keeps treating the contents as plain markdown.
 *
 * Why micromark tokens (not the mdast tree): mdast is an *abstract* tree that
 * normalizes syntax away, so a node's source position can span markers that
 * don't belong to it (e.g. a fenced-code node inside a blockquote whose
 * position includes the `>` continuation markers). Reverse-engineering syntax
 * back out of mdast positions is fragile. micromark's token stream is the
 * opposite: a flat list of precisely-positioned syntactic tokens where the `>`
 * is always its own `blockQuoteMarker`, the language is `codeFencedFenceInfo`,
 * the code is `codeFlowValue`, etc. — regardless of nesting. So decoration
 * becomes a direct token-type → style mapping, which is how syntax highlighters
 * work and why this handles markdown's nesting/edge cases for free.
 *
 * The pipeline: `collectLeaves` (tokenize) → `ownerByOffset` (assign each
 * character to its token) → per line, `lineRuns` (group) + `blockStyle` (line
 * attributes) → one `<div data-block>`.
 */

// --- Tokenizing ------------------------------------------------------------

type ParseOptions = NonNullable<Parameters<typeof parse>[0]>;

// The micromark extension set is independent of `connectedInstance` (that only
// affects autolink tree-building, not tokenization), so build it once. Reusing
// the same unified plugin set as Markdown rendering keeps the flavor identical.
let extensionsCache: ParseOptions["extensions"];
function micromarkExtensions(): ParseOptions["extensions"] {
  if (!extensionsCache) {
    const processor = unified()
      .use(remarkParse)
      .use(superSub)
      .use(customRemarkGfm, { connectedInstance: "" })
      .use(spoiler);
    processor.freeze();
    extensionsCache = (processor.data("micromarkExtensions") ??
      []) as ParseOptions["extensions"];
  }
  return extensionsCache;
}

interface Leaf {
  start: number;
  end: number;
  type: string;
  /** Ancestor token types, outermost first (excludes the leaf's own type). */
  stack: string[];
}

/**
 * Tokenizes the source into its *leaf* tokens — a token whose `exit` immediately
 * follows its `enter` (no children). Leaves carry the actual source characters;
 * their ancestor stack carries the semantic context (inside
 * strong/emphasis/link/codeFenced/…).
 */
function collectLeaves(source: string): Leaf[] {
  const events = postprocess(
    parse({ extensions: micromarkExtensions() })
      .document()
      .write(preprocess()(source, "utf8", true)),
  );

  const leaves: Leaf[] = [];
  const stack: string[] = [];
  let prevWasEnterOf: (typeof events)[number][1] | null = null;

  for (const [phase, token] of events) {
    if (phase === "enter") {
      stack.push(token.type);
      prevWasEnterOf = token;
    } else {
      if (prevWasEnterOf === token) {
        leaves.push({
          start: token.start.offset,
          end: token.end.offset,
          type: token.type,
          stack: stack.slice(0, -1),
        });
      }
      stack.pop();
      prevWasEnterOf = null;
    }
  }

  return leaves;
}

/**
 * Maps each source offset to the leaf that owns it. micromark can emit
 * *overlapping* leaves (a `lineEnding` `"\n> "` alongside the `blockQuoteMarker`
 * `">"` inside it); we resolve that by painting widest-first so the *narrowest*
 * (most specific) token wins. Offsets with no token stay `undefined` and render
 * as plain text — preserving the text-fidelity invariant.
 */
function ownerByOffset(leaves: Leaf[], length: number): (Leaf | undefined)[] {
  const owners: (Leaf | undefined)[] = new Array(length);
  const width = (leaf: Leaf) => leaf.end - leaf.start;

  for (const leaf of [...leaves].sort((a, b) => width(b) - width(a))) {
    for (let o = leaf.start; o < leaf.end && o < length; o++) owners[o] = leaf;
  }
  return owners;
}

// --- Styling ---------------------------------------------------------------

/** Leaf token types that are pure markdown syntax — rendered muted (grey). */
const SYNTAX_LEAF = new Set<string>([
  "strongSequence",
  "emphasisSequence",
  "strikethroughSequence",
  "atxHeadingSequence",
  "codeTextSequence",
  "codeFencedFenceSequence",
  "labelMarker",
  "labelImageMarker",
  "resourceMarker",
  "supMarker",
  "subMarker",
  "spoilerSequence",
  "spoilerKeyword",
  "listItemMarker",
  "listItemValue",
  "listItemPrefixWhitespace",
  "blockQuoteMarker",
  "blockQuotePrefixWhitespace",
  "escapeMarker",
  "thematicBreakSequence",
  "whitespace",
]);

/** The CSS class string a leaf earns from its token type + ancestor context. */
function classNamesFor(leaf: Leaf): string {
  const { type, stack } = leaf;
  const within = (ancestor: string) => stack.includes(ancestor);

  // Syntax markers (incl. the fenced-code language) read muted. The ^/~ markers
  // also ride their content's vertical shift, so the whole ^x^ / ~x~ moves as one.
  if (SYNTAX_LEAF.has(type) || within("codeFencedFenceInfo")) {
    return cx(
      styles.syntax,
      type === "supMarker" && styles.sup,
      type === "subMarker" && styles.sub,
    );
  }

  const isCode = type === "codeFlowValue" || type === "codeTextData";

  return cx(
    type === "codeFlowValue" && styles.codeContent, // block code: mono (bg on div)
    type === "codeTextData" && styles.code, //         inline code: mono + bg
    within("strong") && styles.bold,
    within("emphasis") && styles.italic,
    within("strikethrough") && styles.strike,
    within("sup") && styles.sup,
    within("sub") && styles.sub,
    within("spoilerName") && styles.spoilerSummary,
    // image alt reads muted; its URL (and a link's label + URL) read link-colored
    within("image") &&
      (within("resourceDestination") ? styles.link : styles.imageAlt),
    within("link") && styles.link,
    // quote prose reads italic + grey, but code inside it stays monospace
    within("blockQuote") && !isCode && styles.blockquote,
  );
}

// --- Per-line rendering ----------------------------------------------------

interface Run {
  key: number;
  text: string;
  /** The token owning this run, or `undefined` for undecorated plain text. */
  leaf: Leaf | undefined;
}

/** Groups a line's `[start, end)` offsets into runs of consecutive same-owner chars. */
function lineRuns(
  start: number,
  end: number,
  source: string,
  owners: (Leaf | undefined)[],
): Run[] {
  const runs: Run[] = [];
  let o = start;
  while (o < end) {
    const leaf = owners[o];
    let j = o + 1;
    while (j < end && owners[j] === leaf) j++;
    runs.push({ key: o, text: source.slice(o, j), leaf });
    o = j;
  }
  return runs;
}

function renderRun({ key, text, leaf }: Run): ReactNode {
  const className = leaf && classNamesFor(leaf);
  return className ? (
    <span key={key} className={className}>
      {text}
    </span>
  ) : (
    text
  );
}

/**
 * Block-level styling for a line, derived from the tokens it contains: code
 * blocks get a full-width background; headings get their size on the div (so the
 * `#` markers and line metrics scale together). `headingDepth` is 0 when the
 * line isn't a heading.
 */
function blockStyle(runs: Run[]): { codeBlock: boolean; headingDepth: number } {
  const leaves = runs.flatMap((run) => (run.leaf ? [run.leaf] : []));
  const within = (ancestor: string) =>
    leaves.some((leaf) => leaf.stack.includes(ancestor));
  const heading = leaves.find((leaf) => leaf.type === "atxHeadingSequence");

  return {
    codeBlock: within("codeFenced") || within("codeIndented"),
    headingDepth: heading ? heading.end - heading.start : 0,
  };
}

/** The `[start, end)` source offsets of each newline-separated line. */
function lineRanges(source: string): Array<[start: number, end: number]> {
  const ranges: Array<[number, number]> = [];
  let start = 0;
  for (const line of source.split("\n")) {
    ranges.push([start, start + line.length]);
    start += line.length + 1;
  }
  return ranges;
}

/**
 * Decorates markdown into one `<div data-block>` per source line (the structure
 * editate's block mode expects), preserving the raw characters. Each line stays
 * a single inline flow of styled spans — no structural wrappers — so the caret
 * and typing/deletion behave exactly like a plain textarea.
 */
export function decorateMarkdown(source: string): ReactElement[] {
  const owners = ownerByOffset(collectLeaves(source), source.length);

  return lineRanges(source).map(([start, end], key) => {
    const runs = lineRuns(start, end, source, owners);
    const { codeBlock, headingDepth } = blockStyle(runs);

    return (
      <div
        key={key}
        data-block
        data-code-block={codeBlock || undefined}
        data-depth={headingDepth || undefined}
      >
        {runs.length ? runs.map(renderRun) : <br />}
      </div>
    );
  });
}

// --- HTML-string variant (for the contenteditable host) -------------------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function runToHtml({ text, leaf }: Run): string {
  const className = leaf && classNamesFor(leaf);
  const escaped = escapeHtml(text);
  return className ? `<span class="${className}">${escaped}</span>` : escaped;
}

/**
 * Same decoration as {@link decorateMarkdown}, serialized to an HTML string.
 *
 * The rich editor renders this via `dangerouslySetInnerHTML` rather than as
 * React child elements. React then owns only the contenteditable host, never
 * the inner text/span nodes — so it can't reconcile (and crash with a stale
 * `removeChild`) against a DOM the browser/IME mutated underneath it during
 * composition, rapid deletion, or autocorrect. editate still sees real Text
 * nodes + `<br>`, so its DOM contract is unchanged.
 */
export function decorateMarkdownToHtml(source: string): string {
  try {
    const owners = ownerByOffset(collectLeaves(source), source.length);

    return lineRanges(source)
      .map(([start, end]) => {
        const runs = lineRuns(start, end, source, owners);
        const { codeBlock, headingDepth } = blockStyle(runs);
        const attrs =
          `data-block="true"` +
          (codeBlock ? ` data-code-block="true"` : "") +
          (headingDepth ? ` data-depth="${headingDepth}"` : "");
        const inner = runs.length ? runs.map(runToHtml).join("") : "<br>";
        return `<div ${attrs}>${inner}</div>`;
      })
      .join("");
  } catch {
    // Never let a decoration error break editing — fall back to plain lines.
    return source
      .split("\n")
      .map(
        (line) =>
          `<div data-block="true">${line ? escapeHtml(line) : "<br>"}</div>`,
      )
      .join("");
  }
}
