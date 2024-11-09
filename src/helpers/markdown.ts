import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

import customRemarkGfm from "#/features/shared/markdown/customRemarkGfm";

export function findLoneImage(
  markdown: string,
): { url: string; altText?: string; title?: string } | null {
  // Regular expression pattern to match an image markdown syntax
  const imagePattern = /!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/;

  const match = markdown.match(imagePattern);

  if (match && match.index === 0) {
    // Destructure with title
    const [, altText, url, title] = match;

    // Bail if title includes "emoji" word
    if (title?.split(" ").includes("emoji")) {
      return null;
    }

    // Check if there is any additional content after the image syntax
    const remainingContent = markdown.slice(match[0].length);
    const hasAdditionalContent = remainingContent.trim().length > 0;

    if (!hasAdditionalContent && url) {
      return { url, altText, title };
    }
  }

  return null;
}

export function quote(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

export async function htmlToMarkdown(html: string) {
  const process = await unified()
    .use(rehypeParse)
    .use(customRemarkGfm, { connectedInstance: "unknown" })
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(html);

  return process.toString().trim();
}
