import { ua } from "./device";

export const useScrollIntoViewWorkaround = ua.getEngine().name === "WebKit";

// Safari's implementation of scrollIntoView is super glitchy
// so just do our own thing 🤷‍♂️
export function scrollIntoView(
  element: HTMLElement,
  bottomOffset?: number,
  smooth = true
): void {
  // Don't use this hacky workaround for user agents with sane scrollIntoView implementation
  if (!useScrollIntoViewWorkaround) {
    element.scrollIntoView({ behavior: smooth ? "smooth" : undefined });
    return;
  }

  const parentScroll = getScrollParent(element);

  if (!parentScroll) {
    return; // Element's parent scroll view not found
  }

  const scrollPaddingTop = parseInt(
    getComputedStyle(parentScroll).scrollPaddingTop || "0",
    10
  );
  const scrollPaddingBottom =
    bottomOffset !== undefined
      ? bottomOffset
      : parseInt(
          getComputedStyle(parentScroll).scrollPaddingBottom ||
            getComputedStyle(parentScroll).scrollMarginBottom ||
            "0",
          10
        );

  const scrollTop = calculateScrollTop(
    element,
    parentScroll,
    scrollPaddingTop,
    scrollPaddingBottom
  );

  parentScroll.scrollTo({
    top: scrollTop,
    behavior: smooth ? "smooth" : undefined,
  });
}

function calculateScrollTop(
  element: HTMLElement,
  parentScroll: HTMLElement,
  scrollPaddingTop: number,
  scrollPaddingBottom: number
): number {
  const elementRect = element.getBoundingClientRect();
  const parentRect = parentScroll.getBoundingClientRect();

  const scrollPaddingTopValue = Number.isNaN(scrollPaddingTop)
    ? 0
    : scrollPaddingTop;
  const scrollPaddingBottomValue = Number.isNaN(scrollPaddingBottom)
    ? 0
    : scrollPaddingBottom;

  const elementTop = elementRect.top - parentRect.top - scrollPaddingTopValue;
  const elementBottom =
    elementRect.bottom - parentRect.top + scrollPaddingBottomValue;

  if (elementTop < 0) {
    return parentScroll.scrollTop + elementTop;
  }

  if (elementBottom > parentScroll.offsetHeight) {
    return parentScroll.scrollTop + elementBottom - parentScroll.offsetHeight;
  }

  return parentScroll.scrollTop;
}

export function getScrollParent(
  node: HTMLElement | undefined
): HTMLElement | undefined {
  if (!node) return;

  if (
    node.tagName === "ION-CONTENT" ||
    node.classList.contains("ion-content-scroll-host") ||
    node.hasAttribute("data-virtuoso-scroller")
  ) {
    return node;
  } else if (node.parentNode instanceof HTMLElement) {
    return getScrollParent(node.parentNode);
  }
}
