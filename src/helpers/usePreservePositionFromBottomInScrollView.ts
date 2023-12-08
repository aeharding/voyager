import { useEffect, useRef } from "react";
import { MutableRefObject } from "react";
import { getScrollParent } from "./dom";
import { useMemo } from "react";

/**
 * Sometimes we want to preserve the scroll position
 * relative to the bottom of the scroll view. This function
 * observes reflow to programatically scroll until user interaction
 *
 * This is because sometimes images will load above the viewport
 * (and Safari doesn't have a good scroll anchoring implementation yet)
 *
 * Good test: https://lemmy.world/comment/5835936 (Load parent comments...)
 *
 * @param elRef An element within the scroll view wrapping all
 * content that can be observed for size changes
 */
export default function usePreservePositionFromBottomInScrollView(
  elRef: MutableRefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const saveTopOffsetRef = useRef<undefined | number>();
  const resizeObserverRef = useRef<ResizeObserver | undefined>();

  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  function _listen() {
    if (!enabled) return;

    if (!elRef.current) return;
    const scrollParent = getScrollParent(elRef.current);
    if (!scrollParent) return;
    scrollParent.addEventListener("mousedown", _unlisten);
    scrollParent.addEventListener("touchstart", _unlisten);
    scrollParent.addEventListener("wheel", _unlisten);

    if (!elRef.current || resizeObserverRef.current) return;
    resizeObserverRef.current = new ResizeObserver(() => restore());
    resizeObserverRef.current.observe(elRef.current);
  }

  function _unlisten() {
    if (!enabled) return;

    saveTopOffsetRef.current = undefined;
    resizeObserverRef.current?.disconnect();

    if (!elRef.current) return;
    const scrollParent = getScrollParent(elRef.current);
    if (!scrollParent) return;

    scrollParent.removeEventListener("mousedown", _unlisten);
    scrollParent.removeEventListener("touchstart", _unlisten);
    scrollParent.removeEventListener("wheel", _unlisten);
  }

  /**
   * Call before scroll position will change
   */
  function save() {
    if (!enabled) return;

    if (!elRef.current) return;
    const scrollView = getScrollParent(elRef.current);
    if (!scrollView) return;

    saveTopOffsetRef.current = saveScrollPositionFromBottom(scrollView);

    _listen();
  }

  /**
   * Call in react useEffect after value change that will affect the DOM
   *
   * Note: restore can be called multiple times.
   */
  function restore() {
    if (!enabled) return;

    const previousTopOffset = saveTopOffsetRef.current;
    if (previousTopOffset === undefined) return;
    if (!elRef.current) return;
    const scrollView = getScrollParent(elRef.current);
    if (!scrollView) return;

    requestAnimationFrame(() => {
      restoreScrollPositionFromBottom(scrollView, previousTopOffset);
    });
  }

  return useMemo(
    () => ({
      save,
      restore,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
}

function saveScrollPositionFromBottom(scrollableElement: HTMLElement): number {
  const scrollFromBottom =
    scrollableElement.scrollHeight -
    scrollableElement.scrollTop -
    scrollableElement.clientHeight;
  return scrollFromBottom;
}

// Define a function to restore the scroll position from the bottom
function restoreScrollPositionFromBottom(
  scrollableElement: HTMLElement,
  savedScrollPosition: number,
): void {
  const scrollTop =
    scrollableElement.scrollHeight -
    savedScrollPosition -
    scrollableElement.clientHeight;
  scrollableElement.scrollTop = scrollTop;
}
