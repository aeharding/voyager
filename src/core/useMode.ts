import { ThreadiverseClient } from "threadiverse";

import { useAppSelector } from "#/store";

export default function useMode() {
  const software = useAppSelector((state) => state.site.software);

  return software
    ? ThreadiverseClient.resolveClient(software)?.mode
    : undefined;
}
