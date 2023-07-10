import React from "react";
import { CommentReplyView, PersonMentionView } from "lemmy-js-client";
import BaseSlidingVote from "./BaseSlidingVote";
import { default_swipe_actions_inbox } from "../../../services/db";

interface SlidingInboxProps {
  children: React.ReactNode;
  className?: string;
  item: PersonMentionView | CommentReplyView;
}

export default function SlidingInbox({
  children,
  className,
  item,
}: SlidingInboxProps) {
  return (
    <BaseSlidingVote
      actions={default_swipe_actions_inbox}
      className={className}
      item={item}
    >
      {children}
    </BaseSlidingVote>
  );
}
