import { PostView } from "lemmy-js-client";
import { findLoneImage } from "../../../helpers/markdown";
import { findUrlMediaType, isUrlVideo } from "../../../helpers/url";
import { PlayerProps } from "../video/Player";
import { ComponentProps, ComponentRef, forwardRef, memo, useMemo } from "react";
import GalleryMedia, { GalleryMediaProps } from "./GalleryMedia";
import Video from "../video/Video";

export interface PostGalleryImgProps
  extends Omit<GalleryMediaProps & PlayerProps, "src"> {
  src: string;
}

const Media = forwardRef<
  ComponentRef<typeof Video> | ComponentRef<typeof GalleryMedia>,
  PostGalleryImgProps
>(function PostMedia({ nativeControls, src, ...props }, ref) {
  const isVideo = useMemo(() => src && isUrlVideo(src), [src]);

  if (isVideo)
    return (
      <Video
        {...props}
        nativeControls={nativeControls}
        ref={ref as ComponentProps<typeof Video>["ref"]}
        src={src}
      />
    );

  return (
    <GalleryMedia
      {...props}
      ref={ref as ComponentProps<typeof GalleryMedia>["ref"]}
      src={src}
    />
  );
});

export default memo(Media);

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
