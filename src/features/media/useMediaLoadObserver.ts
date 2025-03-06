import { ComponentRef, useEffect, useRef } from "react";

import { imageLoaded } from "#/features/media/imageSlice";
import type Media from "#/features/media/Media";
import { useAppDispatch } from "#/store";

import useAspectRatio, { isLoadedAspectRatio } from "./useAspectRatio";

export default function useMediaLoadObserver(src: string | undefined) {
  const dispatch = useAppDispatch();
  const aspectRatio = useAspectRatio(src);
  const mediaRef = useRef<ComponentRef<typeof Media>>(null);
  const resizeObserverRef = useRef<ResizeObserver>(undefined);

  useEffect(() => {
    let destroyed = false;

    function setupObserver() {
      if (destroyed) return;

      if (isLoadedAspectRatio(aspectRatio)) return;
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

          dispatch(imageLoaded({ src, aspectRatio: width / height }));
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
  }, [aspectRatio, dispatch, src]);

  function destroyObserver() {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = undefined;
  }

  return [mediaRef, aspectRatio] as const;
}

export function getTargetDimensions(target: ComponentRef<typeof Media>) {
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
