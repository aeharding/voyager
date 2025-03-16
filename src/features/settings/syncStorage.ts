/**
 * Most storage happens asynchronously with Dexie (indexeddb).
 *
 * However, some things we need syncronously (localStorage)
 * to more easily avoid FOUC (e.g. dark vs light mode)
 *
 * So, those critical settings are stored here.
 */

import { DeepPartial } from "#/helpers/typescript";

import type { SettingsState } from "./settingsSlice";

export const LOCALSTORAGE_KEYS = {
  FONT: {
    FONT_SIZE_MULTIPLIER: "appearance--font-size-multiplier",
    USE_SYSTEM: "appearance--font-use-system",
    ACCOMMODATE_LARGE_TEXT: "appearance--accommodate-large-text",
  },
  DARK: {
    USE_SYSTEM: "appearance--dark-use-system",
    USER_MODE: "appearance--dark-user-mode",
    PURE_BLACK: "appearance--pure-black",
  },
  DEVICE_MODE: "appearance--device-mode",
  THEME: "appearance--theme",
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function get(key: string): any {
  const data = localStorage.getItem(key);
  if (!data) return;
  return JSON.parse(data);
}

export function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalStorageInitialState(): DeepPartial<SettingsState> {
  return {
    appearance: {
      dark: {
        pureBlack: get(LOCALSTORAGE_KEYS.DARK.PURE_BLACK),
        userDarkMode: get(LOCALSTORAGE_KEYS.DARK.USER_MODE),
        usingSystemDarkMode: get(LOCALSTORAGE_KEYS.DARK.USE_SYSTEM),
      },
      deviceMode: get(LOCALSTORAGE_KEYS.DEVICE_MODE),
      font: {
        fontSizeMultiplier: get(LOCALSTORAGE_KEYS.FONT.FONT_SIZE_MULTIPLIER),
        useSystemFontSize: get(LOCALSTORAGE_KEYS.FONT.USE_SYSTEM),
        accommodateLargeText: get(
          LOCALSTORAGE_KEYS.FONT.ACCOMMODATE_LARGE_TEXT,
        ),
      },
      theme: get(LOCALSTORAGE_KEYS.THEME),
    },
  } as const;
}
