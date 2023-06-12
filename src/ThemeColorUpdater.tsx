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

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, []);

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor);
    }
  }, [themeColor]);

  return null;
};

export default ThemeColorUpdater;
