import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import { clientSelector } from "../auth/authSlice";
import { CommunityResponse } from "lemmy-js-client";
import { getHandle } from "../../helpers/lemmy";

interface CommentState {
  communityByHandle: Dictionary<CommunityResponse>;
}

const initialState: CommentState = {
  communityByHandle: {},
};

export const communitySlice = createSlice({
  name: "community",
  initialState,
  reducers: {
    receivedCommunity: (state, action: PayloadAction<CommunityResponse>) => {
      state.communityByHandle[
        getHandle(action.payload.community_view.community)
      ] = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { receivedCommunity } = communitySlice.actions;

export default communitySlice.reducer;

export const getCommunity =
  (handle: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = getState().auth.jwt;

    const community = await clientSelector(getState())?.getCommunity({
      name: handle,
      auth: jwt,
    });
    if (community) dispatch(receivedCommunity(community));
  };

export const followCommunity =
  (follow: boolean, handle: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = getState().auth.jwt;

    const id =
      getState().community.communityByHandle[handle]?.community_view.community
        .id;

    if (!id) return;
    if (!jwt) throw new Error("Not authorized");

    const community = await clientSelector(getState())?.followCommunity({
      community_id: id,
      follow,
      auth: jwt,
    });

    if (community) dispatch(receivedCommunity(community));
  };
