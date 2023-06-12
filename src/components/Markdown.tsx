import {
  ReactMarkdown,
  ReactMarkdownOptions,
} from "react-markdown/lib/react-markdown";

export default function Markdown(props: ReactMarkdownOptions) {
  return <ReactMarkdown linkTarget="_blank" {...props} />;
}
