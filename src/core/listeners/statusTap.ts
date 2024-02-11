import { findCurrentPage } from "../../helpers/ionic";
import { Browser } from "@capacitor/browser";

let savedScrollTop = 0;

/**
 * statusTap is emitted with open full screen browser
 */
let browserOpen = false;

export function notifyStatusTapThatBrowserWasOpened() {
  browserOpen = true;
}

Browser.addListener("browserFinished", () => {
  browserOpen = false;
});

// statusTap is a capacitor (native app), iOS-only event
// https://capacitorjs.com/docs/apis/status-bar#example
//
// This custom implementation allows scrolling back down in
// the feed by tapping again after initially tapping to
// scroll to top
window.addEventListener("statusTap", () => {
  if (browserOpen) return;

  const page = findCurrentPage();

  if (!page) return;

  // TODO this logic is semi-duplicated in scrollUpIfNeeded.ts
  // and should probably be abstracted
  const scroll =
    page.querySelector(".virtual-scroller") ??
    page.shadowRoot?.querySelector(".inner-scroll");

  if (!scroll) return;

  if (scroll.scrollTop) {
    savedScrollTop = scroll.scrollTop;

    scroll.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    scroll.scrollTo({ top: savedScrollTop, behavior: "smooth" });
  }
});

export function resetSavedStatusTap() {
  savedScrollTop = 0;
}
