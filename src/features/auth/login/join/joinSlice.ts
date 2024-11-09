import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GetSiteResponse } from "lemmy-js-client";

import { getClient } from "#/services/lemmy";
import { AppDispatch, RootState } from "#/store";

interface JoinState {
  site: GetSiteResponse | undefined;
  url: string | undefined;
  loading: boolean;
}

const initialState: JoinState = {
  site: undefined,
  url: undefined,
  loading: false,
};

export const joinSlice = createSlice({
  name: "join",
  initialState,
  reducers: {
    selectedServer: (state, action: PayloadAction<string>) => {
      state.url = action.payload;
      state.site = undefined;
      state.loading = true;
    },
    received: (state, action: PayloadAction<GetSiteResponse>) => {
      state.site = action.payload;
      state.loading = false;
    },
    failed: (state) => {
      state.loading = false;
    },
  },
});

const { selectedServer, received, failed } = joinSlice.actions;

const urlSelector = (state: RootState) => state.join.url;

export const joinClientSelector = createSelector([urlSelector], (url) => {
  if (!url) return;

  return getClient(url);
});

export const requestJoinSiteData =
  (url: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(selectedServer(url));

    let site;

    try {
      site = await joinClientSelector(getState())?.getSite();
    } catch (error) {
      dispatch(failed());
      throw error;
    }

    if (!site) {
      dispatch(failed());
      return;
    }

    dispatch(received(site));

    return site;
  };

export default joinSlice.reducer;
