import InAppExternalLink from "../shared/InAppExternalLink";
import Markdown from "../shared/Markdown";

interface CommentMarkdownProps {
  children: string;
}

export default function CommentMarkdown({ children }: CommentMarkdownProps) {
  return (
    <Markdown
      components={{
        img: (props) => (
          <InAppExternalLink
            href={props.src}
            target="_blank"
            rel="noopener noreferrer"
          >
            {props.alt || "Image"}
          </InAppExternalLink>
        ),
      }}
    >
      {children}
    </Markdown>
  );
}
