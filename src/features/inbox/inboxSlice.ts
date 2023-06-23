import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetUnreadCountResponse } from "lemmy-js-client";
import { AppDispatch, RootState } from "../../store";
import { clientSelector } from "../auth/authSlice";
import { InboxItemView } from "./InboxItem";

interface PostState {
  mentions: number;
  messages: number;
  replies: number;
  readByInboxItemId: Dictionary<boolean>;
}

const initialState: PostState = {
  mentions: 0,
  messages: 0,
  replies: 0,
  readByInboxItemId: {},
};

export const inboxSlice = createSlice({
  name: "inbox",
  initialState,
  reducers: {
    receivedInboxCounts: (
      state,
      action: PayloadAction<GetUnreadCountResponse>
    ) => {
      state.mentions = action.payload.mentions;
      state.messages = action.payload.private_messages;
      state.replies = action.payload.replies;
    },
    receivedInboxItems: (state, action: PayloadAction<InboxItemView[]>) => {
      for (const item of action.payload) {
        state.readByInboxItemId[getInboxItemId(item)] =
          getInboxItemReadStatus(item);
      }
    },
    setReadStatus: (
      state,
      action: PayloadAction<{ item: InboxItemView; read: boolean }>
    ) => {
      state.readByInboxItemId[getInboxItemId(action.payload.item)] =
        action.payload.read;
    },
    resetInbox: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  receivedInboxCounts,
  receivedInboxItems,
  setReadStatus,
  resetInbox,
} = inboxSlice.actions;

export default inboxSlice.reducer;

export const totalUnreadSelector = (state: RootState) =>
  state.inbox.mentions + state.inbox.messages + state.inbox.replies;

export const getInboxCounts =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = getState().auth.jwt;

    if (!jwt) {
      dispatch(resetInbox());
      return;
    }

    const result = await clientSelector(getState()).getUnreadCount({
      auth: jwt,
    });

    if (result) dispatch(receivedInboxCounts(result));
  };

export function getInboxItemId(item: InboxItemView): string {
  if ("private_message" in item) {
    return `dm_${item.private_message.id}`;
  } else if ("comment_reply" in item) {
    return `repl_${item.comment_reply.id}`;
  }

  return `mention_${item.person_mention.id}`;
}

export function getInboxItemReadStatus(item: InboxItemView): boolean {
  if ("private_message" in item) {
    return item.private_message.read;
  } else if ("comment_reply" in item) {
    return item.comment_reply.read;
  }

  return item.person_mention.read;
}
