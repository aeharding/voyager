import { arrowUndo, eyeOffOutline, eyeOutline } from "ionicons/icons";
import React, { useContext, useMemo } from "react";
import { SlidingItemAction } from "./SlidingItem";
import { CommentView, PostView } from "lemmy-js-client";
import { FeedContext } from "../../feed/FeedContext";
import BaseSlidingVote from "./BaseSlidingVote";
import { useAppSelector } from "../../../store";
import { postHiddenByIdSelector } from "../../post/postSlice";
import { PageContext } from "../../auth/PageContext";

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
  const { refresh: refreshPost } = useContext(FeedContext);
  const isHidden = useAppSelector(postHiddenByIdSelector)[item.post?.id];

  const { presentLoginIfNeeded, presentCommentReply } = useContext(PageContext);

  const endActions = useMemo(() => {
    const actionsList:
      | [SlidingItemAction, SlidingItemAction]
      | [SlidingItemAction] = [
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

    if ("post" in item) {
      actionsList.push({
        render: isHidden ? eyeOutline : eyeOffOutline,
        trigger: () => {
          if (presentLoginIfNeeded()) return;

          onHide();
        },
        bgColor: isHidden ? "tertiary" : "danger",
      });
    }

    return actionsList;
  }, [
    item,
    presentLoginIfNeeded,
    presentCommentReply,
    refreshPost,
    isHidden,
    onHide,
  ]);

  return (
    <BaseSlidingVote endActions={endActions} className={className} item={item}>
      {children}
    </BaseSlidingVote>
  );
}
