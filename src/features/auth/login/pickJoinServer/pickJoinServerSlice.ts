import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch } from "../../../../store";
import * as lemmyverse from "../../../../services/lemmyverse";
import { intersectionWith, sortBy } from "lodash";
import { WHITELISTED_INSTANCES } from "./whitelist";

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

  dispatch(
    received(
      sortBy(
        intersectionWith(
          instances,
          WHITELISTED_INSTANCES,
          (a, b) => a.baseurl === b,
        ).filter((candidate) => {
          return candidate.icon;
        }),
        (instance) => -instance.trust.score,
      ),
    ),
  );
};

export default pickJoinServerSlice.reducer;
