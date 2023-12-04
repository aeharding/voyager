import styled from "@emotion/styled";
import { css } from "@emotion/react";
import PostMedia, {
  PostGalleryImgProps,
  getPostMedia,
} from "../../../gallery/PostMedia";
import { CSSProperties, useMemo } from "react";
import { IonIcon } from "@ionic/react";
import { imageOutline, warningOutline } from "ionicons/icons";
import useMediaLoadObserver from "./useMediaLoadObserver";
import { IMAGE_FAILED, imageFailed } from "./imageSlice";
import { useAppDispatch } from "../../../../store";

interface ImgProps {
  blur: boolean;
}

const Img = styled(PostMedia)<ImgProps>`
  width: 100%;
  max-width: none;
  max-height: max(100vh, 1000px);
  object-fit: contain;
  -webkit-touch-callout: default;

  ${({ blur }) =>
    blur &&
    css`
      filter: blur(40px);

      // https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
      transform: translate3d(0, 0, 0);
    `}
`;

const PlaceholderContainer = styled.div<{ loaded: boolean }>`
  ${({ loaded }) =>
    !loaded &&
    css`
      display: flex;
      align-items: center;
      justify-content: center;

      aspect-ratio: 1.2;
      position: relative;

      ${Img} {
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

export default function Media(props: PostGalleryImgProps & ImgProps) {
  const dispatch = useAppDispatch();
  const src = useMemo(() => getPostMedia(props.post), [props.post]);
  const [mediaRef, aspectRatio, onLoad] = useMediaLoadObserver(src);

  function renderIcon() {
    if (aspectRatio === IMAGE_FAILED)
      return <LoadingIonIcon icon={warningOutline} />;

    if (!aspectRatio) return <LoadingIonIcon icon={imageOutline} />;
  }

  const style: CSSProperties | undefined = useMemo(() => {
    if (!aspectRatio) return;

    if (aspectRatio === IMAGE_FAILED) return { display: "none" };

    return { aspectRatio };
  }, [aspectRatio]);

  return (
    <PlaceholderContainer loaded={!!aspectRatio && aspectRatio > 0}>
      <Img
        {...props}
        ref={mediaRef}
        style={style}
        onLoad={(e) => onLoad(e.target as Element)}
        onError={() => {
          if (src) dispatch(imageFailed(src));
        }}
      />

      {renderIcon()}
    </PlaceholderContainer>
  );
}
