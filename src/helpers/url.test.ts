import {
  isValidUrl,
  transformUrl,
  isUrlImage,
  isUrlVideo,
  isUrlMedia,
} from "./url";

describe("URL Utility Functions", () => {
  describe("isValidUrl", () => {
    it("returns true for a valid URL", () => {
      expect(isValidUrl("https://www.example.com")).toBe(true);
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

  describe("isUrlMedia", () => {
    it("returns true for media URLs", () => {
      expect(isUrlMedia("https://example.com/image.jpg")).toBe(true);
      expect(isUrlMedia("https://example.com/video.mp4")).toBe(true);
      expect(isUrlMedia("https://example.com/video.gifv")).toBe(true);
    });
  });
});
