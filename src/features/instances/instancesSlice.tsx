import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FederatedInstances } from "threadiverse";

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

const KNOWN_SOFTWARE = ["lemmy", "piefed"];

export const knownInstancesSelectorBySoftware = createSelector(
  [
    (state: RootState) => state.instances.knownInstances,
    (state: RootState) => state.auth.connectedInstance,
    (state: RootState) => state.site.software,
  ],
  (knownInstances, connectedInstance, software) => {
    if (!knownInstances || knownInstances === "pending")
      return { [software?.name ?? "lemmy"]: [connectedInstance] };

    return groupKnownInstancesBySoftware(knownInstances, KNOWN_SOFTWARE);
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

        // Server has federation disabled
        if (!federated_instances) {
          federated_instances = {
            linked: [],
            allowed: [],
            blocked: [],
          };
        }

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

export type InstancesBySoftware = Record<string, string[]>;

function groupKnownInstancesBySoftware(
  knownInstances: FederatedInstances,
  knownSoftware: string[],
): InstancesBySoftware {
  const result: InstancesBySoftware = Object.fromEntries(
    knownSoftware.map((software) => [software, []]),
  );

  for (const instance of knownInstances.linked) {
    if (!instance.software) continue;

    const potentialInstanceSoftwareArr = result[instance.software];

    if (!potentialInstanceSoftwareArr) continue;

    potentialInstanceSoftwareArr.push(instance.domain);
  }

  return result;
}
