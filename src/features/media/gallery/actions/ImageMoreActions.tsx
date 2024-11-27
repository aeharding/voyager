import { isNative } from "#/helpers/device";

import AltText from "./AltText";
import GalleryActions from "./GalleryActions";
import { BottomContainer, BottomContainerActions } from "./shared";

import styles from "./ImageMoreActions.module.css";

interface ImageMoreActionsProps {
  imgSrc: string;
  alt?: string;
}

export default function ImageMoreActions({
  imgSrc,
  alt,
}: ImageMoreActionsProps) {
  return (
    <>
      {isNative() && (
        <div className={styles.topContainer}>
          <GalleryActions imgSrc={imgSrc} />
        </div>
      )}
      {alt && (
        <BottomContainer>
          <AltText alt={alt} />
          <BottomContainerActions withBg={false} />
        </BottomContainer>
      )}
    </>
  );
}
