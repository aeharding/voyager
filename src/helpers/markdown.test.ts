import { describe, expect, it } from "vitest";

import { findLoneImage, quote } from "./markdown";

describe("findLoneImage", () => {
  it("should return null for non-image markdown", () => {
    expect(findLoneImage("just some text")).toBeNull();
    expect(findLoneImage("# heading")).toBeNull();
  });

  it("should return null if image is not at start of string", () => {
    expect(findLoneImage("text ![alt](url)")).toBeNull();
  });

  it("should return null if there is content after the image", () => {
    expect(findLoneImage("![alt](url) more text")).toBeNull();
  });

  it("should return null for emoji images", () => {
    expect(findLoneImage('![test](url "emoji test")')).toBeNull();
  });

  it("should return image for non space separated emoji word", () => {
    expect(findLoneImage('![test](url "emoji-test")')).toEqual({
      url: "url",
      altText: "test",
      title: "emoji-test",
    });
  });

  it("should return image data for a lone image", () => {
    expect(findLoneImage("![alt text](https://example.com/image.jpg)")).toEqual(
      {
        url: "https://example.com/image.jpg",
        altText: "alt text",
      },
    );
  });

  it("should handle images with titles that are not emoji", () => {
    expect(
      findLoneImage(
        '![alt text](https://example.com/image.jpg "normal title")',
      ),
    ).toEqual({
      url: "https://example.com/image.jpg",
      altText: "alt text",
      title: "normal title",
    });
  });

  it("should handle images without alt text", () => {
    expect(findLoneImage("![](https://example.com/image.jpg)")).toEqual({
      url: "https://example.com/image.jpg",
      altText: "",
    });
  });
});

describe("quote", () => {
  it("should quote a single line", () => {
    expect(quote("Hello world")).toBe("> Hello world");
  });

  it("should quote multiple lines", () => {
    const input = `First line
Second line
Third line`;

    const expected = `> First line
> Second line
> Third line`;

    expect(quote(input)).toBe(expected);
  });

  it("should handle empty lines", () => {
    const input = `First line

Third line`;

    const expected = `> First line
> 
> Third line`;

    expect(quote(input)).toBe(expected);
  });

  it("should handle empty string", () => {
    expect(quote("")).toBe("> ");
  });

  it("should preserve existing indentation", () => {
    const input = `  Indented line
    More indented`;

    const expected = `>   Indented line
>     More indented`;

    expect(quote(input)).toBe(expected);
  });
});
