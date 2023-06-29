import { useIonModal, useIonToast } from "@ionic/react";
import { arrowUndo, mailUnread } from "ionicons/icons";
import React, { useCallback, useContext, useMemo } from "react";
import { SlidingItemAction } from "./SlidingItem";
import { CommentReplyView, PersonMentionView } from "lemmy-js-client";
import CommentReply from "../../comment/reply/CommentReply";
import { PageContext } from "../../auth/PageContext";
import { PostContext } from "../../post/detail/PostContext";
import BaseSlidingVote from "./BaseSlidingVote";
import { getInboxItemId, markRead } from "../../inbox/inboxSlice";
import { useAppDispatch, useAppSelector } from "../../../store";

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
  const { refreshPost } = useContext(PostContext);
  const pageContext = useContext(PageContext);
  const readByInboxItemId = useAppSelector(
    (state) => state.inbox.readByInboxItemId,
  );

  const [reply, onDismissReply] = useIonModal(CommentReply, {
    onDismiss: (data: string, role: string) => {
      if (role === "post") refreshPost();
      onDismissReply(data, role);
    },
    item,
  });

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
        trigger: () => reply({ presentingElement: pageContext.page }),
        bgColor: "primary",
      },
    ];
  }, [markUnread, pageContext.page, reply]);

  return (
    <BaseSlidingVote endActions={endActions} className={className} item={item}>
      {children}
    </BaseSlidingVote>
  );
}
