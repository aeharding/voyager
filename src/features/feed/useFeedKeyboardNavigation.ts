import { RefObject, useEffect, useEffectEvent } from "react";
import { VListHandle } from "virtua";

import { findStartIndex } from "#/helpers/virtua";

export type FeedKeyboardNavigationDirection = "next" | "previous";

export interface FeedKeyboardNavigationOptions<I> {
  isItemActive: (item: I) => boolean;
  onSelect: (item: I) => void;
}

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "[contenteditable]:not([contenteditable='false'])",
  "[role='combobox']",
  "[role='textbox']",
  "ion-button",
  "ion-input",
  "ion-searchbar",
  "ion-select",
  "ion-textarea",
].join(",");

const PRESENTED_OVERLAY_SELECTOR = [
  "ion-action-sheet:not(.overlay-hidden)",
  "ion-alert:not(.overlay-hidden)",
  "ion-modal:not(.overlay-hidden)",
  "ion-picker:not(.overlay-hidden)",
  "ion-popover:not(.overlay-hidden)",
].join(",");

export function getFeedKeyboardNavigationDirection(
  event: Pick<KeyboardEvent, "altKey" | "ctrlKey" | "key" | "metaKey">,
): FeedKeyboardNavigationDirection | undefined {
  if (event.altKey || event.ctrlKey || event.metaKey) return;

  switch (event.key.toLowerCase()) {
    case "j":
    case "arrowdown":
      return "next";
    case "k":
    case "arrowup":
      return "previous";
  }
}

export function shouldIgnoreFeedKeyboardNavigation(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing) return true;
  if (document.querySelector(PRESENTED_OVERLAY_SELECTOR)) return true;

  const eventPath = event.composedPath();
  const targets = eventPath.length ? eventPath : [event.target];

  return targets.some(
    (target) =>
      target instanceof Element && target.matches(INTERACTIVE_SELECTOR),
  );
}

export default function useFeedKeyboardNavigation<I>(
  options: FeedKeyboardNavigationOptions<I> | undefined,
  items: I[],
  headerOffset: number,
  listRef: RefObject<VListHandle | null>,
  pageRef: RefObject<HTMLElement | null> | undefined,
) {
  const enabled = !!options;

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const direction = getFeedKeyboardNavigationDirection(event);

    if (!direction || shouldIgnoreFeedKeyboardNavigation(event)) return;

    const page = pageRef?.current;
    if (
      !page ||
      page.classList.contains("ion-hide") ||
      page.classList.contains("ion-page-hidden")
    )
      return;

    const list = listRef.current;
    if (!list || !items.length || !options) return;

    const activeIndex = items.findIndex(options.isItemActive);
    const firstVisibleIndex = Math.max(
      0,
      Math.min(items.length - 1, findStartIndex(list) - headerOffset),
    );

    const nextIndex = (() => {
      if (activeIndex < 0) return firstVisibleIndex;

      const offset = direction === "next" ? 1 : -1;
      return Math.max(0, Math.min(items.length - 1, activeIndex + offset));
    })();

    event.preventDefault();
    if (nextIndex === activeIndex) return;

    list.scrollToIndex(nextIndex + headerOffset, { align: "nearest" });
    options.onSelect(items[nextIndex]!);
  });

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
