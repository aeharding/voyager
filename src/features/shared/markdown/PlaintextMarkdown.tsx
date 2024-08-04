import { ComponentProps } from "react";
import supersub from "remark-supersub-lemmy";
import ReactMarkdown from "react-markdown";

type PlaintextMarkdownProps = Pick<
  ComponentProps<typeof ReactMarkdown>,
  "children"
>;

export default function PlaintextMarkdown(props: PlaintextMarkdownProps) {
  return (
    <ReactMarkdown
      {...props}
      skipHtml
      unwrapDisallowed
      allowedElements={[]}
      remarkPlugins={[supersub]}
    />
  );
}
