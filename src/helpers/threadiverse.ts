import { uniq } from "es-toolkit";
import {
  SearchSortType,
  ThreadiverseClient,
  ThreadiverseMode,
} from "threadiverse";

import { modeSelector } from "#/features/auth/siteSlice";
import { useAppSelector } from "#/store";

export const OPTIMISTIC_MODE: ThreadiverseMode = "lemmyv0";

export function useMode() {
  return useAppSelector(modeSelector);
}

export function formatMode(mode: ThreadiverseMode): string {
  switch (mode) {
    case "lemmyv0":
    case "lemmyv1":
      return "Lemmy";
    case "piefed":
      return "Piefed";
  }
}

export function getTopAllSearchSort(mode: ThreadiverseMode): SearchSortType {
  switch (mode) {
    case "lemmyv0":
      return { sort: "TopAll", mode } as const;
    case "lemmyv1":
      return { sort: "Top", mode } as const;
    case "piefed":
      return { sort: "Active", mode } as const;
  }
}

export const KNOWN_SOFTWARE = uniq(
  ThreadiverseClient.supportedSoftware.map((client) => client.softwareName),
);
