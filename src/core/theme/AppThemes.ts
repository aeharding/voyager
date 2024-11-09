import { AppThemeType } from "#/services/db";

interface Theme {
  light: Colors;
  dark: Colors;
}

interface Colors {
  primary: string;
  background?: string;
  insetItemBackground?: string;
  tabBarBackground?: string;
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
    case "dracula":
      return {
        light: {
          primary: "#AD81FF",
        },
        dark: {
          primary: "#AD81FF",
          background: "#1A1D29",
          insetItemBackground: "#12141C",
          tabBarBackground: "#12141C",
        },
      };
    case "tangerine":
      return {
        light: {
          primary: "#FF4500",
        },
        dark: {
          primary: "#FF4500",
        },
      };
    case "sunset":
      return {
        light: {
          primary: "#FE6C09",
          background: "#FFE2D0",
          insetItemBackground: "#F1D8C7",
          tabBarBackground: "#F1D8C7",
        },
        dark: {
          primary: "#FE7C00",
          background: "#000E29",
          insetItemBackground: "#11213C",
          tabBarBackground: "#000A1F",
        },
      };
    case "outrun":
      return {
        light: {
          primary: "#C400A5",
          background: "#BAC1D1",
          insetItemBackground: "#CFD7E8",
          tabBarBackground: "#C1C8D9",
        },
        dark: {
          primary: "#F335C5",
          background: "#081D47",
          insetItemBackground: "#061636",
          tabBarBackground: "#041129",
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
