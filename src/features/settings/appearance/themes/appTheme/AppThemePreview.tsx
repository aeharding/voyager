import { styled } from "@linaria/react";
import { HTMLAttributes } from "react";

import { useIsDark } from "#/core/GlobalStyles";
import { getThemeByStyle } from "#/core/theme/AppThemes";
import { AppThemeType } from "#/services/db";

const Container = styled.div<{
  primaryColor: string;
  secondaryColor: string | undefined;
}>`
  --size: 22px;

  width: var(--size);
  height: var(--size);
  border-radius: 6px;

  margin-right: 16px;

  background: ${({ primaryColor }) => primaryColor};

  position: relative;
  overflow: hidden;

  pointer-events: none; // ionic bug? radio won't trigger

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
      ${({ secondaryColor }) => secondaryColor || "transparent"};
  }
`;

interface AppThemePreviewProps extends HTMLAttributes<HTMLDivElement> {
  appTheme: AppThemeType;
}

export default function AppThemePreview({
  appTheme,
  ...rest
}: AppThemePreviewProps) {
  const isDark = useIsDark();
  const main = getThemeByStyle(appTheme, isDark ? "dark" : "light").primary;
  const second = getThemeByStyle(
    appTheme,
    isDark ? "dark" : "light",
  ).background;

  return <Container {...rest} primaryColor={main} secondaryColor={second} />;
}
