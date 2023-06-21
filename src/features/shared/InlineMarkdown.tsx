import { useMemo } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

interface InlineMarkdownProps {
  children: string;
}

export default function InlineMarkdown({ children }: InlineMarkdownProps) {
  const content = useMemo(
    () => (
      <ReactMarkdown
        skipHtml
        allowedElements={[
          "p",
          "a",
          "li",
          "ul",
          "ol",
          "em",
          "strong",
          "del",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
        ]}
        components={{
          a: "span",
          p: "span",
          li: "span",
          ul: "span",
          ol: "span",
          em: "i",
          strong: "strong",
          del: "del",
          h1: "span",
          h2: "span",
          h3: "span",
          h4: "span",
          h5: "span",
        }}
      >
        {children}
      </ReactMarkdown>
    ),
    [children]
  );

  return content;
}
