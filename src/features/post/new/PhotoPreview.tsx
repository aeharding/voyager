import { styled } from "@linaria/react";
import { IonSpinner } from "@ionic/react";

const Container = styled.div`
  position: relative;
`;

const Img = styled.img<{ loadingImage: boolean }>`
  max-width: 100px;
  max-height: 100px;
  padding: 1rem;

  filter: ${({ loadingImage }) =>
    loadingImage ? "blur(5px) brightness(0.5)" : "none"};
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
  onClick?: () => void;
}

export default function PhotoPreview({
  src,
  loading,
  onClick,
}: PhotoPreviewProps) {
  return (
    <Container>
      <Img src={src} onClick={onClick} loadingImage={loading} />
      {loading && <OverlaySpinner />}
    </Container>
  );
}
