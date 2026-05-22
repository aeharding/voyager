import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { differenceBy, groupBy, sortBy, uniqBy } from "es-toolkit";
import {
  GetUnreadCountResponse,
  Notification,
  NotificationView,
  PageCursor,
} from "threadiverse";

import { clientSelector, jwtSelector } from "#/features/auth/authSelectors";
import { receivedUsers } from "#/features/user/userSlice";
import { AppDispatch, RootState } from "#/store";

import { InboxItemView } from "./InboxItem";

export type PrivateMessageNotification = NotificationView & {
  data: Extract<NotificationView["data"], { type_: "private_message" }>;
};

export function isPrivateMessageNotification(
  item: NotificationView,
): item is PrivateMessageNotification {
  return item.data.type_ === "private_message";
}

interface PostState {
  counts: {
    mentions: number;
    messages: number;
    replies: number;
  };
  lastUpdatedCounts: number;
  readByInboxItemId: Record<string, boolean>;
  messageSyncState: "init" | "syncing" | "synced";
  messages: PrivateMessageNotification[];
  messagesLoading: boolean;
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
  messagesLoading: false,
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
        state.readByInboxItemId[getNotificationKey(item.notification)] =
          item.notification.read;
      }
    },
    setNotificationReadStatus: (
      state,
      action: PayloadAction<{ notification: Notification; read: boolean }>,
    ) => {
      state.readByInboxItemId[
        getNotificationKey(action.payload.notification)
      ] = action.payload.read;
    },
    setAllReadStatus: (state) => {
      for (const [id, read] of Object.entries(state.readByInboxItemId)) {
        if (read) continue;

        state.readByInboxItemId[id] = true;
      }
    },
    receivedMessages: (
      state,
      action: PayloadAction<PrivateMessageNotification[]>,
    ) => {
      state.messages = uniqBy(
        [...action.payload, ...state.messages],
        (m) => m.data.private_message.id,
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
    setMessagesLoading: (state, action: PayloadAction<boolean>) => {
      state.messagesLoading = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  receivedInboxCounts,
  receivedInboxItems,
  setNotificationReadStatus,
  receivedMessages,
  resetInbox,
  resetMessages,
  sync,
  syncComplete,
  syncFail,
  setAllReadStatus: markAllReadInCache,
  setMessagesLoading,
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
    dispatch(setMessagesLoading(true));
    try {
      await _syncMessages(dispatch, getState);
    } finally {
      dispatch(setMessagesLoading(false));
    }
  };

const _syncMessages = async (
  dispatch: AppDispatch,
  getState: () => RootState,
) => {
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

      let page_cursor: PageCursor | undefined;
      let fetchedPageCount = 0;

      while (true) {
        let privateMessages: PrivateMessageNotification[];

        try {
          const results = await clientSelector(getState()).getNotifications({
            type_: "private_message",
            limit: (() => {
              if (syncState === "init") return 50; // initial sync, expect many messages
              if (!page_cursor) return 1; // poll to check for new messages

              return 20; // detected new messages, kick off sync
            })(),
            page_cursor,
          });
          privateMessages = results.data.filter(isPrivateMessageNotification);
          fetchedPageCount++;
          page_cursor = results.next_page;
        } catch (e) {
          dispatch(syncFail());
          throw e;
        }

        const newMessages = differenceBy(
          privateMessages,
          getState().inbox.messages,
          (msg) => msg.data.private_message.id,
        );

        dispatch(receivedMessages(privateMessages));
        dispatch(receivedUsers(privateMessages.map((m) => m.data.creator)));
        dispatch(receivedUsers(privateMessages.map((m) => m.data.recipient)));

        if (!newMessages.length || fetchedPageCount > 10) break;
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
      state.site.response?.my_user?.local_user_view?.person?.id,
  ],
  (messages, myUserId) => {
    return sortBy(
      Object.values(
        groupBy(messages, (m) =>
          m.data.private_message.creator_id === myUserId
            ? m.data.private_message.recipient_id
            : m.data.private_message.creator_id,
        ),
      ).map((messages) =>
        sortBy(messages, [
          (m) => -Date.parse(m.data.private_message.published),
        ]),
      ),
      [(group) => -Date.parse(group[0]!.data.private_message.published)],
    );
  },
);

export function getNotificationKey(notification: Notification): string {
  return `${notification.kind}_${notification.id}`;
}

export const markNotificationRead =
  (notification: Notification, read: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const client = clientSelector(getState());

    const initialRead =
      !!getState().inbox.readByInboxItemId[getNotificationKey(notification)];

    dispatch(setNotificationReadStatus({ notification, read }));

    try {
      await client.markNotificationAsRead({ notification, read });
    } catch (error) {
      dispatch(
        setNotificationReadStatus({ notification, read: initialRead }),
      );

      throw error;
    }

    dispatch(getInboxCounts(true));
  };
