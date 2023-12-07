import { useRef } from "react";
import { MutableRefObject } from "react";
import { getScrollParent } from "./dom";
import { useMemo } from "react";

/**
 * Sometimes we want to preserve the scroll position
 * relative to the bottom of the scroll view
 */
export default function usePreservePositionFromBottomInScrollView(
  elRef: MutableRefObject<HTMLElement | null>,
) {
  const saveTopOffsetRef = useRef<undefined | number>();

  function save() {
    if (!elRef.current) return;
    const scrollView = getScrollParent(elRef.current);
    if (!scrollView) return;

    saveTopOffsetRef.current = saveScrollPositionFromBottom(scrollView);
  }

  function restore() {
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
