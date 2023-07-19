import { Global, ThemeProvider, css } from "@emotion/react";
import { useAppSelector } from "./store";
import useSystemDarkMode from "./helpers/useSystemDarkMode";
import { baseVariables, themes } from "./theme/variables";
import React from "react";

interface GlobalStylesProps {
  children: React.ReactNode;
}

export default function GlobalStyles({ children }: GlobalStylesProps) {
  const systemDarkMode = useSystemDarkMode();
  const { fontSizeMultiplier, useSystemFontSize } = useAppSelector(
    (state) => state.settings.appearance.font
  );

  const baseFontStyles = useSystemFontSize
    ? css`
        font: -apple-system-body;
      `
    : css`
        font-size: ${fontSizeMultiplier}rem;
      `;

  const { theme } = useAppSelector((state) => state.settings.appearance);

  const selectedTheme =
    theme === "system"
      ? themes[systemDarkMode ? "black" : "light"]
      : themes[theme];

  return (
    <ThemeProvider theme={{}}>
      <Global
        styles={css`
          html {
            ${baseFontStyles}

            ion-content ion-item {
              font-size: 1rem;
            }
          }

          ${baseVariables}

          ${selectedTheme}
        `}
      />
      {children}
    </ThemeProvider>
  );
}
