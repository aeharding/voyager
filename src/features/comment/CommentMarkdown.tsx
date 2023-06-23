import Markdown from "../shared/Markdown";

interface CommentMarkdownProps {
  children: string;
}

export default function CommentMarkdown({ children }: CommentMarkdownProps) {
  return (
    <Markdown
      components={{
        img: (props) => (
          <a href={props.src} target="_blank" rel="noopener noreferrer">
            {props.alt || "Image"}
          </a>
        ),
      }}
    >
      {children}
    </Markdown>
  );
}
