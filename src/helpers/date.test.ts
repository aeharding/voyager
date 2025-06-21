import { addHours, addMinutes, subMinutes } from "date-fns";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cakeDate, isCakeDay } from "./date";

describe("cake day", () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  it("not when created", () => {
    vi.setSystemTime(cakeDate("2024-11-01"));

    expect(isCakeDay(new Date().toISOString())).toBe(false);
  });

  it("not soon after created", () => {
    vi.setSystemTime(cakeDate("2024-11-01"));

    expect(isCakeDay(addHours(cakeDate("2024-11-01"), 12).toISOString())).toBe(
      false,
    );
  });

  it("in a couple minutes", () => {
    vi.setSystemTime(subMinutes(cakeDate("2024-11-01"), 2));

    expect(isCakeDay(cakeDate("2023-11-01").toISOString())).toBe(false);
  });

  it("started a couple minutes ago", () => {
    vi.setSystemTime(cakeDate("2023-11-01"));

    expect(isCakeDay(addMinutes(cakeDate("2024-11-01"), 2).toISOString())).toBe(
      true,
    );
  });

  it("from lemmy-ui", () => {
    vi.setSystemTime(cakeDate("2025-04-15"));

    expect(isCakeDay(cakeDate("2024-04-15").toISOString())).toBe(true);
  });

  it("one minute before cake day ends", () => {
    vi.setSystemTime(subMinutes(cakeDate("2024-11-02"), 1));

    expect(isCakeDay(cakeDate("2023-11-01").toISOString())).toBe(true);
  });

  it("ended", () => {
    vi.setSystemTime(addMinutes(cakeDate("2024-11-02"), 1));

    expect(isCakeDay(cakeDate("2023-11-01").toISOString())).toBe(false);
  });
});
