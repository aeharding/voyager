import { isNative } from "#/helpers/device";

import AltText from "./AltText";
import GalleryActions from "./GalleryActions";
import { BottomContainer, BottomContainerActions } from "./shared";
import VideoActions from "./VideoActions";

import styles from "./ImageMoreActions.module.css";

interface ImageMoreActionsProps {
  imgSrc: string;
  alt?: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

export default function ImageMoreActions({
  imgSrc,
  alt,
  videoRef,
}: ImageMoreActionsProps) {
  return (
    <>
      {isNative() && (
        <div className={styles.topContainer}>
          <GalleryActions src={imgSrc} />
        </div>
      )}
      {alt && (
        <BottomContainer>
          <AltText alt={alt} />
          {videoRef && <VideoActions videoRef={videoRef} />}
          <BottomContainerActions withBg={!!alt} />
        </BottomContainer>
      )}
    </>
  );
}
