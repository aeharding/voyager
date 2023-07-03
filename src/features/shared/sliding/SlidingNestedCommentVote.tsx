import { arrowUndo, chevronCollapse, chevronExpand } from "ionicons/icons";
import React, { useCallback, useContext, useMemo } from "react";
import { SlidingItemAction } from "./SlidingItem";
import { CommentView } from "lemmy-js-client";
import { FeedContext } from "../../feed/FeedContext";
import BaseSlidingVote from "./BaseSlidingVote";
import useCollapseRootComment from "../../comment/useCollapseRootComment";
import { PageContext } from "../../auth/PageContext";

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
  const { refresh: refreshPost } = useContext(FeedContext);
  const { presentLoginIfNeeded, presentCommentReply } = useContext(PageContext);
  const collapseRootComment = useCollapseRootComment(item, rootIndex);

  const reply = useCallback(async () => {
    const commented = await presentCommentReply(item);

    if (commented) refreshPost();
  }, [item, presentCommentReply, refreshPost]);

  const endActions: [SlidingItemAction, SlidingItemAction] = useMemo(() => {
    return [
      {
        render: collapsed ? chevronExpand : chevronCollapse,
        trigger: () => {
          collapseRootComment();
        },
        bgColor: "tertiary",
      },
      {
        render: arrowUndo,
        trigger: () => {
          if (presentLoginIfNeeded()) return;

          reply();
        },
        bgColor: "primary",
      },
    ];
  }, [collapsed, collapseRootComment, presentLoginIfNeeded, reply]);

  return (
    <BaseSlidingVote endActions={endActions} className={className} item={item}>
      {children}
    </BaseSlidingVote>
  );
}
