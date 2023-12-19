import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { GetSiteResponse } from "lemmy-js-client";
import { AppDispatch, RootState } from "../../store";
import { clientSelector, handleSelector } from "./authSlice";
import { getRemoteHandle } from "../../helpers/lemmy";

interface SiteState {
  failedAttempt: number;
  reqId: string;
  response: GetSiteResponse | undefined;
}

const initialState: SiteState = {
  reqId: "",
  failedAttempt: 0,
  response: undefined,
};

export const siteSlice = createSlice({
  name: "site",
  initialState,
  reducers: {
    failedSite(state) {
      state.failedAttempt++;
    },
    receivedSite(
      state,
      action: PayloadAction<{ site: GetSiteResponse; reqId: string }>,
    ) {
      state.response = action.payload.site;
      state.failedAttempt = 0;
      state.reqId = action.payload.reqId;
    },
    reset() {
      return initialState;
    },
  },
});

// Action creators are generated for each case reducer function
export const { failedSite, receivedSite } = siteSlice.actions;

export default siteSlice.reducer;

export const isAdminSelector = (state: RootState) =>
  state.site.response?.my_user?.local_user_view.local_user.admin;

export const isDownvoteEnabledSelector = (state: RootState) =>
  state.site.response?.site_view.local_site.enable_downvotes !== false;

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

export const siteReqIdSelector = createSelector(
  [(state: RootState) => state.auth.connectedInstance, handleSelector],
  (handle, connectedInstance) =>
    connectedInstance ? getSiteReqId(connectedInstance, handle) : "",
);

export const getSiteIfNeeded =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    if (
      getState().site.reqId &&
      siteReqIdSelector(getState()) === getState().site.reqId
    )
      return;

    dispatch(getSite());
  };

export const getSite =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const reqId = siteReqIdSelector(getState());
    let site;

    try {
      if (
        getState().site.failedAttempt < 5 &&
        getState().auth.connectedInstance === "lemmy.world"
      )
        throw new Error("test fail");

      site = await clientSelector(getState()).getSite();
    } catch (error) {
      dispatch(failedSite());

      (async () => {
        await customBackOff(getState().site.failedAttempt);

        dispatch(getSite());
      })();

      throw error;
    }

    // Site or user changed before site response resolved
    if (reqId !== siteReqIdSelector(getState())) return;

    dispatch(receivedSite({ site, reqId }));
  };

export const showNsfw =
  (show: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    // https://github.com/LemmyNet/lemmy/issues/3565
    const person = getState().site.response?.my_user?.local_user_view.person;

    if (!person || handleSelector(getState()) !== getRemoteHandle(person))
      throw new Error("user mismatch");

    await clientSelector(getState())?.saveUserSettings({
      avatar: person?.avatar || "",
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

const customBackOff = async (attempt = 0, maxRetries = 5) => {
  await new Promise((resolve) => {
    setTimeout(resolve, Math.min(attempt, maxRetries) * 4_000);
  });
};
