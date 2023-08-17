import { AppThemeType } from "../services/db";

interface Theme {
  light: Colors;
  dark: Colors;
}

interface Colors {
  primary: string;
}

export function getTheme(appTheme: AppThemeType): Theme {
  switch (appTheme) {
    case "default":
      return {
        light: {
          primary: "#3880ff",
        },
        dark: {
          primary: "#428cff",
        },
      };
    case "mario":
      return {
        light: {
          primary: "color(display-p3 1 0 0)",
        },
        dark: {
          primary: "#db1f1f",
        },
      };
    case "pistachio":
      return {
        light: {
          primary: "color(display-p3 0 0.7 0)",
        },
        dark: {
          primary: "color(display-p3 0 0.6 0)",
        },
      };
    case "pumpkin":
      return {
        light: {
          primary: "color(display-p3 1 0.5 0)",
        },
        dark: {
          primary: "#DF6F0E",
        },
      };
    case "uv":
      return {
        light: {
          primary: "color(display-p3 0.5 0 1)",
        },
        dark: {
          primary: "#942AD4",
        },
      };
    case "mint":
      return {
        light: {
          primary: "#36BB97",
        },
        dark: {
          primary: "#53C391",
        },
      };
  }
}

export function getThemeByStyle(
  appTheme: AppThemeType,
  style: "light" | "dark",
): Colors {
  return getTheme(appTheme)[style];
}
