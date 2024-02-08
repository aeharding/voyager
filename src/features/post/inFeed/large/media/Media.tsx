import styled from "@emotion/styled";
import { css } from "@emotion/react";
import PostMedia, {
  PostGalleryImgProps,
  getPostMedia,
} from "../../../../media/gallery/PostMedia";
import { CSSProperties, useMemo } from "react";
import { IonIcon } from "@ionic/react";
import { imageOutline } from "ionicons/icons";
import useMediaLoadObserver from "../useMediaLoadObserver";
import { IMAGE_FAILED, imageFailed } from "../imageSlice";
import { useAppDispatch } from "../../../../../store";
import BlurOverlay from "./BlurOverlay";

const StyledPostMedia = styled(PostMedia)`
  display: flex;
  width: 100%;
  max-width: none;
  max-height: max(100vh, 1000px);
  object-fit: contain;
  -webkit-touch-callout: default;

  min-height: 0;
`;

const PlaceholderContainer = styled.div<{ loaded: boolean }>`
  display: flex;

  ${({ loaded }) =>
    !loaded &&
    css`
      align-items: center;
      justify-content: center;

      aspect-ratio: 1.2;
      position: relative;

      ${StyledPostMedia} {
        position: absolute;
        top: 0;
        left: 0;
      }
    `}
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
  ...props
}: PostGalleryImgProps & { blur: boolean }) {
  const dispatch = useAppDispatch();
  const src = useMemo(() => getPostMedia(props.post), [props.post]);
  const [mediaRef, aspectRatio] = useMediaLoadObserver(src);

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
    <PlaceholderContainer loaded={loaded} className={className}>
      <StyledPostMedia
        {...props}
        style={style}
        ref={mediaRef}
        autoPlay={!blur}
        onError={() => {
          if (src) dispatch(imageFailed(src));
        }}
      />

      {renderIcon()}
    </PlaceholderContainer>
  );

  if (!blur) return contents; // optimization

  return <BlurOverlay blur={blur && loaded}>{contents}</BlurOverlay>;
}
