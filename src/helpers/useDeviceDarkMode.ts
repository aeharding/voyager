import { useEffect, useState } from "react";

export default function useDeviceDarkMode() {
  const [prefersDarkMode, setPrefersDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    function handleDarkModePrefferedChange() {
      const doesMatch = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setPrefersDarkMode(doesMatch);
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handleDarkModePrefferedChange);

    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleDarkModePrefferedChange);
    };
  }, []);

  return prefersDarkMode;
}
