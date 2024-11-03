import { addHours, addMinutes, subMinutes, subYears } from "date-fns";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { calculateIsCakeDay } from "./date";

describe("cake cake", () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  it("not cake day when created", () => {
    vi.setSystemTime(new Date("2024-11-01"));

    expect(calculateIsCakeDay(new Date())).toBe(false);
  });

  it("not cake day soon after created", () => {
    vi.setSystemTime(new Date("2024-11-01"));

    expect(calculateIsCakeDay(addHours(new Date(), 12))).toBe(false);
  });

  it("cake day soon one year after created", () => {
    vi.setSystemTime(new Date("2024-11-01"));

    expect(calculateIsCakeDay(subYears(new Date(), 1))).toBe(true);
  });

  it("cake day in a couple minutes", () => {
    vi.setSystemTime(new Date("2024-11-01"));

    expect(calculateIsCakeDay(addMinutes(subYears(new Date(), 1), 2))).toBe(
      false,
    );
  });

  it("cake day started a couple minutes ago", () => {
    vi.setSystemTime(new Date("2024-11-01"));

    expect(calculateIsCakeDay(subMinutes(subYears(new Date(), 1), 2))).toBe(
      true,
    );
  });
});
