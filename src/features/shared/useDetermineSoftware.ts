import {
  knownInstancesSelector,
  knownPiefedInstancesSelector,
} from "#/features/instances/instancesSlice";
import store, { useAppSelector } from "#/store";

export default function useDetermineSoftware() {
  const knownInstances = useAppSelector(knownInstancesSelector);
  const knownPiefedInstances = useAppSelector(knownPiefedInstancesSelector);

  return buildDetermineSoftware(knownInstances, knownPiefedInstances);
}

export function getDetermineSoftware(url: URL) {
  const state = store.getState();
  const knownInstances = knownInstancesSelector(state);
  const knownPiefedInstances = knownPiefedInstancesSelector(state);

  return buildDetermineSoftware(knownInstances, knownPiefedInstances)(url);
}

function buildDetermineSoftware(
  knownInstances: string[],
  knownPiefedInstances: string[],
) {
  return function determineSoftwareFromUrl(url: URL) {
    if (knownPiefedInstances.includes(url.hostname)) return "piefed";
    if (knownInstances.includes(url.hostname)) return "lemmy";
    return "unknown";
  };
}
