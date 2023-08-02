import { Global, ThemeProvider, css } from "@emotion/react";
import { useAppSelector } from "./store";
import useSystemDarkMode from "./helpers/useSystemDarkMode";
import {
  baseVariables,
  buildDarkVariables,
  buildLightVariables,
} from "./theme/variables";
import React, { useEffect } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNative } from "./helpers/device";

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

  const { userDarkMode, usingSystemDarkMode, pureBlack } = useAppSelector(
    (state) => state.settings.appearance.dark
  );
  const theme = useAppSelector((state) => state.settings.appearance.theme);

  const isDark = usingSystemDarkMode ? systemDarkMode : userDarkMode;

  useEffect(() => {
    if (!isNative()) return;

    StatusBar.setBackgroundColor({ color: isDark ? "#000000" : "#f7f7f7" }); // android only
    StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  }, [isDark]);

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

          ${isDark
            ? buildDarkVariables(theme, pureBlack)
            : buildLightVariables(theme)}
        `}
      />
      {children}
    </ThemeProvider>
  );
}
