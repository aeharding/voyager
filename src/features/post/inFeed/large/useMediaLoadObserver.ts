import { useEffect, useRef, useState } from "react";

export default function useMediaLoadObserver() {
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const [loaded, _setLoaded] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | undefined>();

  useEffect(() => {
    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        if (
          (entry.target instanceof HTMLImageElement &&
            entry.target.naturalWidth) ||
          (entry.target instanceof HTMLVideoElement && entry.target.videoWidth)
        ) {
          setLoaded(true);
          return;
        }
      }
    };

    if (!mediaRef.current) return;

    resizeObserverRef.current = new ResizeObserver(handleResize);

    resizeObserverRef.current.observe(mediaRef.current);

    return destroyObserver;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setLoaded(loaded: boolean) {
    _setLoaded(loaded);
    destroyObserver();
  }

  function destroyObserver() {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = undefined;
  }

  return [mediaRef, loaded, setLoaded] as const;
}
