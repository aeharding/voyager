import spoiler from "@aeharding/remark-lemmy-spoiler";
import superSub from "@aeharding/remark-lemmy-supersub";
import { parse, postprocess, preprocess } from "micromark";
import type { ReactElement, ReactNode } from "react";
import remarkParse from "remark-parse";
import { unified } from "unified";

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
 * One subtlety the algorithm accounts for: micromark can emit *overlapping*
 * leaf tokens (a `lineEnding` `"\n> "` alongside the `blockQuoteMarker` `">"`
 * inside it). We resolve overlaps by painting the narrowest token last, so each
 * character is owned by its most specific token.
 */

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
 * A leaf is a token whose `exit` immediately follows its `enter` (no children).
 * Leaves carry the actual source characters; their ancestor stack carries the
 * semantic context (inside strong/emphasis/link/codeFenced/…).
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
 * Maps each source offset to the index of the leaf that owns it. Overlaps are
 * resolved narrowest-last (widest painted first) so the most specific token
 * wins; uncovered offsets stay `-1` (rendered as plain text, preserving the
 * text-fidelity invariant).
 */
function paint(leaves: Leaf[], length: number): Int32Array {
  const owners = new Int32Array(length).fill(-1);
  const order = [...leaves.keys()].sort(
    (a, b) =>
      leaves[b]!.end - leaves[b]!.start - (leaves[a]!.end - leaves[a]!.start),
  );
  for (const idx of order) {
    const leaf = leaves[idx]!;
    for (let o = leaf.start; o < leaf.end && o < length; o++) owners[o] = idx;
  }
  return owners;
}

/** The CSS classes a content leaf earns from its type + ancestor context. */
function classNamesFor(leaf: Leaf): string {
  const { type, stack } = leaf;

  // Syntax markers (and the fenced-code language) read muted.
  if (SYNTAX_LEAF.has(type) || stack.includes("codeFencedFenceInfo")) {
    // The `^`/`~` markers stay muted but ride their content's vertical shift,
    // so the whole `^x^` / `~x~` sits raised/lowered together.
    if (type === "supMarker") return `${styles.syntax} ${styles.sup}`;
    if (type === "subMarker") return `${styles.syntax} ${styles.sub}`;
    return styles.syntax!;
  }

  const isCode = type === "codeFlowValue" || type === "codeTextData";
  const cls: string[] = [];

  if (type === "codeFlowValue") cls.push(styles.codeContent!); // mono, bg on div
  if (type === "codeTextData") cls.push(styles.code!); // inline: mono + bg

  if (stack.includes("strong")) cls.push(styles.bold!);
  if (stack.includes("emphasis")) cls.push(styles.italic!);
  if (stack.includes("strikethrough")) cls.push(styles.strike!);
  if (stack.includes("sup")) cls.push(styles.sup!);
  if (stack.includes("sub")) cls.push(styles.sub!);
  if (stack.includes("spoilerName")) cls.push(styles.spoilerSummary!);

  if (stack.includes("image")) {
    // alt text muted; the URL (resourceDestination) stays link-colored
    cls.push(
      stack.includes("resourceDestination") ? styles.link! : styles.imageAlt!,
    );
  } else if (stack.includes("link")) {
    cls.push(styles.link!);
  }

  // Quote prose reads italic + grey, but not its code (code stays monospace).
  if (stack.includes("blockQuote") && !isCode) cls.push(styles.blockquote!);

  return cls.join(" ");
}

function renderRun(leaf: Leaf, text: string, key: number): ReactNode {
  const className = classNamesFor(leaf);
  return className ? (
    <span key={key} className={className}>
      {text}
    </span>
  ) : (
    text
  );
}

/**
 * Decorates markdown into one `<div data-block>` per source line (the structure
 * editate's block mode expects) with the raw characters preserved.
 */
export function decorateMarkdown(source: string): ReactElement[] {
  const leaves = collectLeaves(source);
  const owners = paint(leaves, source.length);

  const result: ReactElement[] = [];
  let lineStart = 0;

  source.split("\n").forEach((lineText, i) => {
    const lineEnd = lineStart + lineText.length;

    let isCodeBlock = false;
    let isSpoiler = false;
    let headingDepth = 0;

    // One styled span per run. The line stays a single inline flow (no flex /
    // structural wrappers) so the caret and typing/deletion behave exactly like
    // a plain textarea — we only style characters, never restructure the line.
    const nodes: ReactNode[] = [];
    let o = lineStart;
    while (o < lineEnd) {
      const owner = owners[o]!;
      let j = o + 1;
      while (j < lineEnd && owners[j] === owner) j++;
      const text = source.slice(o, j);

      if (owner < 0) {
        nodes.push(text);
      } else {
        const leaf = leaves[owner]!;
        if (
          leaf.stack.includes("codeFenced") ||
          leaf.stack.includes("codeIndented")
        )
          isCodeBlock = true;
        if (leaf.stack.includes("spoiler")) isSpoiler = true;
        if (leaf.type === "atxHeadingSequence")
          headingDepth = leaf.end - leaf.start;
        nodes.push(renderRun(leaf, text, o));
      }
      o = j;
    }

    result.push(
      <div
        key={i}
        data-block
        data-code-block={isCodeBlock || undefined}
        data-spoiler={isSpoiler || undefined}
        data-heading={headingDepth ? true : undefined}
        data-depth={headingDepth || undefined}
      >
        {nodes.length ? nodes : <br />}
      </div>,
    );

    lineStart = lineEnd + 1;
  });

  return result;
}
