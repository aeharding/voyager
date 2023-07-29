import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import { clientSelector, getSite, jwtSelector } from "../auth/authSlice";
import {
  CommunityModeratorView,
  CommunityView,
  GetCommunityResponse,
} from "lemmy-js-client";
import { getHandle } from "../../helpers/lemmy";
import { db } from "../../services/db";
import { without } from "lodash";

interface CommunityState {
  communityByHandle: Dictionary<CommunityView>;
  modsByHandle: Dictionary<CommunityModeratorView[]>;
  trendingCommunities: CommunityView[];
  favorites: string[];
}

const initialState: CommunityState = {
  communityByHandle: {},
  modsByHandle: {},
  trendingCommunities: [],
  favorites: [],
};

export const communitySlice = createSlice({
  name: "community",
  initialState,
  reducers: {
    receivedCommunity: (state, action: PayloadAction<CommunityView>) => {
      state.communityByHandle[getHandle(action.payload.community)] =
        action.payload;
    },
    recievedTrendingCommunities: (
      state,
      action: PayloadAction<CommunityView[]>
    ) => {
      state.trendingCommunities = action.payload;
    },
    resetCommunities: () => initialState,
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.favorites = action.payload;
    },
    receivedCommunityResponse: (
      state,
      action: PayloadAction<GetCommunityResponse>
    ) => {
      const handle = getHandle(action.payload.community_view.community);

      state.communityByHandle[handle] = action.payload.community_view;
      state.modsByHandle[handle] = action.payload.moderators;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  receivedCommunity,
  recievedTrendingCommunities,
  resetCommunities,
  setFavorites,
  receivedCommunityResponse,
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
    if (community) dispatch(receivedCommunityResponse(community));
  };

export const addFavorite =
  (community: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;
    const favorites = [...getState().community.favorites, community];

    if (!userHandle) return;

    dispatch(setFavorites(favorites));

    db.setSetting("favorite_communities", favorites, {
      user_handle: userHandle,
    });
  };

export const removeFavorite =
  (community: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;
    const favorites = without(getState().community.favorites, community);

    if (!userHandle) return;

    dispatch(setFavorites(favorites));

    db.setSetting("favorite_communities", favorites, {
      user_handle: userHandle,
    });
  };

export const getFavoriteCommunities =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    if (!userHandle) {
      dispatch(setFavorites([]));
      return;
    }

    const communities = await db.getSetting("favorite_communities", {
      user_handle: userHandle,
    });

    dispatch(setFavorites(communities || []));
  };

export const followCommunity =
  (follow: boolean, communityId: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = jwtSelector(getState());

    if (!jwt) throw new Error("Not authorized");

    const community = await clientSelector(getState())?.followCommunity({
      community_id: communityId,
      follow,
      auth: jwt,
    });

    if (community) dispatch(receivedCommunity(community.community_view));
  };

export const blockCommunity =
  (block: boolean, id: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = jwtSelector(getState());

    if (!id) return;
    if (!jwt) throw new Error("Not authorized");

    const response = await clientSelector(getState())?.blockCommunity({
      community_id: id,
      block,
      auth: jwt,
    });

    dispatch(receivedCommunity(response.community_view));
    await dispatch(getSite());
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
