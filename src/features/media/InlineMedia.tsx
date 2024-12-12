import { CSSProperties } from "react";

import Media, { MediaProps } from "#/features/media/Media";
import { cx } from "#/helpers/css";
import { useAppDispatch } from "#/store";

import { IMAGE_FAILED, imageFailed, imageLoaded } from "./imageSlice";
import MediaPlaceholder from "./MediaPlaceholder";
import { isLoadedAspectRatio } from "./useAspectRatio";
import useMediaLoadObserver, {
  getTargetDimensions,
} from "./useMediaLoadObserver";

import mediaPlaceholderStyles from "./MediaPlaceholder.module.css";

export type InlineMediaProps = Omit<MediaProps, "ref"> & {
  defaultAspectRatio?: number;
  mediaClassName?: string;
};

export default function InlineMedia({
  src,
  className,
  style: baseStyle,
  defaultAspectRatio,
  mediaClassName,
  ...props
}: InlineMediaProps) {
  const dispatch = useAppDispatch();
  const [mediaRef, aspectRatio] = useMediaLoadObserver(src);

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
        className={cx(mediaPlaceholderStyles.media, mediaClassName)}
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
