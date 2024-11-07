import { isUrlVideo } from "../../../helpers/url";
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
>(function Media({ nativeControls, src, ...props }, ref) {
  const isVideo = useMemo(
    () => src && isUrlVideo(src, props.post?.post.url_content_type),
    [src, props.post],
  );

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
