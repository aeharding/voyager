import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetUnreadCountResponse } from "lemmy-js-client";
import { AppDispatch, RootState } from "../../store";
import { clientSelector } from "../auth/authSlice";

interface PostState {
  mentions: number;
  messages: number;
  replies: number;
}

const initialState: PostState = {
  mentions: 0,
  messages: 0,
  replies: 0,
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
    resetInbox: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const { receivedInboxCounts, resetInbox } = inboxSlice.actions;

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
