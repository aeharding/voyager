import styled from "@emotion/styled";
import { CommentNodeI, getFlattenedChildren } from "../helpers/lemmy";
import Comment from "./Comment";
import { useMemo, useState } from "react";

interface CommentTreeProps {
  comment: CommentNodeI;
}

export default function CommentTree({ comment }: CommentTreeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const childCount = useMemo(
    () => getFlattenedChildren(comment).length,
    [comment]
  );

  return (
    <>
      <Comment
        comment={comment.comment_view}
        depth={comment.depth}
        onClick={() => setCollapsed(!collapsed)}
        collapsed={collapsed}
        childCount={childCount}
      />
      {!collapsed &&
        comment.children.map((comment) => (
          <CommentTree
            key={comment.comment_view.comment.id}
            comment={comment}
          />
        ))}
      {comment.comment_view.counts.child_count > childCount && (
        <div>
          {comment.comment_view.counts.child_count - childCount} more replies
        </div>
      )}
    </>
  );
}
