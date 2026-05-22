import {
  CommentView,
  Notification,
  PostView,
  PrivateMessageView,
} from "threadiverse";

import {
  getNotificationKey,
  markNotificationRead,
} from "#/features/inbox/inboxSlice";
import useAppToast from "#/helpers/useAppToast";
import { useAppDispatch, useAppSelector } from "#/store";

export type SlideableVoteItem = CommentView | PostView;

export type SlideableItem = SlideableVoteItem | PrivateMessageView;

export function useSharedInboxActions(notification: Notification | undefined) {
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();

  const readByInboxItemId = useAppSelector(
    (state) => state.inbox.readByInboxItemId,
  );

  const isRead = notification
    ? !!readByInboxItemId[getNotificationKey(notification)]
    : false;

  async function markUnread() {
    if (!notification) return;

    try {
      await dispatch(markNotificationRead(notification, !isRead));
    } catch (error) {
      presentToast({
        message: "Failed to mark item as unread",
        color: "danger",
      });
      throw error;
    }
  }

  return { markUnread, isRead };
}
