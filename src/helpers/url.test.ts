import { describe, expect, it } from "vitest";

import { isExternalUrl, parseUriList } from "./url";

describe("isExternalUrl", () => {
  const base = "https://vger.app/posts/all";

  it("false for relative urls", () => {
    expect(isExternalUrl("/settings", base)).toBe(false);
  });

  it("false for same-origin absolute urls", () => {
    expect(isExternalUrl("https://vger.app/u/aeharding", base)).toBe(false);
  });

  it("true for cross-origin http(s) urls", () => {
    expect(isExternalUrl("https://lemmy.world/post/123", base)).toBe(true);
    expect(isExternalUrl("http://example.com", base)).toBe(true);
  });

  it("true for mailto", () => {
    expect(isExternalUrl("mailto:hello@vger.app", base)).toBe(true);
  });

  it("false for other protocols", () => {
    expect(isExternalUrl("vger://community/lemmy.world/c/memes", base)).toBe(
      false,
    );
    expect(isExternalUrl("javascript:void(0)", base)).toBe(false);
  });

  it("false for unparseable urls", () => {
    expect(isExternalUrl("https://", base)).toBe(false);
  });

  it("works from a custom scheme app origin (tauri)", () => {
    const tauriBase = "tauri://localhost/posts/all";

    expect(isExternalUrl("https://lemmy.world/post/123", tauriBase)).toBe(true);
    expect(isExternalUrl("/settings", tauriBase)).toBe(false);
  });
});

describe("parseUriList", () => {
  it("parses a single URL", () => {
    expect(parseUriList("https://example.com")).toEqual([
      "https://example.com",
    ]);
  });

  it("parses multiple URLs separated by newlines", () => {
    expect(parseUriList("https://a.com\nhttps://b.com\nhttps://c.com")).toEqual(
      ["https://a.com", "https://b.com", "https://c.com"],
    );
  });

  it("ignores comment lines", () => {
    expect(
      parseUriList(
        "# This is a comment\nhttps://a.com\n#Another comment\nhttps://b.com",
      ),
    ).toEqual(["https://a.com", "https://b.com"]);
  });

  it("ignores empty lines and trims whitespace", () => {
    expect(
      parseUriList("\n  https://a.com  \n\n# comment\n   \nhttps://b.com\n"),
    ).toEqual(["https://a.com", "https://b.com"]);
  });

  it("returns an empty array for only comments and empty lines", () => {
    expect(parseUriList("# comment\n\n   \n# another")).toEqual([]);
  });
});
