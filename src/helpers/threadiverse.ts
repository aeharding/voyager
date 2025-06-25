import { ThreadiverseMode } from "threadiverse";

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
