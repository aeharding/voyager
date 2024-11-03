import { Page } from "#/features/auth/AppContext";

import { isAndroid } from "./device";
import { findCurrentPage, findIonContentScrollView } from "./ionic";

export function scrollUpIfNeeded(
  activePage: Page | null | undefined,
  index: number | undefined = undefined,
  behavior: "auto" | "smooth" = "smooth",
) {
  if (!activePage?.current) return false;

  const current = activePage.current;

  if ("querySelector" in current) {
    const scroll = findIonContentScrollView(current);

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
