import { arrowUndo } from "ionicons/icons";
import React, { useContext, useMemo } from "react";
import { SlidingItemAction } from "./SlidingItem";
import { CommentView, PostView } from "lemmy-js-client";
import { FeedContext } from "../../feed/FeedContext";
import BaseSlidingVote from "./BaseSlidingVote";
import { PageContext } from "../../auth/PageContext";

interface SlidingVoteProps {
  children: React.ReactNode;
  className?: string;
  item: CommentView | PostView;
}

export default function SlidingVote({
  children,
  className,
  item,
}: SlidingVoteProps) {
  const { refresh: refreshPost } = useContext(FeedContext);
  const { presentLoginIfNeeded, presentCommentReply } = useContext(PageContext);

  const endActions: [SlidingItemAction] = useMemo(() => {
    return [
      {
        render: arrowUndo,
        trigger: async () => {
          if (presentLoginIfNeeded()) return;

          const replied = await presentCommentReply(item);

          if (replied) refreshPost();
        },
        bgColor: "primary",
      },
    ];
  }, [presentLoginIfNeeded, presentCommentReply, item, refreshPost]);

  return (
    <BaseSlidingVote endActions={endActions} className={className} item={item}>
      {children}
    </BaseSlidingVote>
  );
}
