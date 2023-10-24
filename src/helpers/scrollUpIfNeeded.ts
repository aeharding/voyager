import { Page } from "../features/auth/AppContext";

export async function scrollUpIfNeeded(
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
      current.scrollToIndex(index ?? 0, {
        smooth: behavior === "smooth",
      });

      return true;
    }
  }

  return false;
}
