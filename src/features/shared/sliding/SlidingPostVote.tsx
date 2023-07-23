import React from "react";
import { CommentView, PostView } from "lemmy-js-client";
import BaseSlidingVote from "./BaseSlidingVote";
import { useAppSelector } from "../../../store";

interface SlidingVoteProps {
  children: React.ReactNode;
  className?: string;
  item: CommentView | PostView;
  onHide: () => void;
}

export default function SlidingVote({
  children,
  className,
  item,
  onHide,
}: SlidingVoteProps) {
  const post = useAppSelector((state) => state.gesture.swipe.post);

  return (
    <BaseSlidingVote
      actions={post}
      className={className}
      item={item}
      onHide={onHide}
    >
      {children}
    </BaseSlidingVote>
  );
}
