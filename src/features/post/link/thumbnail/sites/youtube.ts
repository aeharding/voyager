import { Thumbnail } from "../thumbnailinator";

export default function determineThumbnailForYoutube(
  url: string,
): Thumbnail | undefined {
  const videoId = getYoutubeVideoId(url);
  if (videoId) return getYoutubeThumbnailSrc(url);
}

// https://stackoverflow.com/a/61033353/1319878
const YOUTUBE_LINK =
  /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/;

export function getYoutubeVideoId(url: string): string | undefined {
  return url.match(YOUTUBE_LINK)?.[1];
}

export function getYoutubeThumbnailSrc(url: string): Thumbnail | undefined {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) return;

  return {
    sm: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    lg: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  };
}
