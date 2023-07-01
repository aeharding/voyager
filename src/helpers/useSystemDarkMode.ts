import { useEffect, useState } from "react";

const DARK_MEDIA_SELECTOR = "(prefers-color-scheme: dark)";

export default function useSystemDarkMode() {
  const [prefersDarkMode, setPrefersDarkMode] = useState(
    window.matchMedia(DARK_MEDIA_SELECTOR).matches
  );

  useEffect(() => {
    function handleDarkModeChange() {
      const doesMatch = window.matchMedia(DARK_MEDIA_SELECTOR).matches;
      setPrefersDarkMode(doesMatch);
    }

    window
      .matchMedia(DARK_MEDIA_SELECTOR)
      .addEventListener("change", handleDarkModeChange);

    return () => {
      window
        .matchMedia(DARK_MEDIA_SELECTOR)
        .removeEventListener("change", handleDarkModeChange);
    };
  }, []);

  return prefersDarkMode;
}
