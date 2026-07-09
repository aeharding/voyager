import { useEffect, useState } from "react";

const DEFAULT_WIDTH = 520;
const MIN_WIDTH = 300;
const MAX_WIDTH = 800;

export function useColumnWidth() {
  const [columnWidth, setColumnWidth] = useState(DEFAULT_WIDTH);

  // Initialize the CSS custom property when the component mounts
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--first-column-width",
      `${DEFAULT_WIDTH}px`,
    );
    console.log("Initialized CSS property to:", DEFAULT_WIDTH);
  }, []);

  const updateColumnWidth = (width: number) => {
    const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width));
    console.log("Setting column width to:", clampedWidth);
    setColumnWidth(clampedWidth);
    document.documentElement.style.setProperty(
      "--first-column-width",
      `${clampedWidth}px`,
    );
    console.log(
      "CSS property set, checking:",
      getComputedStyle(document.documentElement).getPropertyValue(
        "--first-column-width",
      ),
    );
  };

  return { columnWidth, updateColumnWidth };
}
