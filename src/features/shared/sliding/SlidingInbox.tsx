import { useIonToast } from "@ionic/react";
import { arrowUndo, mailUnread } from "ionicons/icons";
import React, { useCallback, useContext, useMemo } from "react";
import { SlidingItemAction } from "./SlidingItem";
import { CommentReplyView, PersonMentionView } from "lemmy-js-client";
import { FeedContext } from "../../feed/FeedContext";
import BaseSlidingVote from "./BaseSlidingVote";
import { getInboxItemId, markRead } from "../../inbox/inboxSlice";
import { useAppDispatch, useAppSelector } from "../../../store";
import { PageContext } from "../../auth/PageContext";

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
  const [present] = useIonToast();
  const dispatch = useAppDispatch();
  const { refresh: refreshPost } = useContext(FeedContext);
  const { presentCommentReply } = useContext(PageContext);
  const readByInboxItemId = useAppSelector(
    (state) => state.inbox.readByInboxItemId
  );

  const markUnread = useCallback(async () => {
    try {
      await dispatch(markRead(item, !readByInboxItemId[getInboxItemId(item)]));
    } catch (error) {
      present({
        message: "Failed to mark item as unread",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    }
  }, [dispatch, item, present, readByInboxItemId]);

  const endActions: [SlidingItemAction, SlidingItemAction] = useMemo(() => {
    return [
      {
        render: mailUnread,
        trigger: markUnread,
        bgColor: "tertiary",
      },
      {
        render: arrowUndo,
        trigger: async () => {
          const replied = await presentCommentReply(item);
          if (replied) refreshPost();
        },
        bgColor: "primary",
      },
    ];
  }, [item, markUnread, presentCommentReply, refreshPost]);

  return (
    <BaseSlidingVote endActions={endActions} className={className} item={item}>
      {children}
    </BaseSlidingVote>
  );
}
