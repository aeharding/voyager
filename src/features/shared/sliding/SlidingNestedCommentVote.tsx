import React from "react";
import { CommentView } from "lemmy-js-client";
import { useAppSelector } from "../../../store";
import { BaseSlidingVote } from "./BaseSliding";

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
  const comment = useAppSelector((state) => state.gesture.swipe.comment);

  return (
    <BaseSlidingVote
      actions={comment}
      className={className}
      item={item}
      rootIndex={rootIndex}
      collapsed={collapsed}
    >
      {children}
    </BaseSlidingVote>
  );
}
