import { ComponentRef, useEffect, useRef } from "react";

import { imageLoaded } from "#/features/media/imageSlice";
import { useAppDispatch } from "#/store";

import type GalleryMedia from "./gallery/GalleryMedia";
import useImageData, { isLoadedImageData } from "./useImageData";

export default function useMediaLoadObserver(src: string | undefined) {
  const dispatch = useAppDispatch();
  const imageData = useImageData(src);
  const mediaRef = useRef<ComponentRef<typeof GalleryMedia>>(null);
  const resizeObserverRef = useRef<ResizeObserver | undefined>(undefined);

  useEffect(() => {
    let destroyed = false;

    function setupObserver() {
      if (destroyed) return;

      if (isLoadedImageData(imageData)) return;
      if (!src) return;
      if (!mediaRef.current) {
        // react-reverse-portal refs can take some time to setup. Try again on next paint
        requestAnimationFrame(setupObserver);
        return;
      }

      const handleResize = (entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          const target = entry.target as typeof mediaRef.current;

          const dimensions = getTargetDimensions(target);
          if (!dimensions) return;
          const { width, height } = dimensions;

          dispatch(imageLoaded({ src, width, height }));
          destroyObserver();
          return;
        }
      };

      resizeObserverRef.current = new ResizeObserver(handleResize);

      resizeObserverRef.current.observe(mediaRef.current);
    }

    setupObserver();

    return () => {
      destroyed = true;
      destroyObserver();
    };
  }, [imageData, dispatch, src]);

  function destroyObserver() {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = undefined;
  }

  return [mediaRef, imageData] as const;
}

export function getTargetDimensions(target: ComponentRef<typeof GalleryMedia>) {
  let width, height;

  switch (true) {
    case target instanceof HTMLImageElement:
      width = target.naturalWidth;
      height = target.naturalHeight;
      break;
    case target instanceof HTMLVideoElement:
      width = target.videoWidth;
      height = target.videoHeight;
      break;
    case target instanceof HTMLCanvasElement:
      width = target.width;
      height = target.height;
      break;
    default:
      return;
  }

  if (!width || !height) return;

  return { width, height };
}
