import { useAppSelector } from "./store";
import React, { createContext, useContext, useEffect } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNative } from "./helpers/device";
import { Keyboard, KeyboardStyle } from "@capacitor/keyboard";
import useSystemDarkMode from "./helpers/useSystemDarkMode";
import { css } from "@linaria/core";
import { getThemeByStyle } from "./theme/AppThemes";

import "./theme/variables";

export const DARK_CLASSNAME = "theme-dark";
export const PURE_BLACK_CLASSNAME = "theme-pure-black";
export const THEME_HAS_CUSTOM_BACKGROUND = "theme-has-custom-background";

const globalDeviceFontCss = css`
  font: -apple-system-body;
`;

interface GlobalStylesProps {
  children: React.ReactNode;
}

export default function GlobalStyles({ children }: GlobalStylesProps) {
  const isDark = useComputeIsDark();
  const { fontSizeMultiplier, useSystemFontSize } = useAppSelector(
    (state) => state.settings.appearance.font,
  );

  const { usingSystemDarkMode, pureBlack } = useAppSelector(
    (state) => state.settings.appearance.dark,
  );
  const theme = useAppSelector((state) => state.settings.appearance.theme);

  useEffect(() => {
    if (isNative()) {
      StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    }

    const list = document.documentElement.classList;

    if (isDark && pureBlack) {
      list.add(PURE_BLACK_CLASSNAME);
    } else {
      list.remove(PURE_BLACK_CLASSNAME);
    }

    if (isDark) {
      list.add(DARK_CLASSNAME);
    } else {
      list.remove(DARK_CLASSNAME);
    }
  }, [isDark, pureBlack]);

  useEffect(() => {
    if (useSystemFontSize) {
      document.documentElement.classList.add(globalDeviceFontCss);
      document.documentElement.style.fontSize = "";
    } else {
      document.documentElement.classList.remove(globalDeviceFontCss);
      document.documentElement.style.fontSize = `${fontSizeMultiplier}rem`;
    }
  }, [useSystemFontSize, fontSizeMultiplier]);

  useEffect(() => {
    const { primary, background, insetItemBackground, tabBarBackground } =
      getThemeByStyle(theme, isDark ? "dark" : "light");

    document.documentElement.style.setProperty("--app-primary", primary);
    document.documentElement.style.setProperty(
      "--app-background",
      background ?? "",
    );
    document.documentElement.style.setProperty(
      "--app-inset-item-background",
      insetItemBackground ?? "",
    );
    document.documentElement.style.setProperty(
      "--app-tab-bar-background",
      tabBarBackground ?? "",
    );

    if (background) {
      document.documentElement.classList.add(THEME_HAS_CUSTOM_BACKGROUND);
    } else {
      document.documentElement.classList.remove(THEME_HAS_CUSTOM_BACKGROUND);
    }
  }, [theme, isDark]);

  useEffect(() => {
    if (!isNative()) return;

    const keyboardStyle = (() => {
      if (usingSystemDarkMode) return KeyboardStyle.Default;

      if (isDark) return KeyboardStyle.Dark;
      return KeyboardStyle.Light;
    })();

    Keyboard.setStyle({ style: keyboardStyle });
  }, [isDark, usingSystemDarkMode]);

  return <DarkContext.Provider value={isDark}>{children}</DarkContext.Provider>;
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
