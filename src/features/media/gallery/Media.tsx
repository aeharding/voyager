import { ComponentProps, ComponentRef, useMemo } from "react";

import { PlayerProps } from "#/features/media/video/Player";
import Video from "#/features/media/video/Video";
import { isUrlVideo } from "#/helpers/url";

import GalleryMedia, { GalleryMediaProps } from "./GalleryMedia";

export interface MediaProps
  extends Omit<GalleryMediaProps & PlayerProps, "src" | "ref"> {
  src: string;

  ref?: React.RefObject<
    ComponentRef<typeof GalleryMedia> | ComponentRef<typeof Video>
  >;
}

export default function Media({ nativeControls, src, ...props }: MediaProps) {
  const isVideo = useMemo(
    () => src && isUrlVideo(src, props.post?.post.url_content_type),
    [src, props.post],
  );

  if (isVideo)
    return (
      <Video
        {...props}
        nativeControls={nativeControls}
        ref={props.ref as ComponentProps<typeof Video>["ref"]}
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
