export function findLoneImage(
  markdown: string
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

    if (!hasAdditionalContent) {
      return { url, altText };
    }
  }

  return null;
}
