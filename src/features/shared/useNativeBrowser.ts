import { Browser } from "@capacitor/browser";
import { useCallback } from "react";
import { useAppSelector } from "../../store";
import { useTheme } from "@emotion/react";
import { isAndroid } from "../../helpers/device";

export default function useNativeBrowser() {
  const { dark } = useTheme();
  const { usingSystemDarkMode, pureBlack } = useAppSelector(
    (state) => state.settings.appearance.dark,
  );

  return useCallback(
    (href: string) => {
      const toolbarColor = (() => {
        if (usingSystemDarkMode) return undefined;

        if (isAndroid()) {
          if (dark) {
            if (pureBlack) return "#000000";

            return "#0f1419";
          }

          return "#ffffff";
        } else {
          // iOS clamps so #000 is not true black
          if (dark) return "#000000";

          return "#ffffff";
        }
      })();

      Browser.open({
        url: href,
        toolbarColor,
      });
    },
    [dark, usingSystemDarkMode, pureBlack],
  );
}
