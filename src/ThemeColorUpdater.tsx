import React, { useEffect, useState } from "react";

const ThemeColorUpdater = () => {
  const lightThemeColor = "#f7f7f7f7";
  const darkThemeColor = "#000000";

  const [themeColor, setThemeColor] = useState(lightThemeColor); // Default light theme color

  useEffect(() => {
    const handleThemeChange = (event: MediaQueryListEvent) => {
      const newThemeColor = event.matches ? darkThemeColor : lightThemeColor;
      setThemeColor(newThemeColor);
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleThemeChange);

    // Update theme color when component mounts
    setThemeColor(mediaQuery.matches ? darkThemeColor : lightThemeColor);

    // Create and inject the <meta name="theme-color"> tag if it doesn't exist
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Update theme color when the app becomes visible
        metaThemeColor?.setAttribute("content", themeColor);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [themeColor]);

  return null;
};

export default ThemeColorUpdater;
