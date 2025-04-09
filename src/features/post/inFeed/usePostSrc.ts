import { PostView } from "lemmy-js-client";

import { IMAGE_FAILED } from "#/features/media/imageSlice";
import { findLoneImage } from "#/helpers/markdown";
import {
  findUrlMediaType,
  forceSecureUrl,
  getImageProxyUrl,
} from "#/helpers/url";
import { useAppSelector } from "#/store";

export default function usePostSrc(
  post: PostView | undefined,
): string | undefined {
  const src = getPostMedia(post);
  const primaryFailed = useAppSelector(
    (state) => src && state.image.loadedBySrc[src[0]] === IMAGE_FAILED,
  );

  if (!src) return;

  if (primaryFailed && src[1]) return src[1];

  return src[0];
}

function getPostMedia(
  post: PostView | undefined,
): [string] | [string, string] | undefined {
  return getMixedContentPostMedia(post)?.map(forceSecureUrl) as
    | [string]
    | [string, string]
    | undefined;
}

function getMixedContentPostMedia(
  post: PostView | undefined,
): [string] | [string, string] | undefined {
  if (!post) return;

  if (post.post.url) {
    const isUrlMedia = findUrlMediaType(
      post.post.url,
      post.post.url_content_type,
    );

    if (isUrlMedia) {
      const originalUrl = getImageProxyUrl(post.post.url);

      if (originalUrl) return [post.post.url, originalUrl];

      return [post.post.url];
    }
  }

  if (post.post.thumbnail_url) return [post.post.thumbnail_url];

  const loneImage = post.post.body && findLoneImage(post.post.body);
  if (loneImage) return [loneImage.url];
}
