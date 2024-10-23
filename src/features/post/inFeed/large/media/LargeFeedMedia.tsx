import Media, { MediaProps } from "../../../../media/gallery/Media";
import { CSSProperties, useMemo } from "react";
import useMediaLoadObserver, {
  getTargetDimensions,
} from "../useMediaLoadObserver";
import { IMAGE_FAILED, imageFailed, imageLoaded } from "../imageSlice";
import { useAppDispatch } from "../../../../../store";
import BlurOverlay from "./BlurOverlay";
import useLatch from "../../../../../helpers/useLatch";
import { styled } from "@linaria/react";
import MediaPlaceholder from "./MediaPlaceholder";

export const StyledPostMedia = styled(Media)`
  display: flex;
  width: 100%;
  max-width: none;
  max-height: max(100vh, 1000px);
  object-fit: contain;
  -webkit-touch-callout: default;

  min-height: 0;
`;

export default function LargeFeedMedia({
  src,
  blur,
  className,
  style: baseStyle,
  defaultAspectRatio,
  ...props
}: Omit<MediaProps, "ref"> & {
  blur?: boolean;
  defaultAspectRatio?: number;
}) {
  const dispatch = useAppDispatch();
  const [mediaRef, currentAspectRatio] = useMediaLoadObserver(src);

  /**
   * Cross posts have different image thumbnail url when loaded, so prevent resizing by latching
   *
   * If the new image is different size (or errors), it will be properly updated then
   * (IMAGE_FAILED is truthy)
   */
  const aspectRatio = useLatch(currentAspectRatio);

  const placeholderState = (() => {
    if (aspectRatio === IMAGE_FAILED) return "error";
    if (!aspectRatio) return "loading";

    return "loaded";
  })();

  const style: CSSProperties | undefined = useMemo(() => {
    if (!aspectRatio || aspectRatio === IMAGE_FAILED) return { opacity: 0 };

    return { aspectRatio };
  }, [aspectRatio]);

  const loaded = !!aspectRatio && aspectRatio > 0;

  const contents = (
    <MediaPlaceholder
      className={className}
      style={baseStyle}
      state={placeholderState}
      defaultAspectRatio={defaultAspectRatio}
    >
      <StyledPostMedia
        {...props}
        src={src}
        style={style}
        ref={mediaRef}
        autoPlay={!blur}
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
          if (loaded) return;

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

  if (!blur) return contents; // optimization

  return <BlurOverlay blur={blur && loaded}>{contents}</BlurOverlay>;
}
