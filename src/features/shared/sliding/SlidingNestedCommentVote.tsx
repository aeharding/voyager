import React from "react";
import { CommentView } from "lemmy-js-client";
import BaseSlidingVote from "./BaseSlidingVote";
import { default_swipe_actions_comment } from "../../../services/db";

interface SlidingVoteProps {
  children: React.ReactNode;
  className?: string;
  item: CommentView;
  rootIndex: number | undefined;
  collapsed: boolean;
}

export default function SlidingNestedCommentVote({
  children,
  className,
  item,
  rootIndex,
  collapsed,
}: SlidingVoteProps) {
  return (
    <BaseSlidingVote
      actions={default_swipe_actions_comment}
      className={className}
      item={item}
      rootIndex={rootIndex}
      collapsed={collapsed}
    >
      {children}
    </BaseSlidingVote>
  );
}
