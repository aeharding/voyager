import { PostView } from "lemmy-js-client";
import { useMemo } from "react";
import { useAppSelector } from "../../../store";
import { IMAGE_FAILED } from "./large/imageSlice";
import { findUrlMediaType } from "../../../helpers/url";
import { findLoneImage } from "../../../helpers/markdown";
import useSupported from "../../../helpers/useSupported";

export default function usePostSrc(post: PostView): string | undefined {
  const thumbnailIsFullsize = useSupported("Fullsize thumbnails");

  const src = useMemo(
    () => getPostMedia(post, thumbnailIsFullsize),
    [post, thumbnailIsFullsize],
  );
  const primaryFailed = useAppSelector(
    (state) => src && state.image.loadedBySrc[src[0]] === IMAGE_FAILED,
  );

  if (!src) return;

  if (primaryFailed && src[1]) return src[1];

  return src[0];
}

function getPostMedia(
  post: PostView,
  thumbnailIsFullsize: boolean,
): [string] | [string, string] | undefined {
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
