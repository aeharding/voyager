import styled from "@emotion/styled";
import { AppThemeType } from "../../../../../services/db";
import { getThemeByStyle } from "../../../../../theme/AppThemes";
import { css } from "@emotion/react";

const Container = styled.div<{ appTheme: AppThemeType }>`
  --size: 22px;

  width: var(--size);
  height: var(--size);
  border-radius: 6px;

  margin-right: 16px;

  background: ${({ appTheme, theme }) =>
    getThemeByStyle(appTheme, theme.dark ? "dark" : "light").primary};

  position: relative;
  overflow: hidden;

  ${({ appTheme, theme }) =>
    getThemeByStyle(appTheme, theme.dark ? "dark" : "light").background
      ? css`
          &:after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;

            width: 0;
            height: 0;
            border-left: var(--size) solid transparent;
            border-right: var(--size) solid transparent;

            border-bottom: var(--size) solid
              ${getThemeByStyle(appTheme, theme.dark ? "dark" : "light")
                .background};
          }
        `
      : ""};
`;

interface AppThemePreviewProps {
  appTheme: AppThemeType;
}

export default function AppThemePreview({ appTheme }: AppThemePreviewProps) {
  return <Container appTheme={appTheme} />;
}
