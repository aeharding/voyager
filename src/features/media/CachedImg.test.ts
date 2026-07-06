import { describe, expect, it, vi } from "vitest";

import { buildImageSrc } from "./CachedImg";

vi.mock("#/helpers/device", () => ({
  supportsWebp: () => true,
}));

const PICTRS_URL = "https://lemmy.world/pictrs/image/abc.jpeg";

describe("buildImageSrc", () => {
  it("returns url unchanged without options", () => {
    expect(buildImageSrc(PICTRS_URL)).toBe(PICTRS_URL);
  });

  it("leaves non-pictrs urls alone", () => {
    expect(buildImageSrc("https://i.imgur.com/abc.png", { size: 100 })).toBe(
      "https://i.imgur.com/abc.png",
    );
  });

  it("applies options to pictrs urls", () => {
    expect(buildImageSrc(PICTRS_URL, { size: 100, devicePixelRatio: 2 })).toBe(
      `${PICTRS_URL}?thumbnail=200&format=webp`,
    );
  });
});
