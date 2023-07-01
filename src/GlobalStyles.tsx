import { Global, ThemeProvider, css } from "@emotion/react";
import { useAppSelector } from "./store";
import useSystemDarkMode from "./helpers/useSystemDarkMode";
import {
  baseVariables,
  darkVariables,
  lightVariables,
} from "./theme/variables";
import React from "react";

interface GlobalStylesProps {
  children: React.ReactNode;
}

export default function GlobalStyles({ children }: GlobalStylesProps) {
  const systemDarkMode = useSystemDarkMode();
  const { fontSizeMultiplier, useSystemFontSize } = useAppSelector(
    (state) => state.appearance.font
  );

  const baseFontStyles = useSystemFontSize
    ? css`
        font: -apple-system-body;
      `
    : css`
        font-size: ${fontSizeMultiplier}rem;
      `;

  const { userDarkMode, usingSystemDarkMode } = useAppSelector(
    (state) => state.appearance.dark
  );

  const isDark = usingSystemDarkMode ? systemDarkMode : userDarkMode;

  return (
    <ThemeProvider theme={{ dark: isDark }}>
      <Global
        styles={css`
          html {
            ${baseFontStyles}

            ion-content ion-item {
              font-size: 1rem;
            }
          }

          ${baseVariables}

          ${isDark ? darkVariables : lightVariables}
        `}
      />
      {children}
    </ThemeProvider>
  );
}
