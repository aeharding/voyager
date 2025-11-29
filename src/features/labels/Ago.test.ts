import { subDays, subMinutes, subMonths, subSeconds, subYears } from "date-fns";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

      // off by one, TZ=UTC @ 2025-03-29T00:17:41.637Z
      // https://github.com/date-fns/date-fns/issues/3506
      verbose: [
        "1 month",
        "1 month, 1 day",
        "1 month, 2 days",
        "1 month, 3 days",
      ],
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
      const expectedValues =
        typeof expected.verbose === "string"
          ? [expected.verbose]
          : expected.verbose;

      expect(result).toBeOneOf(expectedValues);
    });
  });

  describe("DST/future date edge cases", () => {
    afterEach(() => {
      vi.useRealTimers();
      vi.unstubAllEnvs();
    });

    beforeEach(() => {
      vi.stubEnv("TZ", "America/Chicago");
    });

    it.todo("does not product weird 0.09999999999999998y value", () => {
      // This test reproduces the EXACT bug the user saw by using real dates + DST transition
      // https://lemmy.ml/post/38394736
      // https://github.com/date-fns/date-fns/issues/3896
      // Maybe fixed by switching to temporal api eventually

      // Mock the current time
      const mockNow = new Date("2025-11-02T06:59:59.999Z");
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      // Create a date that's slightly in the future of DST transition
      const slightlyFuture = new Date("2025-11-02T07:00:00.000Z");

      // Test what formatRelativeToNow produces
      const result = formatRelativeToNow(slightlyFuture, "ultrashort");

      expect(result).toBe("<1s");
    });
  });
});
