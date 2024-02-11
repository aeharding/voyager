import { useEffect, useState } from "react";

export const DARK_MEDIA_SELECTOR = "(prefers-color-scheme: dark)";

export default function useSystemDarkMode() {
  const [prefersDarkMode, setPrefersDarkMode] = useState(
    window.matchMedia(DARK_MEDIA_SELECTOR).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_MEDIA_SELECTOR);

    function handleDarkModeChange() {
      const doesMatch = mediaQuery.matches;
      setPrefersDarkMode(doesMatch);
    }

    // Fallback to addListener/removeListener for older browser support
    // See https://github.com/aeharding/voyager/pull/264
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener("change", handleDarkModeChange);
    } else {
      mediaQuery.addListener(handleDarkModeChange);
    }

    return () => {
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener("change", handleDarkModeChange);
      } else {
        mediaQuery.removeListener(handleDarkModeChange);
      }
    };
  }, []);

  return prefersDarkMode;
}
