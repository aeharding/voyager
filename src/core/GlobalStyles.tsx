import { useAppSelector } from "../store";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
} from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNative } from "../helpers/device";
import { Keyboard, KeyboardStyle } from "@capacitor/keyboard";
import useSystemDarkMode, {
  DARK_MEDIA_SELECTOR,
} from "../helpers/useSystemDarkMode";
import { css } from "@linaria/core";
import { getThemeByStyle } from "./theme/AppThemes";

import "./theme/variables";
import { AppThemeType } from "../services/db";
import { stateWithLocalstorageItems as initialCriticalSettingsState } from "../features/settings/settingsSlice";

export const DARK_CLASSNAME = "theme-dark";
export const PURE_BLACK_CLASSNAME = "theme-pure-black";
export const THEME_HAS_CUSTOM_BACKGROUND = "theme-has-custom-background";

function updateDocumentTheme(
  isDark: boolean,
  isPureBlack: boolean,
  theme: AppThemeType,
) {
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

  const documentClasses = document.documentElement.classList;

  if (background) {
    documentClasses.add(THEME_HAS_CUSTOM_BACKGROUND);
  } else {
    documentClasses.remove(THEME_HAS_CUSTOM_BACKGROUND);
  }

  if (isDark && isPureBlack) {
    documentClasses.add(PURE_BLACK_CLASSNAME);
  } else {
    documentClasses.remove(PURE_BLACK_CLASSNAME);
  }

  if (isDark) {
    documentClasses.add(DARK_CLASSNAME);
  } else {
    documentClasses.remove(DARK_CLASSNAME);
  }
}

// Prevent flash of white content and repaint before react component setup
updateDocumentTheme(
  initialCriticalSettingsState.appearance.dark.usingSystemDarkMode
    ? window.matchMedia(DARK_MEDIA_SELECTOR).matches
    : initialCriticalSettingsState.appearance.dark.userDarkMode,
  initialCriticalSettingsState.appearance.dark.pureBlack,
  initialCriticalSettingsState.appearance.theme,
);

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

  useLayoutEffect(() => {
    if (isNative()) {
      StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    }
  }, [isDark]);

  useLayoutEffect(() => {
    if (useSystemFontSize) {
      document.documentElement.classList.add(globalDeviceFontCss);
      document.documentElement.style.fontSize = "";
    } else {
      document.documentElement.classList.remove(globalDeviceFontCss);
      document.documentElement.style.fontSize = `${fontSizeMultiplier}rem`;
    }
  }, [useSystemFontSize, fontSizeMultiplier]);

  useLayoutEffect(() => {
    updateDocumentTheme(isDark, pureBlack, theme);
  }, [theme, pureBlack, isDark]);

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
