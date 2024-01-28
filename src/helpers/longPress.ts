import { LongPressOptions } from "use-long-press";
import { isAppleDeviceInstallable } from "./device";

/**
 * `-webkit-touch-callout: default;` has native long press priority (iOS only)
 */
export const filterSafariCallout: LongPressOptions["filterEvents"] = (e) => {
  const el = e.target;

  // only iOS has long press
  if (!isAppleDeviceInstallable()) return true;

  if (!(el instanceof HTMLElement)) return true;

  let candidate: Element | null | undefined = el;

  while ((candidate = candidate?.closest("a, img"))) {
    if (!(candidate instanceof HTMLElement)) return true;

    if (
      getComputedStyle(candidate).getPropertyValue("-webkit-touch-callout") ===
      "default"
    )
      return false;

    // el.closest is inclusive (includes current el as candidate)
    candidate = candidate.parentElement;
  }

  return true;
};
