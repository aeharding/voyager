import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import { clientSelector, jwtSelector } from "../auth/authSlice";
import { CommunityResponse, CommunityView } from "lemmy-js-client";
import { getHandle } from "../../helpers/lemmy";
import { set } from "../settings/storage";

interface CommunityState {
  communityByHandle: Dictionary<CommunityResponse>;
  trendingCommunities: CommunityView[];
  favouriteCommunityActorIDs: string[] | undefined;
}

const initialState: CommunityState = {
  communityByHandle: {},
  trendingCommunities: [],
  favouriteCommunityActorIDs: [],
};

interface FavouriteCommunityState {
  [userHandle: string]: string[];
}

const initialFavouriteCommunityState: FavouriteCommunityState = {};

const STORAGE_KEYS = {
  favouriteCommunityActorIDs: "favouriteCommunityActorIDs",
};

export const getFavouriteCommunityStateFromStorage =
  (): FavouriteCommunityState =>
    JSON.parse(
      localStorage.getItem(STORAGE_KEYS.favouriteCommunityActorIDs) || "{}"
    ) || initialFavouriteCommunityState;

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
    resetCommunities: () => initialState,
    setfavouriteCommunityActorIDs: (state, action: PayloadAction<string[]>) => {
      state.favouriteCommunityActorIDs = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  receivedCommunity,
  recievedTrendingCommunities,
  resetCommunities,
  setfavouriteCommunityActorIDs,
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

export const updateFavouriteCommunities =
  (handles: string[]) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    if (!userHandle) return;

    set(STORAGE_KEYS.favouriteCommunityActorIDs, {
      [getState().auth.accountData?.activeHandle as string]: handles,
    });

    dispatch(setfavouriteCommunityActorIDs(handles));
  };

export const getFavouriteCommunities =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    if (!userHandle) return;

    const favouriteCommunityActorIDs = getFavouriteCommunityStateFromStorage();

    dispatch(
      setfavouriteCommunityActorIDs(favouriteCommunityActorIDs[userHandle])
    );
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
