import { CommentView } from "lemmy-js-client";
import Markdown from "./Markdown";

interface CommentContentProps {
  comment: CommentView;
}

export default function CommentContent({ comment }: CommentContentProps) {
  if (comment.comment.deleted) return <i>deleted by creator</i>;
  if (comment.comment.removed) return <i>removed by mod</i>;

  return (
    <Markdown
      components={{
        img: ({ node, ...props }) => (
          <a href={props.src} target="_blank" rel="noopener noreferrer">
            {props.alt || "Image"}
          </a>
        ),
      }}
    >
      {comment.comment.content}
    </Markdown>
  );
}
