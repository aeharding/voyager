import { ThreadiverseClient, ThreadiverseMode } from "threadiverse";

import { useAppSelector } from "#/store";

export const OPTIMISTIC_MODE: ThreadiverseMode = "lemmyv0";

export function useMode() {
  const software = useAppSelector((state) => state.site.software);

  return software
    ? ThreadiverseClient.resolveClient(software)?.mode
    : undefined;
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
