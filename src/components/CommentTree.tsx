import styled from "@emotion/styled";
import { CommentNodeI, getFlattenedChildren } from "../helpers/lemmy";
import Comment from "./Comment";
import React, { useMemo, useState } from "react";
import CommentHr from "./CommentHr";
import { useAppDispatch, useAppSelector } from "../store";
import { updateCommentCollapseState } from "../features/comment/commentSlice";
import { PersonSafe } from "lemmy-js-client";

interface CommentTreeProps {
  comment: CommentNodeI;
  first?: boolean;
  op: PersonSafe;
  fullyCollapsed?: boolean;
}

export default function CommentTree({
  comment,
  first,
  op,
  fullyCollapsed,
}: CommentTreeProps) {
  const dispatch = useAppDispatch();
  const commentCollapsedById = useAppSelector(
    (state) => state.comment.commentCollapsedById
  );

  const childCount = useMemo(
    () => getFlattenedChildren(comment).length,
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

  return [
    <React.Fragment key={comment.comment_view.comment.id}>
      {!first && <CommentHr depth={comment.depth} />}
      <Comment
        comment={comment.comment_view}
        depth={comment.depth}
        onClick={() => setCollapsed(!collapsed)}
        collapsed={collapsed}
        childCount={childCount}
        opId={op.id}
        fullyCollapsed={!!fullyCollapsed}
      />
    </React.Fragment>,
    ...comment.children.map((comment) => (
      <CommentTree
        key={comment.comment_view.comment.id}
        comment={comment}
        op={op}
        fullyCollapsed={collapsed || fullyCollapsed}
      />
    )),
    ,
  ];
}
