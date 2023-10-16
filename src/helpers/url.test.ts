import {
  isValidUrl,
  transformUrl,
  isUrlImage,
  isUrlVideo,
  isUrlVideoEmbed,
  isUrlMedia,
} from "./url";

describe("URL Utility Functions", () => {
  describe("isValidUrl", () => {
    it("returns true for a valid URL", () => {
      expect(isValidUrl("https://www.example.com")).toBe(true);
    });

    it("returns false for an invalid URL", () => {
      expect(isValidUrl("not-a-url")).toBe(false);
    });
  });

  describe("transformUrl", () => {
    it("transform gifv to mp4", () => {
      const inputUrl = "https://example.com/video.gifv";
      const transformedUrl = transformUrl(inputUrl);
      expect(transformedUrl).toBe("https://example.com/video.mp4");
    });

    it("handle unknown URLs", () => {
      const inputUrl = "https://example.com/unknown-url";
      const transformedUrl = transformUrl(inputUrl);
      expect(transformedUrl).toBe(inputUrl);
    });

    it("transform streamable.com URLs", () => {
      const inputUrl = "https://streamable.com/sld50w";
      const transformedUrl = transformUrl(inputUrl);
      expect(transformedUrl).toBe(
        "https://streamable.com/e/sld50w?quality=highest",
      );
    });

    it("transform youtube.com/watch URLs", () => {
      const inputUrl =
        "https://www.youtube.com/watch?v=QuRgYoxEHRE&t=19s&pp=ygUObmhsIHByaWRlIHRhcGU=";
      const transformedUrl = transformUrl(inputUrl);
      expect(transformedUrl).toBe("https://www.youtube.com/embed/QuRgYoxEHRE/");
    });

    it("transform m.youtube.com/watch URLs", () => {
      const inputUrl =
        "https://m.youtube.com/watch?v=QuRgYoxEHRE&t=19s&pp=ygUObmhsIHByaWRlIHRhcGU=";
      const transformedUrl = transformUrl(inputUrl);
      expect(transformedUrl).toBe("https://www.youtube.com/embed/QuRgYoxEHRE/");
    });

    it("transform youtu.be URLs", () => {
      const inputUrl = "https://youtu.be/bOuy9-sV8UQ";
      const transformedUrl = transformUrl(inputUrl);
      expect(transformedUrl).toBe("https://www.youtube.com/embed/bOuy9-sV8UQ/");
    });
  });

  describe("isUrlImage", () => {
    it("returns true for image URLs", () => {
      expect(isUrlImage("https://example.com/image.jpg")).toBe(true);
    });

    it("returns false for non-image URLs", () => {
      expect(isUrlImage("https://example.com/video.mp4")).toBe(false);
    });
  });

  describe("isUrlVideo", () => {
    it("returns true for mp4", () => {
      expect(isUrlVideo("https://example.com/video.mp4")).toBe(true);
    });

    it("returns true for mov", () => {
      expect(isUrlVideo("https://example.com/video.mov")).toBe(true);
    });

    it("returns false for non-video URLs", () => {
      expect(isUrlVideo("https://example.com/image.jpg")).toBe(false);
    });
  });

  describe("isUrlVideoEmbed", () => {
    it("returns true for video embed URLs", () => {
      expect(isUrlVideoEmbed("https://example.com/embed/aoeu2134aeu")).toBe(
        true,
      );
    });

    it("returns false for non-video embed URLs", () => {
      expect(isUrlVideoEmbed("https://example.com/aoeu2134aeu")).toBe(false);
    });
  });

  describe("isUrlMedia", () => {
    it("returns true for media URLs", () => {
      expect(isUrlMedia("https://example.com/image.jpg")).toBe(true);
      expect(isUrlMedia("https://example.com/video.mp4")).toBe(true);
      expect(isUrlMedia("https://example.com/video.gifv")).toBe(true);
      expect(isUrlMedia("https://example.com/embed/aostm89aueu")).toBe(true);
    });

    it("returns false for non-video embed URLs", () => {
      expect(isUrlVideoEmbed("https://example.com/aoeu2134aeu")).toBe(false);
    });
  });
});
