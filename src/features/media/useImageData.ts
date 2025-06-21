import { useAppSelector } from "#/store";

import { IMAGE_FAILED, ImageMetadata } from "./imageSlice";

export default function useImageData(src: string | undefined) {
  return useAppSelector((state) =>
    src ? state.image.loadedBySrc[src] : undefined,
  );
}

export function isLoadedImageData(
  imageData: ImageMetadata | typeof IMAGE_FAILED | undefined,
) {
  return typeof imageData === "object" && imageData.aspectRatio > 0;
}
