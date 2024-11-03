import { Post } from "lemmy-js-client";
import { describe, expect, it } from "vitest";

import {
  buildCrosspostBody,
  keywordFoundInSentence,
  postHasFilteredWebsite,
} from "./lemmy";

describe("keywordFoundInSentence", () => {
  it("false when empty", () => {
    expect(keywordFoundInSentence("", "")).toBe(false);
  });

  it("false with keyword in empty string", () => {
    expect(keywordFoundInSentence("keyword", "")).toBe(false);
  });

  it("false with keyword in sentence", () => {
    expect(keywordFoundInSentence("keyword", "Hello, this is Voyager!")).toBe(
      false,
    );
  });

  it("true with keyword in middle", () => {
    expect(keywordFoundInSentence("this", "Hello, this is Voyager!")).toBe(
      true,
    );
  });

  it("false with partial keyword in middle", () => {
    expect(keywordFoundInSentence("thi", "Hello, this is Voyager!")).toBe(
      false,
    );
  });

  it("true with multi word keyword", () => {
    expect(keywordFoundInSentence("this is", "Hello, this is Voyager!")).toBe(
      true,
    );
  });

  it("true with keyword without comma", () => {
    expect(keywordFoundInSentence("Hello", "Hello, this is Voyager!")).toBe(
      true,
    );
  });

  it("true with multi keyword with comma", () => {
    expect(
      keywordFoundInSentence("Hello, this", "Hello, this is Voyager!"),
    ).toBe(true);
  });

  it("true at beginning", () => {
    expect(keywordFoundInSentence("Hello", "Hello, this is Voyager!")).toBe(
      true,
    );
  });

  it("true case insensitive", () => {
    expect(keywordFoundInSentence("voyageR", "Hello, this is Voyager!")).toBe(
      true,
    );
  });
});

describe("postHasFilteredWebsite", () => {
  it("false when empty", () => {
    expect(
      postHasFilteredWebsite({ url: "https://google.com" } as Post, []),
    ).toBe(false);
  });

  it("false when no url", () => {
    expect(postHasFilteredWebsite({} as Post, [])).toBe(false);
  });

  it("true when match", () => {
    expect(
      postHasFilteredWebsite({ url: "https://google.com" } as Post, [
        "google.com",
      ]),
    ).toBe(true);
  });

  it("true when match with path", () => {
    expect(
      postHasFilteredWebsite(
        { url: "https://google.com/foo/bar?baz#test" } as Post,
        ["google.com"],
      ),
    ).toBe(true);
  });

  it("true when match with multiple websites", () => {
    expect(
      postHasFilteredWebsite(
        { url: "https://google.com/foo/bar?baz#test" } as Post,
        ["test.com", "google.com"],
      ),
    ).toBe(true);
  });

  it("true with subdomain", () => {
    expect(
      postHasFilteredWebsite({ url: "https://www.google.com" } as Post, [
        "google.com",
      ]),
    ).toBe(true);
  });

  it("false when starts with", () => {
    expect(
      postHasFilteredWebsite({ url: "https://ggoogle.com" } as Post, [
        "google.com",
      ]),
    ).toBe(false);
  });

  it("true with multiple subdomains", () => {
    expect(
      postHasFilteredWebsite({ url: "https://www1.www2.google.com" } as Post, [
        "google.com",
      ]),
    ).toBe(true);
  });

  it("false on domain when filtering subdomain", () => {
    expect(
      postHasFilteredWebsite({ url: "https://google.com" } as Post, [
        "www.google.com",
      ]),
    ).toBe(false);
  });

  it("true on exact subdomain", () => {
    expect(
      postHasFilteredWebsite({ url: "https://hi.google.com" } as Post, [
        "hi.google.com",
      ]),
    ).toBe(true);
  });
});

describe("buildCrosspostBody", () => {
  it("url only", () => {
    expect(
      buildCrosspostBody(
        { name: "Hi there", ap_id: "https://a.com/post/123" } as Post,
        false,
      ),
    ).toBe("cross-posted from: https://a.com/post/123");
  });

  it("with title", () => {
    expect(
      buildCrosspostBody(
        { name: "Hi there", ap_id: "https://a.com/post/123" } as Post,
        true,
      ),
    ).toBe(
      `
cross-posted from: https://a.com/post/123

> Hi there`.trim(),
    );
  });

  it("with title and body", () => {
    expect(
      buildCrosspostBody(
        {
          name: "Hi there",
          ap_id: "https://a.com/post/123",
          body: "Test",
        } as Post,
        true,
      ),
    ).toBe(
      `
cross-posted from: https://a.com/post/123

> Hi there
>
> Test`.trim(),
    );
  });

  it("with body only", () => {
    expect(
      buildCrosspostBody(
        {
          name: "Hi there",
          ap_id: "https://a.com/post/123",
          body: "Test",
        } as Post,
        false,
      ),
    ).toBe(
      `
cross-posted from: https://a.com/post/123

> Test`.trim(),
    );
  });

  it("trims body", () => {
    expect(
      buildCrosspostBody(
        {
          name: "Hi there",
          ap_id: "https://a.com/post/123",
          body: "Test\n",
        } as Post,
        false,
      ),
    ).toBe(
      `
cross-posted from: https://a.com/post/123

> Test`.trim(),
    );
  });
});
