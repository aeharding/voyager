import React from "react";
import { CommentReplyView, PersonMentionView } from "lemmy-js-client";
import BaseSlidingVote from "./BaseSlidingVote";
import { useAppSelector } from "../../../store";

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
  const inbox = useAppSelector((state) => state.gesture.swipe.inbox);

  return (
    <BaseSlidingVote actions={inbox} className={className} item={item}>
      {children}
    </BaseSlidingVote>
  );
}
