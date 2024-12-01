import { isNative } from "#/helpers/device";

// Save capacitor shimmed fetch
const nativeFetch = window.fetch;

// Not great, but this is the recommended way to use the capacitor fetch shim
// without polluting the global scope
// https://github.com/ionic-team/capacitor/issues/7746#issuecomment-2506629023

if (isNative()) {
  // @ts-expect-error https://github.com/ionic-team/capacitor/blob/77e4668fa8dbb24b4561387e101547f74e37538e/core/native-bridge.ts#L456
  window.fetch = window.CapacitorWebFetch;

  // @ts-expect-error https://github.com/ionic-team/capacitor/blob/77e4668fa8dbb24b4561387e101547f74e37538e/core/native-bridge.ts#L460
  window.XMLHttpRequest = window.CapacitorWebXMLHttpRequest.fullObject;
}

// Expose the capacitor shim
export default nativeFetch;

// Undefined in web environments
export const getServerUrl: (() => string) | undefined =
  // @ts-expect-error https://github.com/ionic-team/capacitor/blob/77e4668fa8dbb24b4561387e101547f74e37538e/core/native-bridge.ts#L869
  window.Capacitor.getServerUrl;
