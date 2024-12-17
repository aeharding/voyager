import { FormatDistanceFn, FormatDistanceLocale } from "date-fns";

type FormatDistanceTokenValue =
  | string
  | {
      one: string;
      other: string;
    };

const formatDistanceLocale: FormatDistanceLocale<FormatDistanceTokenValue> = {
  lessThanXSeconds: {
    one: "<1s",
    other: "<{{count}}s",
  },

  xSeconds: {
    one: "1s",
    other: "{{count}}s",
  },

  halfAMinute: "0.5m",

  lessThanXMinutes: {
    one: "<1m",
    other: "<{{count}}m",
  },

  xMinutes: {
    one: "1m",
    other: "{{count}}m",
  },

  aboutXHours: {
    one: "~1h",
    other: "~{{count}}h",
  },

  xHours: {
    one: "1h",
    other: "{{count}}h",
  },

  xDays: {
    one: "1d",
    other: "{{count}}d",
  },

  aboutXWeeks: {
    one: "~1w",
    other: "~{{count}}w",
  },

  xWeeks: {
    one: "1w",
    other: "{{count}}w",
  },

  aboutXMonths: {
    one: "~1mo",
    other: "~{{count}}mo",
  },

  xMonths: {
    one: "1mo",
    other: "{{count}}mo",
  },

  aboutXYears: {
    one: "~1y",
    other: "~{{count}}y",
  },

  xYears: {
    one: "1y",
    other: "{{count}}y",
  },

  overXYears: {
    one: ">1y",
    other: ">{{count}}y",
  },

  almostXYears: {
    one: "~1y",
    other: "~{{count}}y",
  },
};

export const formatDistanceShort: FormatDistanceFn = (token, count) => {
  let result;

  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }

  return result;
};
