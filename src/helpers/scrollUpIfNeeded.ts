import { Page } from "../features/auth/AppContext";

export async function scrollUpIfNeeded(
  activePage: Page | undefined,
  index: number | undefined = undefined,
  behavior: "auto" | "smooth" = "smooth"
) {
  if (!activePage?.current) return false;

  const current = activePage.current;

  if ("querySelector" in current) {
    const scroll =
      current.querySelector('[data-virtuoso-scroller="true"]') ??
      current
        .querySelector("ion-content")
        ?.shadowRoot?.querySelector(".inner-scroll");

    if (scroll?.scrollTop) {
      scroll.scrollTo({ top: 0, behavior });
      return true;
    }
  } else {
    return new Promise<boolean>((resolve) =>
      current.getState((state) => {
        if (state.scrollTop) {
          if (index != null) {
            current.scrollToIndex({
              index,
              behavior,
            });
          } else {
            current.scrollTo({
              top: 0,
              behavior,
            });
          }
        }

        resolve(!!state.scrollTop);
      })
    );
  }

  return false;
}
