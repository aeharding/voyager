import { addHours, addMinutes, subMinutes } from "date-fns";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cakeDate, calculateIsCakeDay } from "./date";

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
    vi.setSystemTime(cakeDate("2024-11-01"));

    expect(calculateIsCakeDay(new Date().toISOString())).toBe(false);
  });

  it("not cake day soon after created", () => {
    vi.setSystemTime(cakeDate("2024-11-01"));

    expect(
      calculateIsCakeDay(addHours(cakeDate("2024-11-01"), 12).toISOString()),
    ).toBe(false);
  });

  it("cake day in a couple minutes", () => {
    vi.setSystemTime(subMinutes(cakeDate("2024-11-01"), 2));

    expect(calculateIsCakeDay(cakeDate("2023-11-01").toISOString())).toBe(
      false,
    );
  });

  it("cake day started a couple minutes ago", () => {
    vi.setSystemTime(cakeDate("2023-11-01"));

    expect(
      calculateIsCakeDay(addMinutes(cakeDate("2024-11-01"), 2).toISOString()),
    ).toBe(true);
  });

  it("cake day from lemmy-ui", () => {
    vi.setSystemTime(cakeDate("2025-04-15"));

    expect(calculateIsCakeDay(cakeDate("2024-04-15").toISOString())).toBe(true);
  });

  it("one minute before cake day ends", () => {
    vi.setSystemTime(subMinutes(cakeDate("2024-11-02"), 1));

    expect(calculateIsCakeDay(cakeDate("2023-11-01").toISOString())).toBe(true);
  });

  it("cake day ended", () => {
    vi.setSystemTime(addMinutes(cakeDate("2024-11-02"), 1));

    expect(calculateIsCakeDay(cakeDate("2023-11-01").toISOString())).toBe(
      false,
    );
  });
});
