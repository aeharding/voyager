import styled from "@emotion/styled";
import { css } from "@emotion/react";
import PostMedia, { PostGalleryImgProps } from "../../../gallery/PostMedia";
import { useEffect, useRef, useState } from "react";
import { IonIcon } from "@ionic/react";
import { imageOutline, warningOutline } from "ionicons/icons";

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

      img {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
      }
    `}
`;

const LoadingIonIcon = styled(IonIcon)`
  opacity: 0.5;
  font-size: 24px;
`;

export default function Image(props: PostGalleryImgProps & ImgProps) {
  const [imgRef, loaded, setLoaded] = useImgLoadObserver();
  const [error, setError] = useState(false);

  function renderIcon() {
    if (error) return <LoadingIonIcon icon={warningOutline} />;
    if (!loaded) return <LoadingIonIcon icon={imageOutline} />;
  }

  return (
    <PlaceholderContainer loaded={loaded}>
      <Img
        {...props}
        ref={imgRef}
        style={{ display: error ? "none" : undefined }}
        onError={() => {
          setError(true);
        }}
        onLoad={() => {
          setLoaded(true);
        }}
      />

      {renderIcon()}
    </PlaceholderContainer>
  );
}

function useImgLoadObserver() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        if (
          !(entry.target instanceof HTMLImageElement) ||
          !entry.target.naturalWidth
        )
          return;

        setLoaded(true);
      }
    };

    if (!imgRef.current) return;

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(imgRef.current);

    return () => {
      // Cleanup: Disconnect the ResizeObserver when the component unmounts
      resizeObserver.disconnect();
    };
  }, []);

  return [imgRef, loaded, setLoaded] as const;
}
