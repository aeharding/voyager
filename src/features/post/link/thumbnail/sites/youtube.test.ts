import { describe, expect, it } from "vitest";

import {
  getYoutubeThumbnailSrc,
  getYoutubeVideoId,
  isYoutube,
} from "./youtube";

const ID = "dQw4w9WgXcQ";

describe("getYoutubeVideoId", () => {
  it("extracts id from youtube.com/watch?v=", () => {
    expect(getYoutubeVideoId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID);
  });

  it("extracts id from youtu.be short links (with query params)", () => {
    expect(getYoutubeVideoId(`https://youtu.be/${ID}?t=42`)).toBe(ID);
  });

  it("strips m. and music. subdomains", () => {
    expect(getYoutubeVideoId(`https://m.youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(getYoutubeVideoId(`https://music.youtube.com/watch?v=${ID}`)).toBe(
      ID,
    );
  });

  it("extracts id from /embed/, /v/, /shorts/, /live/ paths", () => {
    for (const path of ["embed", "v", "shorts", "live"]) {
      expect(getYoutubeVideoId(`https://www.youtube.com/${path}/${ID}`)).toBe(
        ID,
      );
    }
  });

  it("extracts id from alternate hosts (nocookie, kids, yt.be)", () => {
    expect(
      getYoutubeVideoId(`https://www.youtube-nocookie.com/embed/${ID}`),
    ).toBe(ID);
    expect(getYoutubeVideoId(`https://www.youtubekids.com/watch?v=${ID}`)).toBe(
      ID,
    );
    expect(getYoutubeVideoId(`https://yt.be/${ID}`)).toBe(ID);
  });

  it("extracts id from country TLDs", () => {
    expect(getYoutubeVideoId(`https://www.youtube.de/watch?v=${ID}`)).toBe(ID);
    expect(getYoutubeVideoId(`https://www.youtube.co.uk/watch?v=${ID}`)).toBe(
      ID,
    );
  });

  it("handles URLs without a protocol", () => {
    expect(getYoutubeVideoId(`youtube.com/watch?v=${ID}`)).toBe(ID);
  });

  it("is case-insensitive on the host but preserves id case", () => {
    expect(getYoutubeVideoId(`https://YouTube.com/watch?v=AbCdEfGhIjK`)).toBe(
      "AbCdEfGhIjK",
    );
  });

  it("rejects non-youtube and youtube-lookalike hosts", () => {
    expect(getYoutubeVideoId(`https://vimeo.com/${ID}`)).toBeUndefined();
    expect(
      getYoutubeVideoId(`https://notyoutube.com/watch?v=${ID}`),
    ).toBeUndefined();
    expect(
      getYoutubeVideoId(`https://youtube.evil.com/watch?v=${ID}`),
    ).toBeUndefined();
  });

  it("rejects invalid ids (wrong length or illegal chars)", () => {
    expect(getYoutubeVideoId(`https://youtu.be/tooShort`)).toBeUndefined();
    expect(
      getYoutubeVideoId(`https://www.youtube.com/watch?v=!!!!!!!!!!!`),
    ).toBeUndefined();
  });

  it("returns undefined for youtube urls with no extractable id", () => {
    expect(
      getYoutubeVideoId(`https://www.youtube.com/feed/trending`),
    ).toBeUndefined();
  });

  it("returns undefined for garbage input", () => {
    expect(getYoutubeVideoId("not a url at all !!!")).toBeUndefined();
    expect(getYoutubeVideoId("")).toBeUndefined();
  });
});

describe("isYoutube", () => {
  it("is true for recognizable youtube urls, false otherwise", () => {
    expect(isYoutube(`https://youtu.be/${ID}`)).toBe(true);
    expect(isYoutube(`https://www.youtube.com/shorts/${ID}`)).toBe(true);
    expect(isYoutube("https://example.com")).toBe(false);
    expect(isYoutube("https://www.youtube.com/feed/trending")).toBe(false);
  });
});

describe("getYoutubeThumbnailSrc", () => {
  it("returns both sm and lg thumbnail urls for a valid video", () => {
    expect(getYoutubeThumbnailSrc(`https://youtu.be/${ID}`)).toEqual({
      sm: `https://img.youtube.com/vi/${ID}/mqdefault.jpg`,
      lg: `https://img.youtube.com/vi/${ID}/maxresdefault.jpg`,
    });
  });

  it("returns undefined when the url has no extractable id", () => {
    expect(getYoutubeThumbnailSrc("https://example.com")).toBeUndefined();
  });
});
