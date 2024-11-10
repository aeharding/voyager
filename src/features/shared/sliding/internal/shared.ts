import {
  CommentReplyView,
  CommentView,
  PersonMentionView,
  PostView,
  PrivateMessageView,
} from "lemmy-js-client";

import { getInboxItemId, markRead } from "#/features/inbox/inboxSlice";
import useAppToast from "#/helpers/useAppToast";
import { useAppDispatch, useAppSelector } from "#/store";

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

  const isRead = isInboxItem(item)
    ? readByInboxItemId[getInboxItemId(item)]
    : false;

  async function markUnread() {
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
  }

  return { markUnread, isRead };
}
