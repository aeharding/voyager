import { Global, css } from "@emotion/react";
import { useAppSelector } from "./store";

export default function GlobalStyles() {
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

  return (
    <Global
      styles={css`
        html {
          ${baseFontStyles}

          ion-content ion-item {
            font-size: 1rem;
          }
        }
      `}
    />
  );
}
