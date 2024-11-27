import {
  createAnimation,
  iosTransitionAnimation,
  mdTransitionAnimation,
  TransitionOptions,
} from "@ionic/core";
import { MouseEvent, TouchEvent } from "react";

import { memoryHistory } from "#/routes/common/Router";

const ION_CONTENT_ELEMENT_SELECTOR = "ion-content";

export function findCurrentPage() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const el = document.elementFromPoint(width / 2, height / 2) as Element | null;
  if (!el) return;
  return findClosestIonContent(el);
}

const ION_CONTENT_SELECTOR = `${ION_CONTENT_ELEMENT_SELECTOR}`;

/**
 * Queries the closest element matching the selector for IonContent.
 */
function findClosestIonContent(el: Element) {
  return el.closest<HTMLElement>(ION_CONTENT_SELECTOR);
}

export const preventModalSwipeOnTextSelection = {
  onTouchMoveCapture: (e: TouchEvent | MouseEvent) => {
    if (!window.getSelection()?.toString()) return true;

    e.stopPropagation();

    return true;
  },
};

export const attributedPreventOnClickNavigationBug = {
  onClick: preventOnClickNavigationBug,
};

/**
 * There's a weird bug where quickly double tapping a link
 * can double mount a page,
 * which causes Ionic Router to get into a bad state.
 *
 * I haven't been able to replicate this with an example app
 *
 * @returns true if prevented
 */
export function preventOnClickNavigationBug(e: MouseEvent) {
  if (!(e.target instanceof HTMLElement)) return false;

  const linker = e.target.closest("[href],[router-link]");
  if (!linker) return false;

  const link =
    linker.getAttribute("router-link") || linker.getAttribute("href");

  const pathname = memoryHistory?.location.pathname ?? location.pathname;

  if (pathname === link) {
    e.preventDefault();

    return true;
  }

  return false;
}

export const pageTransitionAnimateBackOnly = (
  baseEl: HTMLElement,
  opts: TransitionOptions,
) => {
  // Do not animate into view
  if (opts.direction === "forward") return createAnimation();

  // Later, use normal animation for swipe back
  return opts.mode === "ios"
    ? iosTransitionAnimation(baseEl, opts)
    : mdTransitionAnimation(baseEl, opts);
};

export function stopIonicTapClick() {
  document.dispatchEvent(new CustomEvent("ionGestureCaptured"));
}

export function findIonContentScrollView(page: HTMLElement) {
  return (
    page.querySelector(".virtual-scroller") ??
    page
      .querySelector("ion-content")
      ?.shadowRoot?.querySelector(".inner-scroll")
  );
}
