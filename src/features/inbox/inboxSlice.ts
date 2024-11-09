import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { differenceBy, groupBy, sortBy, uniqBy } from "es-toolkit";
import { GetUnreadCountResponse, PrivateMessageView } from "lemmy-js-client";

import { clientSelector, jwtSelector } from "#/features/auth/authSelectors";
import { receivedUsers } from "#/features/user/userSlice";
import { AppDispatch, RootState } from "#/store";

import { InboxItemView } from "./InboxItem";

interface PostState {
  counts: {
    mentions: number;
    messages: number;
    replies: number;
  };
  lastUpdatedCounts: number;
  readByInboxItemId: Record<string, boolean>;
  messageSyncState: "init" | "syncing" | "synced";
  messages: PrivateMessageView[];
}

const initialState: PostState = {
  counts: {
    mentions: 0,
    messages: 0,
    replies: 0,
  },
  lastUpdatedCounts: 0,
  readByInboxItemId: {},
  messageSyncState: "init",
  messages: [],
};

export const inboxSlice = createSlice({
  name: "inbox",
  initialState,
  reducers: {
    receivedInboxCounts: (
      state,
      action: PayloadAction<GetUnreadCountResponse>,
    ) => {
      state.counts.mentions = action.payload.mentions;
      state.counts.messages = action.payload.private_messages;
      state.counts.replies = action.payload.replies;
      state.lastUpdatedCounts = Date.now();
    },
    receivedInboxItems: (state, action: PayloadAction<InboxItemView[]>) => {
      for (const item of action.payload) {
        state.readByInboxItemId[getInboxItemId(item)] =
          getInboxItemReadStatus(item);
      }
    },
    setReadStatus: (
      state,
      action: PayloadAction<{ item: InboxItemView; read: boolean }>,
    ) => {
      state.readByInboxItemId[getInboxItemId(action.payload.item)] =
        action.payload.read;
    },
    setAllReadStatus: (state) => {
      for (const [id, read] of Object.entries(state.readByInboxItemId)) {
        if (read) continue;

        state.readByInboxItemId[id] = true;
      }
    },
    receivedMessages: (state, action: PayloadAction<PrivateMessageView[]>) => {
      state.messages = uniqBy(
        [...action.payload, ...state.messages],
        (m) => m.private_message.id,
      );
    },
    sync: (state) => {
      state.messageSyncState = "syncing";
    },
    syncComplete: (state) => {
      state.messageSyncState = "synced";
    },
    syncFail: (state) => {
      if (state.messageSyncState === "syncing") state.messageSyncState = "init";
    },
    resetInbox: () => initialState,
    resetMessages: (state) => {
      state.messageSyncState = "init";
      state.messages = [];
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  receivedInboxCounts,
  receivedInboxItems,
  setReadStatus,
  receivedMessages,
  resetInbox,
  resetMessages,
  sync,
  syncComplete,
  syncFail,
  setAllReadStatus: markAllReadInCache,
} = inboxSlice.actions;

export default inboxSlice.reducer;

export const totalUnreadSelector = (state: RootState) =>
  state.inbox.counts.mentions +
  state.inbox.counts.messages +
  state.inbox.counts.replies;

export const getInboxCounts =
  (force = false) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = jwtSelector(getState());

    if (!jwt) {
      dispatch(resetInbox());
      return;
    }

    const lastUpdatedCounts = getState().inbox.lastUpdatedCounts;

    if (!force && Date.now() - lastUpdatedCounts < 3_000) return;

    const result = await clientSelector(getState()).getUnreadCount();

    if (result) dispatch(receivedInboxCounts(result));
  };

export const syncMessages =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = jwtSelector(getState());

    if (!jwt) {
      dispatch(resetInbox());
      return;
    }

    const syncState = getState().inbox.messageSyncState;

    switch (syncState) {
      case "syncing":
        break;
      case "init":
      case "synced": {
        dispatch(sync());

        let page = 1;

        while (true) {
          let privateMessages;

          try {
            const results = await clientSelector(getState()).getPrivateMessages(
              {
                limit: (() => {
                  if (syncState === "init") return 50; // initial sync, expect many messages
                  if (page === 1) return 1; // poll to check for new messages

                  return 20; // detected new messages, kick off sync
                })(),
                page,
              },
            );
            privateMessages = results.private_messages;
          } catch (e) {
            dispatch(syncFail());
            throw e;
          }

          const newMessages = differenceBy(
            privateMessages,
            getState().inbox.messages,
            (msg) => msg.private_message.id,
          );

          dispatch(receivedMessages(privateMessages));
          dispatch(receivedUsers(privateMessages.map((msg) => msg.creator)));
          dispatch(receivedUsers(privateMessages.map((msg) => msg.recipient)));

          if (!newMessages.length || page > 10) break;
          page++;
        }

        dispatch(syncComplete());
      }
    }
  };

export const markAllRead =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    await clientSelector(getState()).markAllAsRead();

    dispatch(markAllReadInCache());
    dispatch(getInboxCounts(true));
  };

export const conversationsByPersonIdSelector = createSelector(
  [
    (state: RootState) => state.inbox.messages,
    (state: RootState) =>
      state.site.response?.my_user?.local_user_view?.local_user?.person_id,
  ],
  (messages, myUserId) => {
    return sortBy(
      Object.values(
        groupBy(messages, (m) =>
          m.private_message.creator_id === myUserId
            ? m.private_message.recipient_id
            : m.private_message.creator_id,
        ),
      ).map((messages) =>
        sortBy(messages, [(m) => -Date.parse(m.private_message.published)]),
      ),
      [(group) => -Date.parse(group[0]!.private_message.published)],
    );
  },
);

export function getInboxItemId(item: InboxItemView): string {
  if ("comment_reply" in item) {
    return `repl_${item.comment_reply.id}`;
  }

  if ("private_message" in item) {
    return `dm_${item.private_message.id}`;
  }

  return `mention_${item.person_mention.id}`;
}

export function getInboxItemReadStatus(item: InboxItemView): boolean {
  if ("comment_reply" in item) {
    return item.comment_reply.read;
  }

  if ("private_message" in item) {
    return item.private_message.read;
  }

  return item.person_mention.read;
}

export function getInboxItemPublished(item: InboxItemView): string {
  if ("comment_reply" in item) {
    return item.comment_reply.published;
  }

  if ("private_message" in item) {
    return item.private_message.published;
  }

  return item.person_mention.published;
}

export const markRead =
  (item: InboxItemView, read: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const client = clientSelector(getState());

    const initialRead =
      !!getState().inbox.readByInboxItemId[getInboxItemId(item)];

    dispatch(setReadStatus({ item, read }));

    try {
      if ("person_mention" in item) {
        await client.markPersonMentionAsRead({
          read,
          person_mention_id: item.person_mention.id,
        });
      } else if ("comment_reply" in item) {
        await client.markCommentReplyAsRead({
          read,
          comment_reply_id: item.comment_reply.id,
        });
      } else if ("private_message" in item) {
        await client.markPrivateMessageAsRead({
          read,
          private_message_id: item.private_message.id,
        });
      }
    } catch (error) {
      dispatch(setReadStatus({ item, read: initialRead }));

      throw error;
    }

    dispatch(getInboxCounts(true));
  };
