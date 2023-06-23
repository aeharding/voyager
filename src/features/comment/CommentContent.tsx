import { Comment, Post } from "lemmy-js-client";
import { useMemo } from "react";
import CommentMarkdown from "./CommentMarkdown";

interface CommentContentProps {
  item: Comment | Post;
}

export default function CommentContent({ item }: CommentContentProps) {
  const content = useMemo(() => {
    if (item.deleted) return <i>deleted by creator</i>;
    if (item.removed) return <i>removed by mod</i>;

    return (
      <CommentMarkdown>
        {"content" in item ? item.content : item.body ?? item.name}
      </CommentMarkdown>
    );
  }, [item]);

  return content;
}
