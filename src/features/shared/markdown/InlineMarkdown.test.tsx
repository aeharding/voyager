import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import InlineMarkdown from "./InlineMarkdown";

// Test case to verify strikethrough rendering
it("renders strikethrough text with ~~", () => {
  const markdownContent = "~~test~~";

  const { container } = render(
    <InlineMarkdown>{markdownContent}</InlineMarkdown>,
  );

  // Query for the del element (strikethrough)
  const delElement = container.querySelector("del");

  // Assert that the del element exists and contains "test"
  expect(delElement).toBeTruthy();
  expect(delElement?.textContent).toBe("test");
});

// Test case to verify subscript rendering
it("renders subscript text with ~", () => {
  const markdownContent = "~test~";

  const { container } = render(
    <InlineMarkdown>{markdownContent}</InlineMarkdown>,
  );

  // Query for the sub element (subscript)
  const subElement = container.querySelector("sub");

  // Assert that the sub element exists and contains "test"
  expect(subElement).toBeTruthy();
  expect(subElement?.textContent).toBe("test");
});

// Test case to verify superscript rendering
it("renders superscript text with ^", () => {
  const markdownContent = "^test^";

  const { container } = render(
    <InlineMarkdown>{markdownContent}</InlineMarkdown>,
  );

  // Query for the sup element (superscript)
  const supElement = container.querySelector("sup");

  // Assert that the sup element exists and contains "test"
  expect(supElement).toBeTruthy();
  expect(supElement?.textContent).toBe("test");
});

// Test case to verify links are unwrapped
it("unwraps links and displays plain text", () => {
  const markdownContent = "[link text](https://example.com)";

  const { container } = render(
    <InlineMarkdown>{markdownContent}</InlineMarkdown>,
  );

  // Assert that no anchor element exists (link should be unwrapped)
  const linkElement = container.querySelector("a");
  expect(linkElement).toBeNull();

  // Assert that the text content is present
  expect(container.textContent).toBe("link text");
});

describe("parseBlocks=false", () => {
  const blockSyntaxTestCases = [
    { input: "# test", description: "heading" },
    { input: "> test", description: "blockquote" },
    { input: "* test", description: "unordered list with *" },
    { input: "- test", description: "unordered list with -" },
    { input: "1. test", description: "ordered list" },
  ];

  blockSyntaxTestCases.forEach(({ input, description }) => {
    it(`renders ${description} syntax literally`, () => {
      const { container } = render(
        <InlineMarkdown parseBlocks={false}>{input}</InlineMarkdown>,
      );

      // Assert that the text content renders literally
      expect(container.textContent).toBe(input);
    });
  });
});

describe("parseBlocks=true", () => {
  const blockSyntaxTestCases = [
    { input: "# test", description: "heading" },
    { input: "> test", description: "blockquote" },
    { input: "* test", description: "unordered list with *" },
    { input: "- test", description: "unordered list with -" },
    { input: "1. test", description: "ordered list" },
  ];

  blockSyntaxTestCases.forEach(({ input, description }) => {
    it(`inlineifies ${description} syntax (unwraps to plain text)`, () => {
      const { container } = render(<InlineMarkdown>{input}</InlineMarkdown>);

      // When parseBlocks=true, block elements are parsed then unwrapped
      // So "# test" becomes just "test" (markdown syntax removed)
      expect(container.textContent?.trim()).toBe("test");
    });
  });
});
