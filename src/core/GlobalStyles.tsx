import { Keyboard, KeyboardStyle } from "@capacitor/keyboard";
import { StatusBar, Style } from "@capacitor/status-bar";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
} from "react";

import { initialState as initialSettingsState } from "#/features/settings/settingsSlice";
import { isNative } from "#/helpers/device";
import useSystemDarkMode, {
  DARK_MEDIA_SELECTOR,
} from "#/helpers/useSystemDarkMode";
import { AppThemeType } from "#/services/db";
import { useAppSelector } from "#/store";

import { getThemeByStyle } from "./theme/AppThemes";

import styles from "./GlobalStyles.module.css";

export const DARK_CLASSNAME = "ion-palette-dark";
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
  initialSettingsState.appearance.dark.usingSystemDarkMode
    ? window.matchMedia(DARK_MEDIA_SELECTOR).matches
    : initialSettingsState.appearance.dark.userDarkMode,
  initialSettingsState.appearance.dark.pureBlack,
  initialSettingsState.appearance.theme,
);

export default function GlobalStyles({ children }: React.PropsWithChildren) {
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
      document.documentElement.classList.remove(styles.fixedDeviceFont!);
      document.documentElement.style.fontSize = "";
    } else {
      document.documentElement.classList.add(styles.fixedDeviceFont!);
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

  return <DarkContext value={isDark}>{children}</DarkContext>;
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
