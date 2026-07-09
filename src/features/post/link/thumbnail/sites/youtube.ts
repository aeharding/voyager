import { Thumbnail } from "../thumbnailinator";

export default function determineThumbnailForYoutube(
  url: string,
): Thumbnail | undefined {
  if (getYoutubeVideoId(url)) return getYoutubeThumbnailSrc(url);
}

const YOUTUBE_HOSTS_EXACT = new Set([
  "youtu.be",
  "yt.be",
  "youtube-nocookie.com",
  "youtubekids.com",
]);

// e.g. youtube.com, youtube.de, youtube.co.uk, youtube.com.br
const YOUTUBE_TLD_HOST = /^youtube\.(?:[a-z]{2,3}|(?:co|com)\.[a-z]{2})$/;

const STRIP_SUBDOMAIN = /^(?:www|m|music)\./;

const VIDEO_ID = /^[-a-zA-Z0-9_]{11}$/;

export function isYoutube(url: string): boolean {
  return !!getYoutubeVideoId(url);
}

export function getYoutubeVideoId(url: string): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
  } catch {
    return;
  }

  const host = parsed.hostname.toLowerCase().replace(STRIP_SUBDOMAIN, "");

  const isYoutubeHost =
    YOUTUBE_HOSTS_EXACT.has(host) || YOUTUBE_TLD_HOST.test(host);
  if (!isYoutubeHost) return;

  if (host === "youtu.be" || host === "yt.be") {
    const id = parsed.pathname.slice(1).split("/")[0];
    return id && VIDEO_ID.test(id) ? id : undefined;
  }

  const v = parsed.searchParams.get("v");
  if (v && VIDEO_ID.test(v)) return v;

  const pathMatch = parsed.pathname.match(
    /^\/(?:embed|v|shorts|live)\/([^/?#]+)/,
  );
  const pathId = pathMatch?.[1];
  if (pathId && VIDEO_ID.test(pathId)) return pathId;
}

export function getYoutubeThumbnailSrc(url: string): Thumbnail | undefined {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) return;

  return {
    sm: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    lg: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  };
}
