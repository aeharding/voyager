import { isNative } from "#/helpers/device";
import { useAppSelector } from "#/store";

import AltText from "./AltText";
import GalleryActions from "./GalleryActions";
import { BottomContainer, BottomContainerActions } from "./shared";
import VideoActions from "./VideoActions";

import styles from "./ImageMoreActions.module.css";

interface ImageMoreActionsProps extends React.ComponentProps<typeof AltText> {
  src: string;
  videoRef?: React.RefObject<HTMLVideoElement | undefined>;
}

export default function ImageMoreActions({
  src,
  alt,
  videoRef,
  title,
}: ImageMoreActionsProps) {
  const hideAltText = useAppSelector(
    (state) => state.settings.general.media.hideAltText,
  );

  const hasAlt = !!alt && !hideAltText;
  const hasVideo = !!videoRef;

  return (
    <>
      {isNative() && (
        <div className={styles.topContainer}>
          <GalleryActions src={src} />
        </div>
      )}
      {(hasAlt || hasVideo) && (
        <BottomContainer>
          {hasAlt && <AltText alt={alt} title={title} />}
          {hasVideo && <VideoActions videoRef={videoRef} />}
          <BottomContainerActions withBg />
        </BottomContainer>
      )}
    </>
  );
}
