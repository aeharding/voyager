import PostMedia, {
  PostGalleryImgProps,
  getPostMedia,
} from "../../../../media/gallery/PostMedia";
import { CSSProperties, useMemo } from "react";
import { IonIcon } from "@ionic/react";
import { imageOutline } from "ionicons/icons";
import useMediaLoadObserver, {
  getTargetDimensions,
} from "../useMediaLoadObserver";
import { IMAGE_FAILED, imageFailed, imageLoaded } from "../imageSlice";
import { useAppDispatch } from "../../../../../store";
import BlurOverlay from "./BlurOverlay";
import useLatch from "../../../../../helpers/useLatch";
import { cx } from "@linaria/core";
import { styled } from "@linaria/react";

const StyledPostMedia = styled(PostMedia)`
  display: flex;
  width: 100%;
  max-width: none;
  max-height: max(100vh, 1000px);
  object-fit: contain;
  -webkit-touch-callout: default;

  min-height: 0;
`;

const PlaceholderContainer = styled.div`
  display: flex;

  &.not-loaded {
    align-items: center;
    justify-content: center;

    aspect-ratio: 1.2;
    position: relative;

    ${StyledPostMedia} {
      position: absolute;
      top: 0;
      left: 0;
    }
  }
`;

const LoadingIonIcon = styled(IonIcon)`
  opacity: 0.5;
  font-size: 24px;
`;

const Error = styled.div`
  opacity: 0.5;
`;

export default function Media({
  blur,
  className,
  style: baseStyle,
  ...props
}: PostGalleryImgProps & { blur: boolean }) {
  const dispatch = useAppDispatch();
  const src = useMemo(() => getPostMedia(props.post), [props.post]);
  const [mediaRef, currentAspectRatio] = useMediaLoadObserver(src);

  /**
   * Cross posts have different image thumbnail url when loaded, so prevent resizing by latching
   *
   * If the new image is different size (or errors), it will be properly updated then
   * (IMAGE_FAILED is truthy)
   */
  const aspectRatio = useLatch(currentAspectRatio);

  function renderIcon() {
    if (aspectRatio === IMAGE_FAILED)
      return <Error>failed to load media 😢</Error>;

    if (!aspectRatio) return <LoadingIonIcon icon={imageOutline} />;
  }

  const style: CSSProperties | undefined = useMemo(() => {
    if (!aspectRatio || aspectRatio === IMAGE_FAILED) return { opacity: 0 };

    return { aspectRatio };
  }, [aspectRatio]);

  const loaded = !!aspectRatio && aspectRatio > 0;

  const contents = (
    <PlaceholderContainer
      className={cx(className, !loaded && "not-loaded")}
      style={baseStyle}
    >
      <StyledPostMedia
        {...props}
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

      {renderIcon()}
    </PlaceholderContainer>
  );

  if (!blur) return contents; // optimization

  return <BlurOverlay blur={blur && loaded}>{contents}</BlurOverlay>;
}
