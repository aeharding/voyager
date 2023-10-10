import { keywordFoundInSentence } from "./lemmy";

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
