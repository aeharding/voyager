import spoiler from "@aeharding/remark-lemmy-spoiler";
import superSub from "@aeharding/remark-lemmy-supersub";
import { parse, postprocess, preprocess } from "micromark";
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
 * character to its token) → per line, `lineRuns` (group) + `headingDepth` →
 * one `<div data-block>`.
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
    runs.push({ text: source.slice(o, j), leaf });
    o = j;
  }
  return runs;
}

/**
 * A line's heading depth — its `#` count — set on the div so the markers and
 * line metrics scale together. 0 when the line isn't a heading.
 */
function headingDepth(runs: Run[]): number {
  const heading = runs
    .map((run) => run.leaf)
    .find((leaf) => leaf?.type === "atxHeadingSequence");
  return heading ? heading.end - heading.start : 0;
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

// --- Rendering -------------------------------------------------------------

/** A run as a styled `<span>`, or a bare text node when it's plain. */
function runToNode({ text, leaf }: Run): HTMLSpanElement | Text {
  const className = leaf && classNamesFor(leaf);
  if (!className) return document.createTextNode(text);

  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
}

/** The `<div data-block>` element for one decorated source line. */
function lineToBlock(
  start: number,
  end: number,
  source: string,
  owners: (Leaf | undefined)[],
): HTMLDivElement {
  const runs = lineRuns(start, end, source, owners);
  const depth = headingDepth(runs);

  const block = document.createElement("div");
  block.dataset.block = "true";
  if (depth) block.dataset.depth = String(depth);

  // A single inline flow of styled spans — no structural wrappers — so the
  // caret and typing/deletion behave exactly like a plain textarea. An empty
  // line gets a `<br>` placeholder (a contenteditable requirement).
  block.append(
    ...(runs.length ? runs.map(runToNode) : [document.createElement("br")]),
  );
  return block;
}

/**
 * Decorates markdown into the HTML for editate's contenteditable host: one
 * `<div data-block>` per source line, preserving the raw characters.
 *
 * It's rendered via `dangerouslySetInnerHTML`, so React owns only the host
 * element and never the inner text/span nodes — otherwise React reconciles them
 * against a DOM the browser/IME mutates underneath it (during composition, rapid
 * deletion, autocorrect) and crashes with a stale `removeChild`. editate still
 * sees real Text nodes + `<br>`, so its DOM contract is unchanged.
 *
 * The nodes are built with the DOM API and serialized once, so the text is
 * escaped by construction — the markup is never assembled from strings.
 */
export function decorateMarkdownToHtml(source: string): string {
  const root = document.createElement("div");
  try {
    const owners = ownerByOffset(collectLeaves(source), source.length);
    for (const [start, end] of lineRanges(source)) {
      root.append(lineToBlock(start, end, source, owners));
    }
  } catch {
    // Never let a decoration error break editing — fall back to plain lines.
    root.replaceChildren(
      ...source.split("\n").map((line) => {
        const block = document.createElement("div");
        block.dataset.block = "true";
        block.append(
          line ? document.createTextNode(line) : document.createElement("br"),
        );
        return block;
      }),
    );
  }
  return root.innerHTML;
}
