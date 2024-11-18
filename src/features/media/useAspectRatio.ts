import { useAppSelector } from "#/store";

export default function useAspectRatio(src: string | undefined) {
  return useAppSelector((state) =>
    src ? state.image.loadedBySrc[src] : undefined,
  );
}

export function isLoadedAspectRatio(aspectRatio: number | undefined) {
  return !!aspectRatio && aspectRatio > 0;
}
