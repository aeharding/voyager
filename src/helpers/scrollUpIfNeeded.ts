import { RefObject } from "react";
import { VirtuosoHandle } from "react-virtuoso";

type Page = HTMLElement | RefObject<VirtuosoHandle>;

export function scrollUpIfNeeded(activePage: Page | undefined) {
  if (!activePage) return false;

  if ("querySelector" in activePage) {
    const scroll =
      activePage?.querySelector('[data-virtuoso-scroller="true"]') ??
      activePage
        ?.querySelector("ion-content")
        ?.shadowRoot?.querySelector(".inner-scroll");

    if (scroll?.scrollTop) {
      scroll.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }
  } else {
    return new Promise((resolve) =>
      activePage.current?.getState((state) => {
        if (state.scrollTop) {
          activePage.current?.scrollToIndex({
            index: 0,
            behavior: "smooth",
          });
        }

        resolve(!!state.scrollTop);
      })
    );
  }
}
