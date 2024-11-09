import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BanFromCommunity, Person } from "lemmy-js-client";

import { clientSelector } from "#/features/auth/authSelectors";
import { getSite } from "#/features/auth/siteSlice";
import { receivedComments } from "#/features/comment/commentSlice";
import { resetMessages, syncMessages } from "#/features/inbox/inboxSlice";
import { getHandle } from "#/helpers/lemmy";
import { LIMIT } from "#/services/lemmy";
import { AppDispatch, RootState } from "#/store";

interface CommentState {
  userByHandle: Record<string, Person>;
  bannedByCommunityIdUserId: Record<string, boolean>;
}

const initialState: CommentState = {
  userByHandle: {},
  bannedByCommunityIdUserId: {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    receivedUsers: (state, action: PayloadAction<Person[]>) => {
      for (const user of action.payload) {
        state.userByHandle[getHandle(user).toLowerCase()] = user;
      }
    },
    updateBanned: (
      state,
      action: PayloadAction<{
        banned: boolean;
        userId: number;
        communityId: number;
      }>,
    ) => {
      state.bannedByCommunityIdUserId[
        `${action.payload.communityId}${action.payload.userId}`
      ] = action.payload.banned;
    },

    resetUsers: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const { receivedUsers, updateBanned, resetUsers } = userSlice.actions;

export default userSlice.reducer;

export const getUser =
  (handle: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const personResponse = await clientSelector(getState())?.getPersonDetails({
      username: handle,
      limit: LIMIT,
      sort: "New",
    });

    dispatch(receivedUsers([personResponse.person_view.person]));
    dispatch(receivedComments(personResponse.comments));

    return personResponse;
  };

export const blockUser =
  (block: boolean, id: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!id) return;

    const response = await clientSelector(getState())?.blockPerson({
      person_id: id,
      block,
    });

    dispatch(receivedUsers([response.person_view.person]));
    await dispatch(getSite());

    // We have synced (or are syncing) messages, AND
    //   - We are either unblocking (may have messages from that user), OR
    //   - we are blocking the user and we have messages from this user,
    // so refresh is needed
    if (
      getState().inbox.messageSyncState !== "init" &&
      (!block ||
        getState().inbox.messages?.find(
          (msg) => msg.creator.id === id || msg.recipient.id === id,
        ))
    ) {
      dispatch(resetMessages());
      dispatch(syncMessages());
    }
  };

export const banUser =
  (
    payload: Omit<BanFromCommunity, "ban"> &
      Partial<Pick<BanFromCommunity, "ban">>,
  ) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const response = await clientSelector(getState())?.banFromCommunity({
      ban: true,
      ...payload,
    });

    dispatch(
      updateBanned({
        communityId: payload.community_id,
        userId: payload.person_id,
        banned: response.banned,
      }),
    );
  };
