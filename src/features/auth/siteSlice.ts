import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  GetSiteResponse,
  ProviderInfo,
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
  unsupportedSoftware: boolean;
}

const initialState: SiteState = {
  failedAttempt: 0,
  loading: false,
  response: undefined,
  software: undefined,
  unsupportedSoftware: false,
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
    receivedSoftware(state, action: PayloadAction<ProviderInfo>) {
      state.software = action.payload;
    },
    receivedUnsupportedSoftware(state) {
      state.unsupportedSoftware = true;
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
} = siteSlice.actions;

export default siteSlice.reducer;

export const isAdminSelector = (state: RootState) =>
  state.site.response?.my_user?.local_user_view.local_user.admin;

export const isDownvoteEnabledSelector = (state: RootState) =>
  // @ts-expect-error TODO required changes for lemmy v0.20.0 https://github.com/aeharding/voyager/issues/1683
  state.site.response?.site_view.local_site.enable_downvotes !== false;

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

    dispatch(getSoftware());
    dispatch(getSite());
  };

export const getSoftware =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const reqId = siteReqIdSelector(getState());
    let software;

    try {
      software = await clientSelector(getState()).getSoftware();
    } catch (error) {
      if (error instanceof UnsupportedSoftwareError) {
        dispatch(receivedUnsupportedSoftware());
      }

      throw error;
    }

    // Site or user changed before software response resolved
    if (reqId !== siteReqIdSelector(getState())) return;

    dispatch(receivedSoftware(software));
  };

export const getSite =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const reqId = siteReqIdSelector(getState());
    let site;

    dispatch(loadingSite());

    try {
      site = await clientSelector(getState()).getSite();
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
