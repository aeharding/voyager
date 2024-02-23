import { ComponentRef, useLayoutEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { imageLoaded } from "./imageSlice";
import { round } from "lodash";
import PostMedia from "../../../media/gallery/PostMedia";

export default function useMediaLoadObserver(src: string | undefined) {
  const dispatch = useAppDispatch();
  const aspectRatio = useAppSelector((state) =>
    src ? state.image.loadedBySrc[src] : undefined,
  );
  const mediaRef = useRef<ComponentRef<typeof PostMedia>>(null);
  const resizeObserverRef = useRef<ResizeObserver | undefined>();

  useLayoutEffect(() => {
    let destroyed = false;

    function setupObserver() {
      if (destroyed) return;

      if (aspectRatio && aspectRatio > 0) return;
      if (!src) return;
      if (!mediaRef.current) {
        // react-reverse-portal refs can take some time to setup. Try again on next paint
        requestAnimationFrame(setupObserver);
        return;
      }

      const handleResize = (entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          let width, height;

          const target = entry.target as typeof mediaRef.current;

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

          dispatch(imageLoaded({ src, aspectRatio: round(width / height, 6) }));
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
