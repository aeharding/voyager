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
import { Keyboard, KeyboardStyle } from "@capacitor/keyboard";

interface GlobalStylesProps {
  children: React.ReactNode;
}

export default function GlobalStyles({ children }: GlobalStylesProps) {
  const systemDarkMode = useSystemDarkMode();
  const { fontSizeMultiplier, useSystemFontSize } = useAppSelector(
    (state) => state.settings.appearance.font,
  );

  const baseFontStyles = useSystemFontSize
    ? css`
        font: -apple-system-body;
      `
    : css`
        font-size: ${fontSizeMultiplier}rem;
      `;

  const { userDarkMode, usingSystemDarkMode, pureBlack } = useAppSelector(
    (state) => state.settings.appearance.dark,
  );
  const theme = useAppSelector((state) => state.settings.appearance.theme);

  const isDark = usingSystemDarkMode ? systemDarkMode : userDarkMode;

  useEffect(() => {
    if (!isNative()) return;

    StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  }, [isDark]);

  useEffect(() => {
    if (!isNative()) return;

    const keyboardStyle = (() => {
      if (usingSystemDarkMode) return KeyboardStyle.Default;

      if (isDark) return KeyboardStyle.Dark;
      return KeyboardStyle.Light;
    })();

    Keyboard.setStyle({ style: keyboardStyle });
  }, [isDark, usingSystemDarkMode]);

  return (
    <ThemeProvider theme={{ dark: isDark }}>
      <Global
        styles={css`
          html {
            ${baseFontStyles}
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
