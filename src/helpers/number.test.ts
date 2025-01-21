import { describe, expect, it } from "vitest";

import { formatNumber } from "./number";

describe("formatNumber", () => {
  it("returns the number formatted with commas for numbers below the threshold", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1234, 2000)).toBe("1,234");
    expect(formatNumber(999, 1000)).toBe("999");
  });

  it("returns formatted number with 'K' for numbers between threshold and 1,000,000", () => {
    expect(formatNumber(1500)).toBe("1.5K");
    expect(formatNumber(999_949)).toBe("999.9K");
    expect(formatNumber(999_950)).toBe("1.0M");
    expect(formatNumber(450_000)).toBe("450.0K");
    expect(formatNumber(123_456)).toBe("123.5K");
    expect(formatNumber(1_000, 1_000)).toBe("1.0K");
  });

  it("returns formatted number with 'M' for numbers greater than or equal to 1,000,000", () => {
    expect(formatNumber(1_000_000)).toBe("1.0M");
    expect(formatNumber(2_345_678)).toBe("2.3M");
    expect(formatNumber(9_876_543)).toBe("9.9M");
    expect(formatNumber(1_234_567)).toBe("1.2M");
    expect(formatNumber(10_000_000)).toBe("10.0M");
  });

  it("handles edge cases correctly", () => {
    // Numbers just below thresholds
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(999_999)).toBe("1.0M");

    // Numbers at exact thresholds
    expect(formatNumber(1_000)).toBe("1.0K");
    expect(formatNumber(1_000_000)).toBe("1.0M");

    // Large numbers
    expect(formatNumber(1_000_000_000)).toBe("1000.0M");

    // Small numbers (including 0)
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(-999)).toBe("-999");
    expect(formatNumber(-1234)).toBe("-1,234");

    // Custom threshold
    expect(formatNumber(1234, 1500)).toBe("1,234");
    expect(formatNumber(1500, 1500)).toBe("1.5K");
  });
});
