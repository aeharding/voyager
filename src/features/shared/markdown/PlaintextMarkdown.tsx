import { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import supersub from "remark-supersub-lemmy";

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
