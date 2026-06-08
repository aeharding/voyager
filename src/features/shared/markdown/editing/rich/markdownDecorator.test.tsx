import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { buildMarkdownDecorator } from "./markdownDecorator";

/**
 * Tests for the rich-editor decorator. The headline invariant is *text
 * fidelity*: the decorated DOM must contain exactly the source markdown (never
 * rewritten) — it's only styled. We also check the Apollo-style split: syntax
 * markers are muted (`.syntax`), content keeps its semantic tag/class.
 */

function decorate(markdown: string): HTMLElement {
  const result =
    buildMarkdownDecorator("lemmy.world").processSync(markdown).result;
  return render(<div>{result}</div>).container;
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
  "`inline code` here",
  "[label](https://example.com)",
  "![alt text](https://example.com/i.png)",
  "x^super^ y~sub~",
  "line one\nline two\n\nline four",
  "::: spoiler Spoiler title\nhidden content\n:::",
  "```\nconst a = 1;\nconst b = 2;\n```",
  "mix **bold [link](https://a.com)** and `code`",
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

  it("flags spoiler lines with data-spoiler", () => {
    const c = decorate("::: spoiler Title\nhidden\n:::");
    expect(blocks(c).some((b) => b.hasAttribute("data-spoiler"))).toBe(true);
  });
});

describe("inline decoration (syntax muted, content styled)", () => {
  it("bold: content in <strong>, ** markers muted", () => {
    const strong = el(decorate("**bold**"), "strong");
    expect(strong.textContent).toBe("**bold**");
    expect(texts(strong, '[class*="syntax"]')).toEqual(["**", "**"]);
  });

  it("italic -> <em>", () => {
    expect(el(decorate("_x_"), "em").textContent).toBe("_x_");
  });

  it("strikethrough: content in <del>, ~~ markers outside (muted)", () => {
    const c = decorate("~~strike~~");
    expect(el(c, "del").textContent).toBe("strike");
    expect(texts(c, '[class*="syntax"]')).toEqual(["~~", "~~"]);
  });

  it("superscript -> <sup>, subscript -> <sub>", () => {
    expect(el(decorate("a^b^"), "sup").textContent).toBe("^b^");
    expect(el(decorate("a~b~"), "sub").textContent).toBe("~b~");
  });

  it("inline code -> <code>, backticks muted", () => {
    const code = el(decorate("`x`"), "code");
    expect(code.textContent).toBe("`x`");
    expect(texts(code, '[class*="syntax"]')).toEqual(["`", "`"]);
  });
});

describe("headings", () => {
  it("tags the depth and mutes the # marker", () => {
    const h = el(decorate("## Head"), '[data-depth="2"]');
    expect(h.textContent).toBe("## Head");
    expect(texts(h, '[class*="syntax"]')).toEqual(["## "]);
  });

  it("mutes the markers of an empty heading (no content yet)", () => {
    for (const md of ["##", "## "]) {
      const h = el(decorate(md), '[data-depth="2"]');
      expect(h.textContent).toBe(md);
      expect(texts(h, '[class*="syntax"]')).toEqual([md]);
    }
  });
});

describe("links and images", () => {
  it("link: brackets/parens muted, label + url in link color", () => {
    const c = decorate("[label](https://a.com)");
    expect(texts(c, '[class*="link"]')).toEqual(["label", "https://a.com"]);
    expect(texts(c, '[class*="syntax"]')).toEqual(["[", "](", ")"]);
  });

  it("image: alt muted, url in link color, markup muted", () => {
    const c = decorate("![alt](https://a.com/i.png)");
    expect(el(c, '[class*="imageAlt"]').textContent).toBe("alt");
    expect(texts(c, '[class*="link"]')).toEqual(["https://a.com/i.png"]);
    expect(texts(c, '[class*="syntax"]')).toEqual(["![", "](", ")"]);
  });
});

describe("blockquote", () => {
  it("wraps content in the blockquote class and mutes the > marker", () => {
    const bq = el(decorate("> hello"), '[class*="blockquote"]');
    expect(bq.textContent).toBe("> hello");
    expect(texts(bq, '[class*="syntax"]')).toEqual(["> "]);
  });
});

describe("spoiler", () => {
  it("renders a bold summary", () => {
    const c = decorate("::: spoiler My Title\nbody\n:::");
    expect(el(c, '[class*="spoilerSummary"]').textContent).toBe("My Title");
  });
});
