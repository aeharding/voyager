import {
  CommentReplyView,
  CommentView,
  PersonMentionView,
  PostView,
  PrivateMessageView,
} from "lemmy-js-client";
import { useAppDispatch, useAppSelector } from "../../../../store";
import useAppToast from "../../../../helpers/useAppToast";
import { useCallback, useMemo } from "react";
import { getInboxItemId, markRead } from "../../../inbox/inboxSlice";

export type SlideableVoteItem =
  | CommentView
  | PostView
  | PersonMentionView
  | CommentReplyView;

export type SlideableItem = SlideableVoteItem | PrivateMessageView;

export function isInboxItem(
  item: SlideableItem,
): item is PersonMentionView | CommentReplyView | PrivateMessageView {
  if ("person_mention" in item) return true;
  if ("comment_reply" in item) return true;
  if ("private_message" in item) return true;
  return false;
}

export function useSharedInboxActions(item: SlideableItem) {
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();

  const readByInboxItemId = useAppSelector(
    (state) => state.inbox.readByInboxItemId,
  );

  const isRead = useMemo(() => {
    return isInboxItem(item) ? readByInboxItemId[getInboxItemId(item)] : false;
  }, [item, readByInboxItemId]);

  const markUnread = useCallback(async () => {
    if (!isInboxItem(item)) return;

    try {
      await dispatch(markRead(item, !isRead));
    } catch (error) {
      presentToast({
        message: "Failed to mark item as unread",
        color: "danger",
      });
      throw error;
    }
  }, [dispatch, presentToast, item, isRead]);

  return { markUnread, isRead };
}
