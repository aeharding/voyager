import { useLayoutEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { imageLoaded } from "./imageSlice";
import { round } from "lodash";

export default function useMediaLoadObserver(src: string | undefined) {
  const dispatch = useAppDispatch();
  const aspectRatio = useAppSelector((state) =>
    src ? state.image.loadedBySrc[src] : undefined,
  );
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);
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

          switch (true) {
            case entry.target instanceof HTMLImageElement:
              width = entry.target.naturalWidth;
              height = entry.target.naturalHeight;
              break;
            case entry.target instanceof HTMLVideoElement:
              width = entry.target.videoWidth;
              height = entry.target.videoHeight;
              break;
            case entry.target instanceof HTMLCanvasElement:
              if (!entry.target.width && !entry.target.height) return; // canvas still loading
              width = entry.target.width;
              height = entry.target.height;
              break;
            default:
              return;
          }

          if (!width) return;

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
