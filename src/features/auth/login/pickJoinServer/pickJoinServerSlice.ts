import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch } from "../../../../store";
import * as lemmyverse from "../../../../services/lemmyverse";
import { intersectionWith, sortBy, uniq } from "lodash";
import { WHITELISTED_INSTANCES } from "./whitelist";
import { getCustomServers } from "../../../../services/app";
import { buildPrioritizeAndSortFn } from "../../../../helpers/array";

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

  const serverWhitelist = uniq([
    ...getCustomServers(),
    ...WHITELISTED_INSTANCES,
  ]);

  const unorderedInstances = sortBy(
    intersectionWith(instances, serverWhitelist, (a, b) => a.baseurl === b),
    (instance) => -instance.trust.score,
  );

  const customSortFn = buildPrioritizeAndSortFn(
    getCustomServers(),
    ({ baseurl }: lemmyverse.LVInstance) => baseurl,
  );

  dispatch(received(unorderedInstances.sort(customSortFn)));
};

export default pickJoinServerSlice.reducer;
