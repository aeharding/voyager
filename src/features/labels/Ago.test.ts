import { subDays, subMinutes, subMonths, subSeconds, subYears } from "date-fns";
import { describe, expect, it } from "vitest";

import { formatRelativeToNow } from "./Ago";

describe("formatRelativeToNow Function", () => {
  const currentTime = {
    date: new Date(),
    expected: {
      ultrashort: "<1s",
      short: "<1s",
      verbose: "now",
    },
  };

  const oneMonthAgo = {
    date: subMonths(new Date(), 1),
    expected: {
      ultrashort: "1mo",
      short: "1mo",
      verbose: "1 month",
    },
  };

  const oneYearTwoMonthsAgo = {
    date: subMonths(subYears(new Date(), 1), 2),
    expected: {
      ultrashort: "1.2y",
      short: "1y 2mo",
      verbose: "1 year, 2 months",
    },
  };

  const fortyFiveMinutesAgo = {
    date: subMinutes(new Date(), 45),
    expected: {
      ultrashort: "45m",
      short: "45m",
      verbose: "45 minutes",
    },
  };

  const fortyFiveMinutesFiftyNineSecondsAgo = {
    date: subSeconds(subMinutes(new Date(), 45), 59),
    expected: {
      ultrashort: "45m",
      short: "45m",
      verbose: "45 minutes, 59 seconds",
    },
  };

  const oneYearAgo = {
    date: subYears(new Date(), 1),
    expected: {
      ultrashort: "1y",
      short: "1y",
      verbose: "1 year",
    },
  };

  const tenDaysAgo = {
    date: subDays(new Date(), 10),
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
      const result = formatRelativeToNow(date, "ultrashort");
      expect(result).toBe(expected.ultrashort);
    });

    it(`should format ${name} correctly in short format`, () => {
      const result = formatRelativeToNow(date, "short");
      expect(result).toBe(expected.short);
    });

    it(`should format ${name} correctly in verbose format`, () => {
      const result = formatRelativeToNow(date, "verbose");
      expect(result).toBe(expected.verbose);
    });
  });
});
