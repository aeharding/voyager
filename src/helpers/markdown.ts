import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

import customRemarkGfm from "#/features/shared/markdown/customRemarkGfm";

export function findLoneImage(
  markdown: string,
): { url: string; altText?: string } | null {
  // Regular expression pattern to match an image markdown syntax
  const imagePattern = /!\[(.*?)\]\((.*?)\)/;

  // Extract the first occurrence of an image syntax in the markdown string
  const match = markdown.match(imagePattern);

  if (match && match.index === 0) {
    // Extract the URL and alt text from the matched image syntax
    const [, altText, url] = match;

    // Check if there is any additional content after the image syntax
    const remainingContent = markdown.slice(match[0].length);
    const hasAdditionalContent = remainingContent.trim().length > 0;

    if (!hasAdditionalContent && url) {
      return { url, altText };
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
