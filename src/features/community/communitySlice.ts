import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import { clientSelector, jwtSelector } from "../auth/authSlice";
import {
  BlockCommunityResponse,
  CommunityResponse,
  CommunityView,
} from "lemmy-js-client";
import { getHandle } from "../../helpers/lemmy";

interface CommentState {
  communityByHandle:
    | Dictionary<CommunityResponse>
    | Dictionary<BlockCommunityResponse>;
  trendingCommunities: CommunityView[];
}

const initialState: CommentState = {
  communityByHandle: {},
  trendingCommunities: [],
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
    recievedTrendingCommunities: (
      state,
      action: PayloadAction<CommunityView[]>
    ) => {
      state.trendingCommunities = action.payload;
    },
    blockedCommunity: (
      state,
      action: PayloadAction<BlockCommunityResponse>
    ) => {
      state.communityByHandle[
        getHandle(action.payload.community_view.community)
      ] = action.payload;
    },
    resetCommunities: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  receivedCommunity,
  blockedCommunity,
  recievedTrendingCommunities,
  resetCommunities,
} = communitySlice.actions;

export default communitySlice.reducer;

export const getCommunity =
  (handle: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = jwtSelector(getState());

    const community = await clientSelector(getState())?.getCommunity({
      name: handle,
      auth: jwt,
    });
    if (community) dispatch(receivedCommunity(community));
  };

export const followCommunity =
  (follow: boolean, handle: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = jwtSelector(getState());

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
export const blockCommunity =
  (block: boolean, handle: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = jwtSelector(getState());

    const id =
      getState().community.communityByHandle[handle]?.community_view.community
        .id;

    if (!id) return;
    if (!jwt) throw new Error("Not authorized");

    const community = await clientSelector(getState())?.blockCommunity({
      community_id: id,
      block,
      auth: jwt,
    });

    if (community) dispatch(blockedCommunity(community));
  };
export const getTrendingCommunities =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const trendingCommunities = await clientSelector(
      getState()
    )?.listCommunities({
      type_: "All",
      sort: "Hot",
      limit: 6,
    });

    dispatch(recievedTrendingCommunities(trendingCommunities.communities));
  };
