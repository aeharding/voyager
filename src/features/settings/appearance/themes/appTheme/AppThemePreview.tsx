import { HTMLAttributes, use } from "react";

import { DarkContext } from "#/core/GlobalStyles";
import { getThemeByStyle } from "#/core/theme/AppThemes";
import { sv } from "#/helpers/css";
import { AppThemeType } from "#/services/db/types";

import styles from "./AppThemePreview.module.css";

interface AppThemePreviewProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "style" | "className"> {
  appTheme: AppThemeType;
}

export default function AppThemePreview({
  appTheme,
  ...rest
}: AppThemePreviewProps) {
  const isDark = use(DarkContext);
  const main = getThemeByStyle(appTheme, isDark ? "dark" : "light").primary;
  const second = getThemeByStyle(
    appTheme,
    isDark ? "dark" : "light",
  ).background;

  return (
    <div
      {...rest}
      className={styles.container}
      style={sv({ primaryColor: main, secondaryColor: second })}
    />
  );
}
