import {
  CommentNodeI,
  countMissingDirectChildComments,
} from "../../helpers/lemmy";
import Comment from "./Comment";
import React, { useMemo } from "react";
import CommentHr from "./CommentHr";
import { useAppDispatch, useAppSelector } from "../../store";
import { updateCommentCollapseState } from "./commentSlice";
import { Person } from "lemmy-js-client";
import CommentExpander from "./CommentExpander";

interface CommentTreeProps {
  comment: CommentNodeI;
  highlightedCommentId?: number;
  first?: boolean;
  op: Person;
  fullyCollapsed?: boolean;
  rootIndex: number;
}

export default function CommentTree({
  comment,
  highlightedCommentId,
  first,
  op,
  fullyCollapsed,
  rootIndex,
}: CommentTreeProps) {
  const dispatch = useAppDispatch();
  const commentCollapsedById = useAppSelector(
    (state) => state.comment.commentCollapsedById
  );

  const missingChildren = useMemo(
    () => countMissingDirectChildComments(comment),
    [comment]
  );

  const collapsed = commentCollapsedById[comment.comment_view.comment.id];

  function setCollapsed(collapsed: boolean) {
    dispatch(
      updateCommentCollapseState({
        commentId: comment.comment_view.comment.id,
        collapsed,
      })
    );
  }

  // eslint-disable-next-line no-sparse-arrays
  const payload = [
    <React.Fragment key={comment.comment_view.comment.id}>
      {!first && <CommentHr depth={comment.depth} />}
      <Comment
        comment={comment.comment_view}
        highlightedCommentId={highlightedCommentId}
        depth={comment.depth}
        onClick={() => setCollapsed(!collapsed)}
        collapsed={collapsed}
        fullyCollapsed={!!fullyCollapsed}
        rootIndex={rootIndex}
      />
    </React.Fragment>,
    ...comment.children.map((comment) => (
      <CommentTree
        key={comment.comment_view.comment.id}
        highlightedCommentId={highlightedCommentId}
        comment={comment}
        op={op}
        fullyCollapsed={collapsed || fullyCollapsed}
        rootIndex={rootIndex}
      />
    )),
  ];

  if (missingChildren > 0) {
    payload.push(
      <CommentExpander
        key={`${comment.comment_view.comment.id}--expand`}
        comment={comment.comment_view}
        depth={comment.depth + 1}
        missing={missingChildren}
        collapsed={collapsed || fullyCollapsed}
      />
    );
  }

  return payload;
}
