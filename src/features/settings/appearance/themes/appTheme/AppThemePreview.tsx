import styled from "@emotion/styled";
import { AppThemeType } from "../../../../../services/db";
import { getThemeByStyle } from "../../../../../theme/AppThemes";

const Container = styled.div<{ appTheme: AppThemeType }>`
  width: 22px;
  height: 22px;
  border-radius: 6px;

  margin-right: 16px;

  background: ${({ appTheme, theme }) =>
    getThemeByStyle(appTheme, theme.dark ? "dark" : "light").primary};
`;

interface AppThemePreviewProps {
  appTheme: AppThemeType;
}

export default function AppThemePreview({ appTheme }: AppThemePreviewProps) {
  return <Container appTheme={appTheme} />;
}
