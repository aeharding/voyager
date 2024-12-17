import { describe, expect, it } from "vitest";

import { formatRelative } from "./Ago";

describe("formatRelative Function", () => {
  const currentTime = {
    date: new Date(),
    expected: {
      ultrashort: "<1s",
      short: "<1s",
      verbose: "now",
    },
  };

  const oneMonthAgo = {
    date: (() => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      return date;
    })(),
    expected: {
      ultrashort: "1mo",
      short: "1mo",
      verbose: "1 month",
    },
  };

  const oneYearTwoMonthsAgo = {
    date: (() => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 1);
      date.setMonth(date.getMonth() - 2);
      return date;
    })(),
    expected: {
      ultrashort: "1.2y",
      short: "1y 2mo",
      verbose: "1 year, 2 months",
    },
  };

  const fortyFiveMinutesAgo = {
    date: (() => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - 45);
      return date;
    })(),
    expected: {
      ultrashort: "45m",
      short: "45m",
      verbose: "45 minutes",
    },
  };

  const fortyFiveMinutesFiftyNineSecondsAgo = {
    date: (() => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - 45);
      date.setSeconds(date.getSeconds() - 59);
      return date;
    })(),
    expected: {
      ultrashort: "45m",
      short: "45m",
      verbose: "45 minutes, 59 seconds",
    },
  };

  const oneYearAgo = {
    date: (() => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 1);
      return date;
    })(),
    expected: {
      ultrashort: "1y",
      short: "1y",
      verbose: "1 year",
    },
  };

  const tenDaysAgo = {
    date: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 10);
      return date;
    })(),
    expected: {
      ultrashort: "10d",
      short: "10d",
      verbose: "10 days",
    },
  };

  const testCases = [
    { name: "current time", ...currentTime },
    { name: "one month ago", ...oneMonthAgo },
    { name: "one year and two months ago", ...oneYearTwoMonthsAgo },
    { name: "forty-five minutes ago", ...fortyFiveMinutesAgo },
    {
      name: "forty-five minutes and fifty-nine seconds ago",
      ...fortyFiveMinutesFiftyNineSecondsAgo,
    },
    { name: "one year ago", ...oneYearAgo },
    { name: "ten days ago", ...tenDaysAgo },
  ];

  testCases.forEach(({ name, date, expected }) => {
    it(`should format ${name} correctly in ultrashort format`, () => {
      const result = formatRelative(date, "ultrashort");
      expect(result).toBe(expected.ultrashort);
    });

    it(`should format ${name} correctly in short format`, () => {
      const result = formatRelative(date, "short");
      expect(result).toBe(expected.short);
    });

    it(`should format ${name} correctly in verbose format`, () => {
      const result = formatRelative(date, "verbose");
      expect(result).toBe(expected.verbose);
    });
  });
});
