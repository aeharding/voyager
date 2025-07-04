import { useIonLoading } from "@ionic/react";
import { useEffect, useRef } from "react";

// Loading indicator timing constants
const LOADING_CONFIG = {
  SHOW_DELAY: 200, // ms - delay before showing loading to avoid flashing
  MIN_DISPLAY_TIME: 600, // ms - minimum time to show loading indicator
} as const;

/**
 * Custom hook to manage loading indicator with debounced show/hide
 *
 * Features:
 * - Delays showing loading indicator to avoid flashing for quick operations
 * - Ensures minimum display time to prevent jarring UI changes
 * - Handles cleanup of timeouts automatically
 * - Provides abort callback for user cancellation
 */
export function useLoadingIndicator() {
  const [presentLoading, dismissLoading] = useIonLoading();
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      loadingStartTimeRef.current = null;
    };
  }, []);

  function showLoading(onWillDismiss?: () => void) {
    // Clear any existing timeouts
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    // Show loading after delay to avoid flashing
    showTimeoutRef.current = setTimeout(() => {
      showTimeoutRef.current = null;
      loadingStartTimeRef.current = Date.now();

      presentLoading({
        backdropDismiss: true,
        onWillDismiss,
      });
    }, LOADING_CONFIG.SHOW_DELAY);
  }

  function hideLoading() {
    // Clear show timeout if it hasn't fired yet
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
      return;
    }

    // Clear any existing hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // If loading was shown, ensure it stays visible for minimum time
    if (loadingStartTimeRef.current) {
      const elapsed = Date.now() - loadingStartTimeRef.current;
      const remainingTime = Math.max(
        0,
        LOADING_CONFIG.MIN_DISPLAY_TIME - elapsed,
      );

      if (remainingTime > 0) {
        hideTimeoutRef.current = setTimeout(() => {
          hideTimeoutRef.current = null;
          loadingStartTimeRef.current = null;
          dismissLoading();
        }, remainingTime);
      } else {
        loadingStartTimeRef.current = null;
        dismissLoading();
      }
    }
  }

  return { showLoading, hideLoading };
}
