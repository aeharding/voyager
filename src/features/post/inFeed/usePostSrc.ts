import { PostView } from "lemmy-js-client";
import { useMemo } from "react";
import { useAppSelector } from "../../../store";
import { IMAGE_FAILED } from "./large/imageSlice";
import { findUrlMediaType } from "../../../helpers/url";
import { findLoneImage } from "../../../helpers/markdown";

export default function usePostSrc(post: PostView): string | undefined {
  const src = useMemo(() => getPostMedia(post), [post]);
  const primaryFailed = useAppSelector(
    (state) => src && state.image.loadedBySrc[src[0]] === IMAGE_FAILED,
  );

  if (!src) return;

  if (primaryFailed && src[1]) return src[1];

  return src[0];
}

export function getPostMedia(
  post: PostView,
): [string] | [string, string] | undefined {
  const urlType = post.post.url && findUrlMediaType(post.post.url);

  if (post.post.url && urlType) {
    const thumbnailType =
      post.post.thumbnail_url && findUrlMediaType(post.post.thumbnail_url);

    if (post.post.thumbnail_url) {
      // Sometimes Lemmy will cache the video, sometimes the thumbnail will be a still frame of the video
      if (urlType === "video" && thumbnailType === "image")
        return [post.post.url];

      return [post.post.thumbnail_url, post.post.url];
    }

    return [post.post.url];
  }

  if (post.post.thumbnail_url) return [post.post.thumbnail_url];

  const loneImage = post.post.body && findLoneImage(post.post.body);
  if (loneImage) return [loneImage.url];
}
