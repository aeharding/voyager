import { LaunchNative } from "capacitor-launch-native";
import { Reader } from "capacitor-reader";

import { useIsDark } from "#/core/GlobalStyles";
import {
  notifyStatusTapThatBrowserWasClosed,
  notifyStatusTapThatBrowserWasOpened,
} from "#/core/listeners/statusTap";
import { isAndroid } from "#/helpers/device";
import { useAppSelector } from "#/store";

export default function useNativeBrowser() {
  const isDark = useIsDark();
  const { usingSystemDarkMode, pureBlack } = useAppSelector(
    (state) => state.settings.appearance.dark,
  );
  const alwaysUseReaderMode = useAppSelector(
    (state) => state.settings.general.safari.alwaysUseReaderMode,
  );
  const preferNativeApps = useAppSelector(
    (state) => state.settings.general.preferNativeApps,
  );

  return async function openNativeBrowser(href: string) {
    const toolbarColor = (() => {
      if (usingSystemDarkMode) return undefined;

      if (isAndroid()) {
        if (isDark) {
          if (pureBlack) return "#000000";

          return "#0f1419";
        }

        return "#ffffff";
      } else {
        // iOS clamps so #000 is not true black
        if (isDark) return "#000000";

        return "#ffffff";
      }
    })();

    if (preferNativeApps) {
      const { completed } = await LaunchNative.attempt({ url: href });
      if (completed) return;
    }

    notifyStatusTapThatBrowserWasOpened();

    try {
      await Reader.open({
        url: href,
        toolbarColor,
        entersReaderIfAvailable: alwaysUseReaderMode,
      });
    } catch (e) {
      notifyStatusTapThatBrowserWasClosed();
      throw e;
    }
  };
}
