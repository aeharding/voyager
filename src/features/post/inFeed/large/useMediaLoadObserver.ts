import { useCallback, useEffect, useRef } from "react";
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

  const onLoad = useCallback(
    (target: Element) => {
      if (!src) return;
      if (aspectRatio && aspectRatio > 0) return;

      if (
        !(target instanceof HTMLImageElement) &&
        !(target instanceof HTMLVideoElement)
      )
        return;

      const width =
        target instanceof HTMLImageElement
          ? target.naturalWidth
          : target.videoWidth;
      const height =
        target instanceof HTMLImageElement
          ? target.naturalHeight
          : target.videoHeight;

      if (!width) return;

      dispatch(imageLoaded({ src, aspectRatio: round(width / height, 6) }));
      destroyObserver();
    },
    [dispatch, src, aspectRatio],
  );

  useEffect(() => {
    if (aspectRatio) return;
    if (!src) return;
    if (!mediaRef.current) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        onLoad(entry.target);
        return;
      }
    };

    resizeObserverRef.current = new ResizeObserver(handleResize);

    resizeObserverRef.current.observe(mediaRef.current);

    return destroyObserver;
  }, [aspectRatio, dispatch, src, onLoad]);

  function destroyObserver() {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = undefined;
  }

  return [mediaRef, aspectRatio, onLoad] as const;
}
