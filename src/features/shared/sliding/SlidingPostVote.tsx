import React from "react";
import { CommentView, PostView } from "lemmy-js-client";
import { useAppSelector } from "../../../store";
import { BaseSlidingVote } from "./BaseSliding";

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
