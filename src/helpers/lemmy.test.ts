import { Post } from "lemmy-js-client";
import { buildCrosspostBody, keywordFoundInSentence } from "./lemmy";

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
