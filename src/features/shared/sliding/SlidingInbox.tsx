import React from "react";
import {
  CommentReplyView,
  PersonMentionView,
  PrivateMessageView,
} from "lemmy-js-client";
import { BaseSlidingVote, BaseSlidingDM } from "./BaseSliding";
import { useAppSelector } from "../../../store";

interface SlidingInboxProps {
  children: React.ReactNode;
  className?: string;
  item: PersonMentionView | CommentReplyView | PrivateMessageView;
}

export default function SlidingInbox({
  children,
  className,
  item,
}: SlidingInboxProps) {
  const inbox = useAppSelector((state) => state.gesture.swipe.inbox);

  if ("private_message" in item) {
    return (
      <BaseSlidingDM actions={inbox} className={className} item={item}>
        {children}
      </BaseSlidingDM>
    );
  }

  return (
    <BaseSlidingVote actions={inbox} className={className} item={item}>
      {children}
    </BaseSlidingVote>
  );
}
