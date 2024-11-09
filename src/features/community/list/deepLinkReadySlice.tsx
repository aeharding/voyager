import { createSlice } from "@reduxjs/toolkit";

import { isInstalled } from "#/helpers/device";

interface DeepLinkReadySlice {
  /**
   * Whether app is ready to accept deep link route pushes
   */
  ready: boolean;
}

const initialState: DeepLinkReadySlice = {
  // not-installed is always initially bootstrapped, because no initial page push/redirect is done
  ready: !isInstalled(),
};

// The only purpose of
export const deepLinkReadySlice = createSlice({
  name: "deepLinkReady",
  initialState,
  reducers: {
    appIsReadyToAcceptDeepLinks(state) {
      state.ready = true;
    },
  },
});

// Action creators are generated for each case reducer function
export const { appIsReadyToAcceptDeepLinks } = deepLinkReadySlice.actions;

export default deepLinkReadySlice.reducer;
