import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { IonSpinner } from "@ionic/react";
import GalleryImg from "../../gallery/GalleryImg";

const Container = styled.div`
  position: relative;
`;

const PreviewImg = styled(GalleryImg, {
  shouldForwardProp: (prop) => prop !== "loadingImage",
})<{ loadingImage: boolean }>`
  max-width: 100px;
  max-height: 100px;
  padding: 1rem;

  ${({ loadingImage }) =>
    loadingImage &&
    css`
      filter: blur(5px) brightness(0.5);
    `}
`;

const OverlaySpinner = styled(IonSpinner)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

interface PhotoPreviewProps {
  src: string;
  loading: boolean;
}

export default function PhotoPreview({ src, loading }: PhotoPreviewProps) {
  return (
    <Container>
      <PreviewImg
        src={src}
        loadingImage={loading}
        animationType="zoom"
        className="pswp-topmost"
      />
      {loading && <OverlaySpinner />}
    </Container>
  );
}
