import { Global, css } from "@emotion/react";
import { useAppSelector } from "./store";
import {
  baseVariables,
  buildDarkVariables,
  buildLightVariables,
} from "./theme/variables";
import React, { createContext, useContext, useEffect } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNative } from "./helpers/device";
import { Keyboard, KeyboardStyle } from "@capacitor/keyboard";
import useSystemDarkMode from "./helpers/useSystemDarkMode";

const DARK_CLASSNAME = "theme-dark";

interface GlobalStylesProps {
  children: React.ReactNode;
}

export default function GlobalStyles({ children }: GlobalStylesProps) {
  const isDark = useComputeIsDark();
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

  const { usingSystemDarkMode, pureBlack } = useAppSelector(
    (state) => state.settings.appearance.dark,
  );
  const theme = useAppSelector((state) => state.settings.appearance.theme);

  useEffect(() => {
    if (isNative()) {
      StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    }

    const list = document.documentElement.classList;

    if (isDark) {
      list.add(DARK_CLASSNAME);
    } else {
      list.remove(DARK_CLASSNAME);
    }
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
    <>
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
      <DarkContext.Provider value={isDark}>{children}</DarkContext.Provider>
    </>
  );
}

function useComputeIsDark(): boolean {
  const systemDarkMode = useSystemDarkMode(); // sets up document listeners

  const { userDarkMode, usingSystemDarkMode } = useAppSelector(
    (state) => state.settings.appearance.dark,
  );

  return usingSystemDarkMode ? systemDarkMode : userDarkMode;
}

// Cached
export function useIsDark() {
  return useContext(DarkContext);
}

const DarkContext = createContext(false);
