import { styled } from "@linaria/react";
import { AppThemeType } from "../../../../../services/db";
import { getThemeByStyle } from "../../../../../core/theme/AppThemes";
import { useIsDark } from "../../../../../core/GlobalStyles";

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

interface AppThemePreviewProps {
  appTheme: AppThemeType;
}

export default function AppThemePreview({ appTheme }: AppThemePreviewProps) {
  const isDark = useIsDark();
  const main = getThemeByStyle(appTheme, isDark ? "dark" : "light").primary;
  const second = getThemeByStyle(
    appTheme,
    isDark ? "dark" : "light",
  ).background;

  return <Container primaryColor={main} secondaryColor={second} />;
}
