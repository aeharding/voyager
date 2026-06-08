import spoiler from "@aeharding/remark-lemmy-spoiler";
import superSub from "@aeharding/remark-lemmy-supersub";
import type { Node, Root, RootContent } from "mdast";
import type { ReactElement, ReactNode } from "react";
import remarkParse from "remark-parse";
import { Plugin, unified } from "unified";

import customRemarkGfm from "../../customRemarkGfm";

import styles from "./RichTextEditor.module.css";

/**
 * Adapted from editate's "With Remark" story:
 * https://github.com/inokawa/editate/blob/main/stories/advanced/With%20Remark.stories.tsx
 *
 * Parses the markdown source into mdast, then emits one `<div data-block>` per
 * source line with the raw markdown characters preserved (sliced from the
 * original string via node `position.offset`) wrapped in styled inline elements.
 * The text the user typed is never rewritten — only decorated — so editate can
 * keep treating the contents as plain markdown.
 */

declare module "unified" {
  interface CompileResultMap {
    reactElements: ReactElement[];
  }
}

function getRange(node: Node): [number, number] {
  const start = node.position?.start?.offset;
  const end = node.position?.end?.offset;
  // These remark plugins always emit positions; if one is ever missing we throw
  // and the caller falls back to rendering plain (undecorated) text.
  if (start == null || end == null) throw new Error("Missing node position");
  return [start, end];
}

/** Wraps markdown syntax characters (`**`, `[`, `#`, …) in the muted style. */
function syntax(text: string, key: number): ReactNode {
  return (
    <span className={styles.syntax} key={`s${key}`}>
      {text}
    </span>
  );
}

/**
 * Renders `[text](url)` / `![alt](url)` with the brackets/parens muted (syntax
 * grey), the inner label in `labelClassName`, and the URL in link blue. Splits
 * on the `](` separator + closing `)`; falls back to muted if markup is malformed.
 */
function renderBracketed(
  key: number,
  raw: string,
  openLength: number,
  labelClassName: string | undefined,
): ReactNode {
  const sep = raw.indexOf("](");
  if (sep < openLength) {
    return syntax(raw, key);
  }

  const rest = raw.slice(sep); // "](url)" (or "](url "title")")
  const closeParen = rest.lastIndexOf(")");

  return (
    <span key={key}>
      {syntax(raw.slice(0, openLength), key)}
      <span className={labelClassName}>{raw.slice(openLength, sep)}</span>
      {closeParen <= 2 ? (
        syntax(rest, sep)
      ) : (
        <>
          {syntax(rest.slice(0, 2), sep)}
          <span className={styles.link}>{rest.slice(2, closeParen)}</span>
          {syntax(rest.slice(closeParen), sep + closeParen)}
        </>
      )}
    </span>
  );
}

const compiler: Plugin<[], Root, ReactElement[]> = function () {
  const collectLines = (root: Root, value: string) => {
    const lines: { start: number; end: number; nodes: RootContent[] }[] = [];
    let offset = 0;
    for (const line of value.split("\n")) {
      const lineStart = offset;
      const lineEnd = offset + line.length;
      const nodes = root.children.filter((n) => {
        const [nStart, nEnd] = getRange(n);
        return nStart < lineEnd + 1 && nEnd > lineStart;
      });
      lines.push({ start: lineStart, end: lineEnd, nodes });
      offset = lineEnd + 1;
    }
    return lines;
  };

  const renderNodeInLine = (
    node: RootContent,
    lineStart: number,
    lineEnd: number,
    value: string,
  ): ReactNode => {
    const [start, end] = getRange(node);
    const segStart = Math.max(start, lineStart);
    const segEnd = Math.min(end, lineEnd);

    // The gaps around/between a node's children are its syntax markers (e.g.
    // the `**` of bold, the `# ` of a heading) — render those muted. The
    // children themselves are content and keep their semantic styling.
    let children: ReactNode[];
    if ("children" in node && node.children.length) {
      children = [];
      let offset = segStart;
      for (const c of node.children) {
        const [cStart, cEnd] = getRange(c);
        if (offset < cStart && cStart < segEnd) {
          children.push(syntax(value.slice(offset, cStart), offset));
        }
        if (cEnd > lineStart && cStart < lineEnd) {
          children.push(renderNodeInLine(c, lineStart, lineEnd, value));
        }
        offset = Math.max(offset, Math.min(cEnd, segEnd));
      }
      if (offset < segEnd) {
        children.push(syntax(value.slice(offset, segEnd), offset));
      }
    } else {
      children = [value.slice(segStart, segEnd)];
    }

    // Custom Lemmy node types (sup/sub from supersub, summary from spoiler)
    // aren't in the mdast type union, so match them by name first.
    switch (node.type as string) {
      case "sup":
        return <sup key={segStart}>{children}</sup>;
      case "sub":
        return <sub key={segStart}>{children}</sub>;
      case "summary":
        return (
          <strong key={segStart} className={styles.spoilerSummary}>
            {children}
          </strong>
        );
    }

    switch (node.type) {
      case "strong":
        return <strong key={segStart}>{children}</strong>;
      case "emphasis":
        return <em key={segStart}>{children}</em>;
      case "delete":
        return <del key={segStart}>{children}</del>;
      case "inlineCode": {
        // `code`: backticks muted, content monospace
        const raw = value.slice(segStart, segEnd);
        const open = raw.match(/^`+/)?.[0] ?? "";
        const close = raw.match(/`+$/)?.[0] ?? "";
        return (
          <code key={segStart} className={styles.code}>
            {syntax(open, segStart)}
            {raw.slice(open.length, raw.length - close.length)}
            {syntax(close, segEnd)}
          </code>
        );
      }
      case "link":
        // [text](url): brackets + url muted, label in link blue
        return renderBracketed(
          segStart,
          value.slice(segStart, segEnd),
          1,
          styles.link,
        );
      case "image":
        // ![alt](url): brackets + url muted, alt also muted (de-emphasized)
        return renderBracketed(
          segStart,
          value.slice(segStart, segEnd),
          2,
          styles.imageAlt,
        );
      case "blockquote":
        return (
          <span key={segStart} className={styles.blockquote}>
            {children}
          </span>
        );
      case "heading":
        return (
          <span
            key={segStart}
            className={styles.heading}
            data-depth={node.depth}
          >
            {children}
          </span>
        );
      default:
        return children;
    }
  };

  this.compiler = (node, file) => {
    const value = file.value ? String(file.value) : "";
    const root = node as Root;
    const lines = collectLines(root, value);
    const result: ReactElement[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const { start, end, nodes } = line;
      // Code blocks (fenced/indented) and spoilers are multi-line, so style the
      // whole line div rather than an inline span per line.
      const isCodeBlock = nodes.some((n) => n.type === "code");
      const isSpoiler = nodes.some((n) => (n.type as string) === "details");
      const contents: ReactNode[] = [];
      let offset = start;
      for (const n of nodes) {
        const [nStart, nEnd] = getRange(n);
        const segStart = Math.max(nStart, start);
        const segEnd = Math.min(nEnd, end);
        if (offset < segStart) {
          contents.push(value.slice(offset, segStart));
        }
        if (segStart < segEnd) {
          contents.push(renderNodeInLine(n, start, end, value));
        }
        offset = Math.max(offset, segEnd);
      }
      if (offset < end) {
        contents.push(value.slice(offset, end));
      }
      result.push(
        <div
          key={i}
          data-block
          data-code-block={isCodeBlock || undefined}
          data-spoiler={isSpoiler || undefined}
        >
          {contents.length ? contents : <br />}
        </div>,
      );
    }

    return result;
  };
};

/**
 * Builds a unified processor that compiles markdown text into decorated
 * `ReactElement[]` lines. Mirrors the remark plugin set used by `Markdown.tsx`
 * so the decoration matches Voyager's exact markdown flavor.
 */
export function buildMarkdownDecorator(connectedInstance: string) {
  return unified()
    .use(remarkParse)
    .use(superSub)
    .use(customRemarkGfm, { connectedInstance })
    .use(spoiler)
    .use(compiler);
}
