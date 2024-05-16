import { PostView } from "lemmy-js-client";
import { findLoneImage } from "../../../helpers/markdown";
import { isUrlMedia, isUrlVideo } from "../../../helpers/url";
import { PlayerProps } from "../video/Player";
import { ComponentProps, ComponentRef, useMemo } from "react";
import GalleryMedia, { GalleryMediaProps } from "./GalleryMedia";
import Video from "../video/Video";

export interface PosMediaProps
  extends Omit<GalleryMediaProps & PlayerProps, "src" | "ref"> {
  src: string;

  ref?: React.RefObject<
    ComponentRef<typeof GalleryMedia> | ComponentRef<typeof Video>
  >;
}

export default function PostMedia({
  nativeControls,
  src,
  ...props
}: PosMediaProps) {
  const isVideo = useMemo(() => src && isUrlVideo(src), [src]);

  if (isVideo)
    return (
      <Video
        {...props}
        ref={props.ref as ComponentProps<typeof Video>["ref"]}
        nativeControls={nativeControls}
        src={src}
      />
    );

  return (
    <GalleryMedia
      {...props}
      ref={props.ref as ComponentProps<typeof GalleryMedia>["ref"]}
      src={src}
    />
  );
}

export function getPostMedia(
  post: PostView,
): [string] | [string, string] | undefined {
  if (post.post.url && isUrlMedia(post.post.url)) {
    if (post.post.thumbnail_url) {
      return [post.post.thumbnail_url, post.post.url];
    }

    return [post.post.url];
  }

  if (post.post.thumbnail_url) return [post.post.thumbnail_url];

  const loneImage = post.post.body && findLoneImage(post.post.body);
  if (loneImage) return [loneImage.url];
}
