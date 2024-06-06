/**
 * Most storage happens asynchronously with Dexie (indexeddb).
 *
 * However, some things we need syncronously (localStorage)
 * to more easily avoid FOUC (e.g. dark vs light mode)
 *
 * So, those critical settings are stored here.
 */

export const LOCALSTORAGE_KEYS = {
  FONT: {
    FONT_SIZE_MULTIPLIER: "appearance--font-size-multiplier",
    USE_SYSTEM: "appearance--font-use-system",
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
