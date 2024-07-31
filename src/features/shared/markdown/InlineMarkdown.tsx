import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import spoiler from "@aeharding/remark-lemmy-spoiler";
import superSub from "remark-supersub-lemmy";
import inlinifySpoiler from "./components/spoiler/inlinifySpoiler";

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
          "code",
          "sub",
          "sup",
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
          code: "code",
          sub: "sub",
          sup: "sup",
        }}
        remarkPlugins={[superSub, spoiler, inlinifySpoiler]}
      >
        {children}
      </ReactMarkdown>
    ),
    [children],
  );

  return content;
}
