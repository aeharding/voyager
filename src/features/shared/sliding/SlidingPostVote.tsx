import React from "react";
import { CommentView, PostView } from "lemmy-js-client";
import BaseSlidingVote from "./BaseSlidingVote";
import { default_swipe_actions_post } from "../../../services/db";

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
  return (
    <BaseSlidingVote
      actions={default_swipe_actions_post}
      className={className}
      item={item}
      onHide={onHide}
    >
      {children}
    </BaseSlidingVote>
  );
}
