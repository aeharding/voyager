import { Global, css } from "@emotion/react";
import { useAppSelector } from "./store";
import useDeviceDarkMode from "./helpers/useDeviceDarkMode";
import {
  baseVariables,
  darkVariables,
  lightVariables,
} from "./theme/variables";

export default function GlobalStyles() {
  const systemDarkMode = useDeviceDarkMode();
  const { fontSizeMultiplier, useSystemFontSize } = useAppSelector(
    (state) => state.appearance.font
  );

  const baseFontStyles = useSystemFontSize
    ? css`
        font: -apple-system-body;
      `
    : css`
        font-size: ${fontSizeMultiplier}rem;
      `;

  const { userDarkMode, usingDeviceDarkMode } = useAppSelector(
    (state) => state.appearance.dark
  );

  const isDark = usingDeviceDarkMode ? systemDarkMode : userDarkMode;

  return (
    <Global
      styles={css`
        html {
          ${baseFontStyles}

          ion-content ion-item {
            font-size: 1rem;
          }
        }

        ${baseVariables}

        ${isDark ? darkVariables : lightVariables}
      `}
    />
  );
}
