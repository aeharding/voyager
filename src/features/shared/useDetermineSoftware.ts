import {
  knownLemmyInstancesSelector,
  knownPiefedInstancesSelector,
} from "#/features/instances/instancesSlice";
import store, { useAppSelector } from "#/store";

export default function useDetermineSoftware() {
  const knownInstances = useAppSelector(knownLemmyInstancesSelector);
  const knownPiefedInstances = useAppSelector(knownPiefedInstancesSelector);

  return buildDetermineSoftware(knownInstances, knownPiefedInstances);
}

export function getDetermineSoftware(url: URL) {
  const state = store.getState();
  const knownLemmyInstances = knownLemmyInstancesSelector(state);
  const knownPiefedInstances = knownPiefedInstancesSelector(state);

  const knownInstanceSoftware = buildDetermineSoftware(
    knownLemmyInstances,
    knownPiefedInstances,
  )(url);

  return knownInstanceSoftware;
}

function buildDetermineSoftware(
  knownLemmyInstances: string[],
  knownPiefedInstances: string[],
) {
  return function determineSoftwareFromUrl(url: URL) {
    if (knownPiefedInstances.includes(url.hostname)) return "piefed";
    if (knownLemmyInstances.includes(url.hostname)) return "lemmy";
    return "unknown";
  };
}
