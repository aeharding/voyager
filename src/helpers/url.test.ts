import { describe, expect, it } from "vitest";

import { parseUriList } from "./url";

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
