import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import { clientSelector } from "../auth/authSlice";
import { FederatedInstances } from "lemmy-js-client";
import { db } from "../../services/db";

interface InstancesState {
  knownInstances: "pending" | FederatedInstances | undefined;
}

const initialState: InstancesState = {
  knownInstances: undefined,
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
    },
    receivedInstances: (state, action: PayloadAction<FederatedInstances>) => {
      state.knownInstances = action.payload;
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
    if (!knownInstances || knownInstances === "pending") return [];

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
    const connectedInstance = getState().auth.connectedInstance;

    // Already received, or in flight
    if (getState().instances.knownInstances) return;

    dispatch(pendingInstances());

    let federated_instances = await db.getFederatedInstances(connectedInstance);

    if (!federated_instances) {
      try {
        ({ federated_instances } = await clientSelector(
          getState(),
        ).getFederatedInstances());

        if (!federated_instances)
          throw new Error("No federated instances in response");

        db.setFederatedInstances(connectedInstance, federated_instances);
      } catch (error) {
        dispatch(failedInstances());
        throw error;
      }
    }

    dispatch(receivedInstances(federated_instances));
  };
