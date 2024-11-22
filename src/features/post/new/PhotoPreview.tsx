import { IonSpinner } from "@ionic/react";

import { cx } from "#/helpers/css";

import styles from "./PhotoPreview.module.css";

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
    <div className={styles.container}>
      <img
        src={src}
        onClick={onClick}
        className={cx(styles.img, loading && styles.loadingImage)}
      />
      {loading && <IonSpinner className={styles.overlaySpinner} />}
    </div>
  );
}
