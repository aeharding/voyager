import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { WHITELISTED_SERVERS } from "#/features/auth/login/data/servers";
import { buildPrioritizeAndSortFn } from "#/helpers/array";
import { isMinimumSupportedLemmyVersion } from "#/helpers/lemmy";
import { getCustomServers } from "#/services/app";
import * as lemmyverse from "#/services/lemmyverse";
import { AppDispatch } from "#/store";

interface PickJoinServerState {
  instances: lemmyverse.LVInstance[] | undefined;
}

const initialState: PickJoinServerState = {
  instances: undefined,
};

export const pickJoinServerSlice = createSlice({
  name: "pickJoinServer",
  initialState,
  reducers: {
    received: (state, action: PayloadAction<lemmyverse.LVInstance[]>) => {
      state.instances = action.payload;
    },
  },
});

const { received } = pickJoinServerSlice.actions;

export const getInstances = () => async (dispatch: AppDispatch) => {
  const instances = await lemmyverse.getFullList();

  const serverWhitelist = [
    ...new Set([...getCustomServers(), ...WHITELISTED_SERVERS]),
  ];

  const unorderedInstances = instances
    .filter(({ baseurl }) => serverWhitelist.includes(baseurl))
    .sort((a, b) => b.trust.score - a.trust.score)
    .filter(
      (server) => server.open && isMinimumSupportedLemmyVersion(server.version),
    );

  const customSortFn = buildPrioritizeAndSortFn(
    getCustomServers(),
    ({ baseurl }: lemmyverse.LVInstance) => baseurl,
  );

  dispatch(received(unorderedInstances.sort(customSortFn)));
};

export default pickJoinServerSlice.reducer;
