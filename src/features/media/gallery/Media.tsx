import { isUrlVideo } from "../../../helpers/url";
import { PlayerProps } from "../video/Player";
import { ComponentProps, ComponentRef, useMemo } from "react";
import GalleryMedia, { GalleryMediaProps } from "./GalleryMedia";
import Video from "../video/Video";

export interface MediaProps
  extends Omit<GalleryMediaProps & PlayerProps, "src" | "ref"> {
  src: string;

  ref?: React.RefObject<
    ComponentRef<typeof GalleryMedia> | ComponentRef<typeof Video>
  >;
}

export default function Media({ nativeControls, src, ...props }: MediaProps) {
  const isVideo = useMemo(() => src && isUrlVideo(src), [src]);

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
