import useAspectRatio, {
  isLoadedAspectRatio,
} from "#/features/media/useAspectRatio";

import styles from "./BlurOverlay.module.css";
import BlurOverlayMessage from "./BlurOverlayMessage";

interface BlurOverlayProps extends React.PropsWithChildren {
  src: string;
}

export default function BlurOverlay({ src, children }: BlurOverlayProps) {
  const aspectRatio = useAspectRatio(src);

  // Only blur if image is displayed (loaded)
  const blur = !!isLoadedAspectRatio(aspectRatio);

  return (
    <div className={styles.container}>
      <div className={blur ? styles.blur : undefined}>{children}</div>
      {blur && <BlurOverlayMessage />}
    </div>
  );
}
