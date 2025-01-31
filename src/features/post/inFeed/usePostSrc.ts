import { PostView } from "lemmy-js-client";

import { IMAGE_FAILED } from "#/features/media/imageSlice";
import { findLoneImage } from "#/helpers/markdown";
import { findUrlMediaType, forceSecureUrl } from "#/helpers/url";
import useSupported from "#/helpers/useSupported";
import { useAppSelector } from "#/store";

export default function usePostSrc(
  post: PostView | undefined,
): string | undefined {
  const thumbnailIsFullsize = useSupported("Fullsize thumbnails");

  const src = getPostMedia(post, thumbnailIsFullsize);
  const primaryFailed = useAppSelector(
    (state) => src && state.image.loadedBySrc[src[0]] === IMAGE_FAILED,
  );

  if (!src) return;

  if (primaryFailed && src[1]) return src[1];

  return src[0];
}

function getPostMedia(
  post: PostView | undefined,
  thumbnailIsFullsize: boolean,
): [string] | [string, string] | undefined {
  return getMixedContentPostMedia(post, thumbnailIsFullsize)?.map(
    forceSecureUrl,
  ) as [string] | [string, string] | undefined;
}

function getMixedContentPostMedia(
  post: PostView | undefined,
  thumbnailIsFullsize: boolean,
): [string] | [string, string] | undefined {
  if (!post) return;

  if (post.post.url) {
    const isUrlMedia = findUrlMediaType(
      post.post.url,
      post.post.url_content_type,
    );

    if (isUrlMedia) {
      if (post.post.thumbnail_url) {
        if (thumbnailIsFullsize)
          return [post.post.thumbnail_url, post.post.url];
      }

      // no fallback now for newer lemmy versions
      // in the future might unwrap lemmy proxy_image param here
      return [post.post.url];
    }
  }

  if (post.post.thumbnail_url) return [post.post.thumbnail_url];

  const loneImage = post.post.body && findLoneImage(post.post.body);
  if (loneImage) return [loneImage.url];
}
