import { arrowUndo, eyeOffOutline, eyeOutline } from "ionicons/icons";
import React, { useContext, useMemo } from "react";
import { SlidingItemAction } from "./SlidingItem";
import { CommentView, PostView } from "lemmy-js-client";
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

          presentCommentReply(item);
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
  }, [item, presentLoginIfNeeded, presentCommentReply, isHidden, onHide]);

  return (
    <BaseSlidingVote endActions={endActions} className={className} item={item}>
      {children}
    </BaseSlidingVote>
  );
}
