import { IonSpinner } from "@ionic/react";

import { cx } from "#/helpers/css";
import { isUrlVideo } from "#/helpers/url";

import styles from "./PhotoPreview.module.css";

interface PhotoPreviewProps {
  src: string;
  loading: boolean;
  onClick?: () => void;
  isVideo: boolean;
}

export default function PhotoPreview({
  src,
  loading,
  onClick,
  isVideo,
}: PhotoPreviewProps) {
  const Media = isVideo || isUrlVideo(src, undefined) ? "video" : "img";

  return (
    <div className={styles.container}>
      <Media
        src={src}
        playsInline
        muted
        autoPlay
        onPlaying={(e) => {
          if (!(e.target instanceof HTMLVideoElement)) return;

          // iOS won't show preview unless the video plays
          e.target.pause();
        }}
        onClick={onClick}
        className={cx(styles.img, loading && styles.loadingImage)}
      />
      {loading && <IonSpinner className={styles.overlaySpinner} />}
    </div>
  );
}
