import { IonSpinner } from "@ionic/react";
import { cx } from "@linaria/core";
import { styled } from "@linaria/react";

import styles from "./photoPreview.module.css";

const Container = styled.div`
  position: relative;
`;

const Img = styled.img<{ loadingImage: boolean }>``;

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
      <Img
        src={src}
        onClick={onClick}
        loadingImage={loading}
        className={cx(styles.img, loading && styles.loadingImage)}
      />
      {loading && <OverlaySpinner />}
    </Container>
  );
}
