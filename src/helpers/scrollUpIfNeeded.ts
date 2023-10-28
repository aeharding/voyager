import { Page } from "../features/auth/AppContext";
import { isAndroid } from "./device";
import { findCurrentPage } from "./ionic";

export function scrollUpIfNeeded(
  activePage: Page | null | undefined,
  index: number | undefined = undefined,
  behavior: "auto" | "smooth" = "smooth",
) {
  if (!index) {
    const page = findCurrentPage();

    if (!page) return false;

    const scrollView =
      page.querySelector(".virtual-scroller") ??
      page?.shadowRoot?.querySelector(".inner-scroll");

    if (!scrollView) return false;
    if (!scrollView.scrollTop) return false;

    scrollView.scrollTo({
      top: 0,
      behavior:
        isAndroid() && scrollView.classList.contains("virtual-scroller")
          ? "auto"
          : behavior,
    });

    return true;
  }

  if (!activePage?.current) return false;

  const current = activePage.current;

  if ("scrollToIndex" in current) {
    if (!current.scrollOffset) return false;

    current.scrollToIndex(index ?? 0, {
      smooth: behavior === "smooth",
    });

    return true;
  }

  return false;
}
