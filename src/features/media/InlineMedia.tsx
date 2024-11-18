import { cx } from "@linaria/core";
import { CSSProperties } from "react";

import Media, { MediaProps } from "#/features/media/Media";
import useLatch from "#/helpers/useLatch";
import { useAppDispatch } from "#/store";

import MediaPlaceholder from "./MediaPlaceholder";
import { IMAGE_FAILED, imageFailed, imageLoaded } from "./imageSlice";
import { isLoadedAspectRatio } from "./useAspectRatio";
import useMediaLoadObserver, {
  getTargetDimensions,
} from "./useMediaLoadObserver";

export type InlineMediaProps = Omit<MediaProps, "ref"> & {
  defaultAspectRatio?: number;
  mediaClassName?: string;
};

export const MEDIA_EL_CLASSNAME = "media";

export default function InlineMedia({
  src,
  className,
  style: baseStyle,
  defaultAspectRatio,
  mediaClassName,
  ...props
}: InlineMediaProps) {
  const dispatch = useAppDispatch();
  const [mediaRef, currentAspectRatio] = useMediaLoadObserver(src);

  /**
   * Cross posts have different image thumbnail url when loaded, so prevent resizing by latching
   *
   * If the new image is different size (or errors), it will be properly updated then
   * (IMAGE_FAILED is truthy)
   */
  const aspectRatio = useLatch(currentAspectRatio);

  function buildPlaceholderState() {
    if (aspectRatio === IMAGE_FAILED) return "error";
    if (!aspectRatio) return "loading";

    return "loaded";
  }

  function buildStyle(): CSSProperties {
    if (!aspectRatio || aspectRatio === IMAGE_FAILED) return { opacity: 0 };

    return { aspectRatio };
  }

  return (
    <MediaPlaceholder
      className={className}
      style={baseStyle}
      state={buildPlaceholderState()}
      defaultAspectRatio={defaultAspectRatio}
    >
      <Media
        {...props}
        src={src}
        className={cx(MEDIA_EL_CLASSNAME, mediaClassName)}
        style={buildStyle()}
        ref={mediaRef}
        onError={() => {
          if (src) dispatch(imageFailed(src));
        }}
        // useMediaLoadObserver fires if image is partially loaded.
        // but sometimes a Safari quirk doesn't fire the resize handler.
        // this catches those edge cases.
        //
        // TLDR Image loading should still work with this function commented out!
        onLoad={(event) => {
          if (!src) return;
          if (isLoadedAspectRatio(aspectRatio)) return;

          const dimensions = getTargetDimensions(
            event.target as HTMLImageElement,
          );
          if (!dimensions) return;
          const { width, height } = dimensions;

          dispatch(imageLoaded({ src, aspectRatio: width / height }));
        }}
      />
    </MediaPlaceholder>
  );
}
