import spoiler from "@aeharding/remark-lemmy-spoiler";
import ReactMarkdown from "react-markdown";
import superSub from "remark-supersub-lemmy";

import inlinifySpoiler from "./components/spoiler/inlinifySpoiler";
import { customRemarkStrikethrough } from "./customRemarkGfm";

interface InlineMarkdownProps {
  children: string;
}

export default function InlineMarkdown({ children }: InlineMarkdownProps) {
  return (
    <ReactMarkdown
      skipHtml
      unwrapDisallowed
      allowedElements={["em", "strong", "del", "code", "sub", "sup"]}
      components={{
        em: "i",
        strong: "strong",
        del: "del",
        code: "code",
        sub: "sub",
        sup: "sup",
      }}
      remarkPlugins={[
        disableBlockTokens,
        customRemarkStrikethrough,
        superSub,
        spoiler,
        inlinifySpoiler,
      ]}
    >
      {children}
    </ReactMarkdown>
  );
}

/**
 * If a Lemmy title starts with a # or a >, it won't be parsed
 * as a heading or blockquote. This function disables those tokens.
 *
 * https://github.com/micromark/micromark/tree/3fae15528f69dfaf2a8865a7f7d92bfb4abd7bc9/packages/micromark-core-commonmark/dev/lib
 */
export function disableBlockTokens(this: import("unified").Processor) {
  const data = this.data();

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);

  micromarkExtensions.push({
    disable: {
      null: [
        "headingAtx",
        "blockQuote",
        "thematicBreak",
        "labelStartLink",
        "labelStartImage",
        "list",
      ],
    },
  });
}
