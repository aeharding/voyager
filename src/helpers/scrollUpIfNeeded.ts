import { isAndroid } from "./device";
import { findCurrentPage, findIonContentScrollView } from "./ionic";
import { AppScrollable } from "./useGetAppScrollable";

export function scrollUpIfNeeded(
  activePage: AppScrollable | null | undefined,
  index: number | undefined = undefined,
  behavior: "auto" | "smooth" = "smooth",
) {
  if (!activePage) return false;

  if ("querySelector" in activePage) {
    const scroll = findIonContentScrollView(activePage);

    if (scroll?.scrollTop) {
      scroll.scrollTo({ top: 0, behavior });
      return true;
    }
  } else {
    if (activePage.scrollOffset) {
      if (!index && behavior === "smooth") {
        findCurrentPage()
          ?.querySelector(".virtual-scroller")
          ?.scrollTo({
            top: 0,

            // Android/Chrome smooth scroll implementation is bad
            behavior: isAndroid() ? "auto" : "smooth",
          });
      } else {
        activePage.scrollToIndex(index ?? 0, {
          smooth: behavior === "smooth",
        });
      }

      return true;
    }
  }

  return false;
}
