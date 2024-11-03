import { addHours, addMinutes, subMinutes, subYears } from "date-fns";

import { calculateIsCakeDay } from "./date";

describe("cake cake", () => {
  it("not cake day when created", () => {
    expect(calculateIsCakeDay(new Date())).toBe(false);
  });

  it("not cake day soon after created", () => {
    expect(calculateIsCakeDay(addHours(new Date(), 12))).toBe(false);
  });

  it("cake day soon one year after created", () => {
    expect(calculateIsCakeDay(subYears(new Date(), 1))).toBe(true);
  });

  it("cake day in a couple minutes", () => {
    expect(calculateIsCakeDay(addMinutes(subYears(new Date(), 1), 2))).toBe(
      false,
    );
  });

  it("cake day started a couple minutes ago", () => {
    expect(calculateIsCakeDay(subMinutes(subYears(new Date(), 1), 2))).toBe(
      true,
    );
  });
});
