import {
  InstancesBySoftware,
  knownInstancesSelectorBySoftware,
} from "#/features/instances/instancesSlice";
import store, { useAppSelector } from "#/store";

export default function useDetermineSoftware() {
  const knownInstancesBySoftware = useAppSelector(
    knownInstancesSelectorBySoftware,
  );

  return buildDetermineSoftware(knownInstancesBySoftware);
}

export function getDetermineSoftware(url: URL) {
  const state = store.getState();
  const knownInstancesBySoftware = knownInstancesSelectorBySoftware(state);

  const knownInstanceSoftware = buildDetermineSoftware(
    knownInstancesBySoftware,
  )(url);

  return knownInstanceSoftware;
}

function buildDetermineSoftware(knownInstancesBySoftware: InstancesBySoftware) {
  return function determineSoftwareFromUrl(url: URL) {
    for (const software in knownInstancesBySoftware) {
      if (knownInstancesBySoftware[software]?.includes(url.hostname))
        return software;
    }

    return "unknown";
  };
}
