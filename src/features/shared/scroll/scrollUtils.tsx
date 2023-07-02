import { RefObject } from "react";
import { VirtuosoHandle } from "react-virtuoso";

function findScrollEl(activePage: HTMLElement) {
  return (
    activePage?.querySelector('[data-virtuoso-scroller="true"]') ??
    activePage
      ?.querySelector("ion-content")
      ?.shadowRoot?.querySelector(".inner-scroll")
  );
}

export function activateFabOnPagePosition(
  activePage: HTMLElement | RefObject<VirtuosoHandle> | undefined,
  previousTop: number,
  activated: boolean,
  setActivated: (arg0: boolean) => void
) {
  if (!activated || !activePage) return;
  if ("querySelector" in activePage) {
    const scroll = findScrollEl(activePage);

    if (scroll?.scrollTop) {
      setActivated(scroll.scrollTop !== previousTop);
    }
  } else {
    activePage.current?.getState((state) => {
      setActivated(state.scrollTop !== 0);
    });
  }
}

export async function scrollFabIfNeeded(
  activePage: HTMLElement | RefObject<VirtuosoHandle> | undefined,
  previousTop: number,
  setPreviousTop: (arg0: number) => void,
  setActivated: (arg0: boolean) => void
) {
  if (!activePage) return false;

  if ("querySelector" in activePage) {
    const scroll = findScrollEl(activePage);

    if (scroll?.scrollTop) {
      scroll.scrollTo({
        top: scroll.scrollTop ? 0 : previousTop,
        behavior: "smooth",
      });
      setPreviousTop(scroll.scrollTop);
      setActivated(scroll.scrollTop !== 0);
      return true;
    }
  } else {
    return new Promise((resolve) =>
      activePage.current?.getState((state) => {
        const shouldScroll = state.scrollTop !== previousTop;
        if (shouldScroll) {
          activePage.current?.scrollTo({
            top: state.scrollTop ? 0 : previousTop,
            behavior: "smooth",
          });
          setActivated(state.scrollTop !== 0);
          setPreviousTop(state.scrollTop);
        }
        resolve(shouldScroll);
      })
    );
  }
}
