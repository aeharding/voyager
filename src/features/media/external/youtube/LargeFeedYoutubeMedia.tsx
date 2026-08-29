import { IonIcon, useIonViewWillEnter } from "@ionic/react";
import { playCircle } from "ionicons/icons";
import {
  CSSProperties,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import CachedImg from "#/features/media/CachedImg";
import BlurOverlay from "#/features/post/inFeed/large/media/BlurOverlay";
import {
  getYoutubeThumbnailSrc,
  getYoutubeVideoId,
} from "#/features/post/link/thumbnail/sites/youtube";
import { cx } from "#/helpers/css";

import { useYoutubePortal } from "./YoutubePortalProvider";

import styles from "./LargeFeedYoutubeMedia.module.css";

interface LargeFeedYoutubeMediaProps {
  url: string;
  blur?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent) => void;
}

export default function LargeFeedYoutubeMedia({
  url,
  blur,
  className,
  style,
  onClick,
}: LargeFeedYoutubeMediaProps) {
  const videoId = getYoutubeVideoId(url);
  const thumb = getYoutubeThumbnailSrc(url);
  const slotRef = useRef<HTMLDivElement>(null);
  const { hasActive, acquire, release } = useYoutubePortal(videoId);

  const [thumbError, setThumbError] = useState(false);

  // If another instance has already started playing this video, register our
  // slot as a consumer so the overlay iframe can move over us when we become
  // the active view.
  useEffect(() => {
    if (hasActive) acquire(slotRef);
    return release;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  useIonViewWillEnter(() => {
    if (hasActive) acquire(slotRef);
  });

  if (!videoId || !thumb || typeof thumb === "string") return;

  const thumbSrc = thumbError ? thumb.sm : thumb.lg;

  function handlePlay(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    onClick?.(e);
    acquire(slotRef);
  }

  const containerClass = cx(styles.container, className);

  // Iframe is playing: render a slot that the overlay iframe visually covers.
  if (hasActive) {
    return <div ref={slotRef} className={containerClass} style={style} />;
  }

  const thumbnail = (
    <div ref={slotRef} className={containerClass} style={style}>
      <CachedImg
        className={styles.thumbnail}
        src={thumbSrc}
        onError={() => setThumbError(true)}
        draggable="false"
      />
      <div className={styles.playOverlay} onClick={handlePlay}>
        <IonIcon icon={playCircle} className={styles.playIcon} />
      </div>
    </div>
  );

  if (blur) return <BlurOverlay src={thumbSrc}>{thumbnail}</BlurOverlay>;

  return thumbnail;
}
