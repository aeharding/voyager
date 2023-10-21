import {
  Dictionary,
  PayloadAction,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import { clientSelector } from "../auth/authSlice";
import { FederatedInstances } from "lemmy-js-client";

interface InstancesState {
  knownInstancesByInstance: Dictionary<"pending" | FederatedInstances>;
}

const initialState: InstancesState = {
  knownInstancesByInstance: {},
};

export const instancesSlice = createSlice({
  name: "instances",
  initialState,
  reducers: {
    pendingInstances: (state, action: PayloadAction<string>) => {
      state.knownInstancesByInstance[action.payload] = "pending";
    },
    failedInstances: (state, action: PayloadAction<string>) => {
      delete state.knownInstancesByInstance[action.payload];
    },
    receivedInstances: (
      state,
      action: PayloadAction<{
        instances: FederatedInstances;
        connectedInstance: string;
      }>,
    ) => {
      state.knownInstancesByInstance[action.payload.connectedInstance] =
        action.payload.instances;
    },
  },
});

// Action creators are generated for each case reducer function
export const { receivedInstances, pendingInstances, failedInstances } =
  instancesSlice.actions;

export default instancesSlice.reducer;

export const knownInstancesSelector = createSelector(
  [
    (state: RootState) => state.instances.knownInstancesByInstance,
    (state: RootState) => state.auth.connectedInstance,
  ],
  (knownInstancesByInstance, connectedInstance) => {
    const instances = knownInstancesByInstance[connectedInstance];

    if (!instances || instances === "pending") return [];

    return [
      connectedInstance,
      ...instances.linked
        .filter((instance) => instance.software === "lemmy")
        .map((instance) => instance.domain),
    ];
  },
);

export const getInstances =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const connectedInstance = getState().auth.connectedInstance;

    // Already received, or in flight
    if (getState().instances.knownInstancesByInstance[connectedInstance])
      return;

    dispatch(pendingInstances(connectedInstance));

    let federated_instances;

    try {
      ({ federated_instances } = await clientSelector(
        getState(),
      ).getFederatedInstances());

      if (!federated_instances)
        throw new Error("No federated instances in response");
    } catch (error) {
      dispatch(failedInstances(connectedInstance));
      throw error;
    }

    dispatch(
      receivedInstances({
        instances: federated_instances,
        connectedInstance,
      }),
    );
  };
