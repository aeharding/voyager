import { describe, expect, it } from "vitest";

import {
  getProfileCommentSort,
  getProfileCommentSortParams,
  getProfilePostSort,
  getProfilePostSortParams,
} from "./useFeedSort";

describe("profile feed sort params", () => {
  it("uses the Lemmy v0 post vocabulary for profile posts", () => {
    expect(getProfilePostSortParams("lemmyv0", "ControversialAll")).toEqual({
      mode: "lemmyv0",
      sort: "Controversial",
    });
  });

  it("maps Lemmy v0's comment Top choice to the post-sort equivalent", () => {
    expect(getProfileCommentSortParams("lemmyv0", "Top")).toEqual({
      mode: "lemmyv0",
      sort: "TopAll",
    });
  });

  it("omits sort from Lemmy v1 profile requests", () => {
    expect(getProfilePostSortParams("lemmyv1", "TopWeek")).toEqual({
      mode: "lemmyv1",
    });
    expect(getProfileCommentSortParams("lemmyv1", "Hot")).toEqual({
      mode: "lemmyv1",
    });
  });

  it("uses PieFed's route-specific post and comment sorts", () => {
    expect(getProfilePostSortParams("piefed", "TopWeek")).toEqual({
      mode: "piefed",
      sort: "TopWeek",
    });
    expect(getProfileCommentSortParams("piefed", "Old")).toEqual({
      mode: "piefed",
      sort: "Old",
    });
  });

  it("resets a remembered sort that is invalid for the active provider", () => {
    expect(getProfilePostSort("piefed", "MostComments")).toBe("New");
    expect(getProfilePostSortParams("piefed", "MostComments")).toEqual({
      mode: "piefed",
      sort: "New",
    });
    expect(getProfileCommentSort("piefed", "Controversial")).toBe("New");
    expect(getProfileCommentSortParams("piefed", "Controversial")).toEqual({
      mode: "piefed",
      sort: "New",
    });
  });

  it("waits for the active mode and remembered sort to resolve", () => {
    expect(getProfilePostSort(undefined, "New")).toBeUndefined();
    expect(getProfilePostSortParams("piefed", undefined)).toBeUndefined();
    expect(getProfileCommentSortParams("lemmyv0", null)).toBeNull();
  });
});
