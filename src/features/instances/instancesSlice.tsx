import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FederatedInstances } from "lemmy-js-client";

import { clientSelector, urlSelector } from "#/features/auth/authSelectors";
import { db } from "#/services/db";
import { customBackOff } from "#/services/lemmy";
import { AppDispatch, RootState } from "#/store";

interface InstancesState {
  knownInstances: "pending" | FederatedInstances | undefined;
  failedCount: number;
}

const initialState: InstancesState = {
  knownInstances: undefined,
  failedCount: 0,
};

export const instancesSlice = createSlice({
  name: "instances",
  initialState,
  reducers: {
    pendingInstances: (state) => {
      state.knownInstances = "pending";
    },
    failedInstances: (state) => {
      state.knownInstances = undefined;
      state.failedCount++;
    },
    receivedInstances: (state, action: PayloadAction<FederatedInstances>) => {
      state.knownInstances = action.payload;
      state.failedCount = 0;
    },
    resetInstances: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  receivedInstances,
  pendingInstances,
  failedInstances,
  resetInstances,
} = instancesSlice.actions;

export default instancesSlice.reducer;

export const knownInstancesSelector = createSelector(
  [
    (state: RootState) => state.instances.knownInstances,
    (state: RootState) => state.auth.connectedInstance,
  ],
  (knownInstances, connectedInstance) => {
    if (!knownInstances || knownInstances === "pending")
      return [connectedInstance];

    return [
      connectedInstance,
      ...knownInstances.linked
        .filter((instance) => instance.software === "lemmy")
        .map((instance) => instance.domain),
    ];
  },
);

export const getInstances =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const connectedInstance = urlSelector(getState());
    const client = clientSelector(getState());

    // Already received, or in flight
    if (getState().instances.knownInstances) return;

    dispatch(pendingInstances());

    let federated_instances =
      await db.getCachedFederatedInstances(connectedInstance);

    // https://github.com/aeharding/voyager/issues/935
    if (!federated_instances?.linked) {
      try {
        ({ federated_instances } = await client.getFederatedInstances());

        if (!federated_instances?.linked)
          throw new Error("No federated instances in response");

        db.setCachedFederatedInstances(connectedInstance, federated_instances);
      } catch (error) {
        dispatch(failedInstances());

        (async () => {
          await customBackOff(getState().instances.failedCount);

          // Instance was switched before request could resolved. Bail
          if (connectedInstance !== urlSelector(getState())) return;

          dispatch(getInstances());
        })();
        throw error;
      }
    }

    // Instance was switched before request could resolved. Bail
    if (connectedInstance !== urlSelector(getState())) return;

    dispatch(receivedInstances(federated_instances));
  };
