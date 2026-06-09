import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { decorateMarkdown } from "./markdownDecorator";

/**
 * Tests for the rich-editor decorator. The headline invariant is *text
 * fidelity*: the decorated DOM must contain exactly the source markdown (never
 * rewritten) — it's only styled. We also check the Apollo-style split: syntax
 * markers are muted (`.syntax`), content keeps its semantic class.
 *
 * The decorator works off micromark's token stream, so each syntactic token is
 * its own styled span — e.g. a link's `[`, `]`, `(`, `)` are four separate
 * muted spans, and a blockquote's `>` marker is muted while only the prose
 * inside carries `.blockquote`.
 */

function decorate(markdown: string): HTMLElement {
  return render(<div>{decorateMarkdown(markdown)}</div>).container;
}

function blocks(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-block]"));
}

/** Reconstruct the source by joining each line block's text with newlines. */
function reconstruct(container: HTMLElement): string {
  return blocks(container)
    .map((b) => b.textContent ?? "")
    .join("\n");
}

function el(scope: HTMLElement, selector: string): HTMLElement {
  const found = scope.querySelector<HTMLElement>(selector);
  if (!found) throw new Error(`not found: ${selector}`);
  return found;
}

function texts(scope: HTMLElement, selector: string): (string | null)[] {
  return Array.from(scope.querySelectorAll(selector)).map((e) => e.textContent);
}

const SAMPLES = [
  "plain text with no markdown",
  "**bold** and _italic_ and ~~strike~~",
  "# Heading one",
  "## Heading two",
  "> a quote",
  "> first\n>\n> second", // multi-paragraph quote with a bare `>` line
  "`inline code` here",
  "[label](https://example.com)",
  "![alt text](https://example.com/i.png)",
  "x^super^ y~sub~",
  "line one\nline two\n\nline four",
  "::: spoiler Spoiler title\nhidden content\n:::",
  "```\nconst a = 1;\nconst b = 2;\n```",
  '> ```bash\n> const foo = "baz";\n> ```', // code block nested in a quote
  "mix **bold [link](https://a.com)** and `code`",
  "escape \\* not bold",
  "",
];

describe("text fidelity (never rewrites the markdown source)", () => {
  it.each(SAMPLES)("preserves the exact source: %j", (markdown) => {
    expect(reconstruct(decorate(markdown))).toBe(markdown);
  });
});

describe("block structure", () => {
  it("renders one block per source line, preserving blank lines", () => {
    expect(blocks(decorate("a\nb\nc"))).toHaveLength(3);
    expect(blocks(decorate("a\n\nb"))).toHaveLength(3);
  });

  it("flags every code-block line with data-code-block", () => {
    const flagged = blocks(decorate("```\ncode\n```")).filter((b) =>
      b.hasAttribute("data-code-block"),
    );
    expect(flagged).toHaveLength(3);
  });

  it("mutes the fence and language identifier on a fenced code block", () => {
    const c = decorate("```js\nconst a = 1;\n```");
    expect(texts(c, '[class*="syntax"]')).toEqual(["```", "js", "```"]);
  });

  it("keeps fenced code content monospace, not muted", () => {
    const c = decorate("```\ncode\n```");
    expect(texts(c, '[class*="codeContent"]')).toEqual(["code"]);
  });
});

describe("code block nested in a blockquote", () => {
  it("flags all lines as a code block (monospace inside a quote)", () => {
    const flagged = blocks(decorate("> ```\n> code\n> ```")).filter((b) =>
      b.hasAttribute("data-code-block"),
    );
    expect(flagged).toHaveLength(3);
  });

  it("renders the > marker as muted syntax (normal font), code as codeContent", () => {
    const c = decorate('> ```bash\n> const foo = "baz";\n> ```');
    // every `>` continuation marker stays muted syntax, never monospace
    const codeLine = blocks(c)[1]!;
    expect(texts(codeLine, '[class*="syntax"]')).toEqual([">", " "]);
    expect(texts(codeLine, '[class*="codeContent"]')).toEqual([
      'const foo = "baz";',
    ]);
  });
});

describe("inline decoration (syntax muted, content styled)", () => {
  it("bold: content in .bold, ** markers muted", () => {
    const c = decorate("**bold**");
    expect(texts(c, '[class*="bold"]')).toEqual(["bold"]);
    expect(texts(c, '[class*="syntax"]')).toEqual(["**", "**"]);
  });

  it("italic -> .italic", () => {
    expect(texts(decorate("_x_"), '[class*="italic"]')).toEqual(["x"]);
  });

  it("strikethrough: content in .strike, ~~ markers muted (never struck)", () => {
    const c = decorate("~~strike~~");
    expect(texts(c, '[class*="strike"]')).toEqual(["strike"]);
    expect(texts(c, '[class*="syntax"]')).toEqual(["~~", "~~"]);
  });

  it("superscript/subscript: whole run shifted, ^ ~ markers also muted", () => {
    const sup = decorate("a^b^");
    // markers ride the shift too, so the whole ^b^ sits raised
    expect(texts(sup, '[class*="sup"]')).toEqual(["^", "b", "^"]);
    expect(texts(sup, '[class*="syntax"]')).toEqual(["^", "^"]);
    const sub = decorate("a~b~");
    expect(texts(sub, '[class*="sub"]')).toEqual(["~", "b", "~"]);
  });

  it("inline code -> .code, backticks muted", () => {
    const c = decorate("`x`");
    expect(el(c, '[class*="code"]').textContent).toBe("x");
    expect(texts(c, '[class*="syntax"]')).toEqual(["`", "`"]);
  });
});

describe("headings", () => {
  it("tags the depth on the line div and mutes the # marker", () => {
    const c = decorate("## Head");
    const h = el(c, '[data-depth="2"]');
    expect(h.textContent).toBe("## Head");
    expect(texts(h, '[class*="syntax"]')).toEqual(["##", " "]);
  });

  it("mutes the markers of an empty heading (no content yet)", () => {
    for (const md of ["##", "## "]) {
      const h = el(decorate(md), '[data-depth="2"]');
      expect(h.textContent).toBe(md);
      // nothing in the line is non-syntax content
      expect(texts(h, '[class*="syntax"]').join("")).toBe(md);
    }
  });
});

describe("links and images", () => {
  it("link: brackets/parens muted, label + url in link color", () => {
    const c = decorate("[label](https://a.com)");
    expect(texts(c, '[class*="link"]')).toEqual(["label", "https://a.com"]);
    expect(texts(c, '[class*="syntax"]')).toEqual(["[", "]", "(", ")"]);
  });

  it("image: alt muted, url in link color, markup muted", () => {
    const c = decorate("![alt](https://a.com/i.png)");
    expect(el(c, '[class*="imageAlt"]').textContent).toBe("alt");
    expect(texts(c, '[class*="link"]')).toEqual(["https://a.com/i.png"]);
    expect(texts(c, '[class*="syntax"]')).toEqual(["!", "[", "]", "(", ")"]);
  });
});

describe("blockquote", () => {
  it("wraps only the prose in .blockquote and mutes the > marker", () => {
    const c = decorate("> hello");
    expect(el(c, '[class*="blockquote"]').textContent).toBe("hello");
    expect(texts(c, '[class*="syntax"]')).toEqual([">", " "]);
  });

  it("keeps the bare > marker on an empty quote line (a caret target)", () => {
    const lines = blocks(decorate("> first\n>\n> second"));
    expect(lines[1]?.textContent).toBe(">");
  });
});

describe("lists", () => {
  it("mutes the marker and keeps the line a flat inline block (no restructure)", () => {
    // No hanging indent: the line is a single inline flow of styled spans so
    // typing/deletion behave exactly like a textarea (exact alignment would
    // require a structural split that breaks editing on WebKit). Markers muted.
    const c = decorate("- one");
    const line = blocks(c)[0]!;
    expect(line.querySelector('[class*="hang"]')).toBeNull();
    expect(line.style.paddingLeft).toBe("");
    expect(texts(c, '[class*="syntax"]')).toEqual(["-", " "]);
    expect(line.textContent).toBe("- one");
  });

  it("preserves source fidelity for quotes + lists", () => {
    const md = "> quote\n- one\n  - nested\n> 1. q-list\n1. ordered";
    expect(reconstruct(decorate(md))).toBe(md);
  });
});

describe("spoiler", () => {
  it("renders a bold summary", () => {
    const c = decorate("::: spoiler My Title\nbody\n:::");
    expect(el(c, '[class*="spoilerSummary"]').textContent).toBe("My Title");
  });
});
