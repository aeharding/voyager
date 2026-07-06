import { describe, expect, it, vi } from "vitest";

import { isTauri } from "#/helpers/device";

import { buildImageSrc } from "./CachedImg";

vi.mock("#/helpers/device", () => ({
  isTauri: vi.fn(),
  supportsWebp: () => true,
}));

const PICTRS_URL = "https://lemmy.world/pictrs/image/abc.jpeg";
const PROXY_URL =
  "https://lemmy.zip/api/v3/image_proxy?url=https%3A%2F%2Flemmy.world%2Fpictrs%2Fimage%2Fabc.jpeg";

describe("buildImageSrc", () => {
  it("returns url unchanged without options on web", () => {
    vi.mocked(isTauri).mockReturnValue(false);

    expect(buildImageSrc(PICTRS_URL)).toBe(PICTRS_URL);
  });

  it("forces format for pictrs urls without options on tauri (avif undecodable)", () => {
    vi.mocked(isTauri).mockReturnValue(true);

    expect(buildImageSrc(PICTRS_URL)).toBe(`${PICTRS_URL}?format=webp`);
    expect(buildImageSrc(PROXY_URL)).toBe(`${PROXY_URL}&format=webp`);
  });

  it("leaves non-pictrs urls alone on tauri", () => {
    vi.mocked(isTauri).mockReturnValue(true);

    expect(buildImageSrc("https://i.imgur.com/abc.png")).toBe(
      "https://i.imgur.com/abc.png",
    );
  });

  it("applies explicit options regardless of platform", () => {
    vi.mocked(isTauri).mockReturnValue(false);

    expect(buildImageSrc(PICTRS_URL, { size: 100, devicePixelRatio: 2 })).toBe(
      `${PICTRS_URL}?thumbnail=200&format=webp`,
    );
  });
});
