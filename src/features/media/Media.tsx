import { ComponentProps, ComponentRef } from "react";

import Video, { VideoProps } from "#/features/media/video/Video";
import { isUrlVideo } from "#/helpers/url";

import GalleryMedia, { GalleryMediaProps } from "./gallery/GalleryMedia";

export interface MediaProps
  extends Omit<GalleryMediaProps & VideoProps, "src" | "ref"> {
  src: string;

  ref?: React.Ref<
    ComponentRef<typeof GalleryMedia> | ComponentRef<typeof Video>
  >;
}

export default function Media({
  nativeControls,
  src,
  shouldPortal,
  animationType,
  volume,
  progress,
  ...props
}: MediaProps) {
  const isVideo = src && isUrlVideo(src, props.post?.post.url_content_type);

  if (isVideo)
    return (
      <Video
        {...props}
        nativeControls={nativeControls}
        shouldPortal={shouldPortal}
        volume={volume}
        progress={progress}
        ref={props.ref as ComponentProps<typeof Video>["ref"]}
        src={src}
      />
    );

  return (
    <GalleryMedia
      {...props}
      animationType={animationType}
      ref={props.ref as ComponentProps<typeof GalleryMedia>["ref"]}
      src={src}
    />
  );
}
