import { Page } from "../features/auth/AppContext";
import { isAndroid } from "./device";
import { findCurrentPage } from "./ionic";

export function scrollUpIfNeeded(
  activePage: Page | null | undefined,
  index: number | undefined = undefined,
  behavior: "auto" | "smooth" = "smooth",
) {
  if (!activePage?.current) return false;

  const current = activePage.current;

  if ("querySelector" in current) {
    const scroll =
      current.querySelector(".virtual-scroller") ??
      current
        .querySelector("ion-content")
        ?.shadowRoot?.querySelector(".inner-scroll");

    if (scroll?.scrollTop) {
      scroll.scrollTo({ top: 0, behavior });
      return true;
    }
  } else {
    if (current.scrollOffset) {
      if (!index && behavior === "smooth") {
        findCurrentPage()
          ?.querySelector(".virtual-scroller")
          ?.scrollTo({
            top: 0,

            // Android/Chrome smooth scroll implementation is bad
            behavior: isAndroid() ? "auto" : "smooth",
          });
      } else {
        current.scrollToIndex(index ?? 0, {
          smooth: behavior === "smooth",
        });
      }

      return true;
    }
  }

  return false;
}
