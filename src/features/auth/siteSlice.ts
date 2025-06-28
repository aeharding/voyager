import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  GetSiteResponse,
  ProviderInfo,
  ThreadiverseClient,
  UnsupportedSoftwareError,
} from "threadiverse";

import { customBackOff } from "#/services/lemmy";
import { AppDispatch, RootState } from "#/store";

import { clientSelector, handleSelector } from "./authSelectors";

interface SiteState {
  failedAttempt: number;
  loading: boolean;
  response: GetSiteResponse | undefined;

  software: ProviderInfo | undefined;
  latchedSoftware: ProviderInfo | undefined;
  softwareError: boolean;
  unsupportedSoftware: boolean;

  ignoreInstanceOffline: boolean;
}

const initialState: SiteState = {
  failedAttempt: 0,
  loading: false,
  response: undefined,
  software: undefined,
  latchedSoftware: undefined,
  softwareError: false,
  unsupportedSoftware: false,
  ignoreInstanceOffline: false,
};

export const siteSlice = createSlice({
  name: "site",
  initialState,
  reducers: {
    loadingSite(state) {
      state.loading = true;
    },
    failedSite(state) {
      state.failedAttempt++;
      state.loading = false;
    },
    receivedSite(state, action: PayloadAction<GetSiteResponse>) {
      state.response = action.payload;
      state.loading = false;
      state.failedAttempt = 0;
    },
    loadingSoftware(state) {
      state.software = undefined;
    },
    receivedSoftware(state, action: PayloadAction<ProviderInfo>) {
      state.software = action.payload;
      state.latchedSoftware = action.payload;
      state.softwareError = false;
    },
    failedSoftware(state) {
      state.software = undefined;
      state.latchedSoftware = undefined;
      state.softwareError = true;
    },
    receivedUnsupportedSoftware(state) {
      state.unsupportedSoftware = true;
      state.latchedSoftware = undefined;
      state.softwareError = true;
    },
    setIgnoreInstanceOffline(state) {
      state.ignoreInstanceOffline = true;
    },
    resetSite() {
      return initialState;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  loadingSite,
  failedSite,
  receivedSite,
  receivedSoftware,
  receivedUnsupportedSoftware,
  resetSite,
  setIgnoreInstanceOffline,
  loadingSoftware,
  failedSoftware,
} = siteSlice.actions;

export default siteSlice.reducer;

export const isAdminSelector = (state: RootState) =>
  state.site.response?.my_user?.local_user_view.local_user.admin;

export const isDownvoteEnabledSelector = (state: RootState) =>
  // TODO: handle post/comment downvotes being disabled separately, and also disabled upvotes
  state.site.response?.site_view.local_site.comment_downvotes !== "Disable";

export const localUserViewSelector = (state: RootState) =>
  state.site.response?.my_user?.local_user_view;

export const localUserSelector = (state: RootState) =>
  state.site.response?.my_user?.local_user_view.local_user;

export const userPersonSelector = (state: RootState) =>
  state.site.response?.my_user?.local_user_view?.person;

export const lemmyVersionSelector = (state: RootState) =>
  state.site.response?.version;

export const followIdsSelector = createSelector(
  [(state: RootState) => state.site.response?.my_user?.follows],
  (follows) => (follows ?? []).map((follow) => follow.community.id),
);

export const moderatesSelector = (state: RootState) =>
  state.site.response?.my_user?.moderates;

/**
 * Used to determine if request is stale (for other lemmy account and/or instance)
 */
const siteReqIdSelector = createSelector(
  [(state: RootState) => state.auth.connectedInstance, handleSelector],
  (profile, connectedInstance) =>
    connectedInstance ? getSiteReqId(connectedInstance, profile) : "",
);

export const getSiteIfNeeded =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().site.response) return;
    if (getState().site.loading) return;

    dispatch(getSite());
  };

export const getSoftware =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const reqId = siteReqIdSelector(getState());
    let software;

    dispatch(loadingSoftware());

    try {
      software = await clientSelector(getState()).getSoftware();
    } catch (error) {
      // Site or user changed before site response resolved
      if (reqId !== siteReqIdSelector(getState())) return;

      if (error instanceof UnsupportedSoftwareError) {
        dispatch(receivedUnsupportedSoftware());
      } else {
        dispatch(failedSoftware());
      }

      throw error;
    }

    // Site or user changed before software response resolved
    if (reqId !== siteReqIdSelector(getState())) return;

    dispatch(receivedSoftware(software));
  };

export const getSite =
  (existingSite?: GetSiteResponse) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(getSoftware());

    const reqId = siteReqIdSelector(getState());
    let site;

    dispatch(loadingSite());

    try {
      site = existingSite ?? (await clientSelector(getState()).getSite());
    } catch (error) {
      dispatch(failedSite());

      (async () => {
        await customBackOff(getState().site.failedAttempt);

        // Site or user changed before site response resolved
        if (reqId !== siteReqIdSelector(getState())) return;

        dispatch(getSite());
      })();

      throw error;
    }

    // Site or user changed before site response resolved
    if (reqId !== siteReqIdSelector(getState())) return;

    dispatch(receivedSite(site));
  };

export const showNsfw =
  (show: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    await clientSelector(getState())?.saveUserSettings({
      show_nsfw: show,
    });

    await dispatch(getSite());
  };

export const blockInstance =
  (block: boolean, id: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!id) return;

    await clientSelector(getState())?.blockInstance({
      instance_id: id,
      block,
    });

    await dispatch(getSite());
  };

function getSiteReqId(instance: string, handle: string | undefined) {
  if (!handle) return instance;

  return `${instance}-${handle}`;
}

export const modeSelector = createSelector(
  [
    (state: RootState) => state.site.software,
    (state: RootState) => state.site.softwareError,
  ],
  (software, softwareError) => {
    if (softwareError) return null;
    if (!software) return undefined;

    return ThreadiverseClient.resolveClient(software)?.mode ?? null;
  },
);

export const latchedModeSelector = createSelector(
  [
    (state: RootState) => state.site.latchedSoftware,
    (state: RootState) => state.site.softwareError,
  ],
  (software, softwareError) => {
    if (softwareError) return null;
    if (!software) return undefined;

    return ThreadiverseClient.resolveClient(software)?.mode ?? null;
  },
);
