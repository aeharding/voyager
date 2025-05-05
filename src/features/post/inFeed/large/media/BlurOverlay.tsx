import useImageData, { isLoadedImageData } from "#/features/media/useImageData";

import BlurOverlayMessage from "./BlurOverlayMessage";

import styles from "./BlurOverlay.module.css";

interface BlurOverlayProps extends React.PropsWithChildren {
  src: string | undefined;
}

export default function BlurOverlay({ src, children }: BlurOverlayProps) {
  const imageData = useImageData(src);

  // Only blur if image is displayed (loaded)
  const blur = !!isLoadedImageData(imageData);

  return (
    <div className={styles.container}>
      <div className={blur ? styles.blur : undefined}>{children}</div>
      {blur && <BlurOverlayMessage />}
    </div>
  );
}
