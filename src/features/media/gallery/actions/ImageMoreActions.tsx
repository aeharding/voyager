import { isNative } from "#/helpers/device";
import { useAppSelector } from "#/store";

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
  const hideAltText = useAppSelector(
    (state) => state.settings.general.media.hideAltText,
  );

  return (
    <>
      {isNative() && (
        <div className={styles.topContainer}>
          <GalleryActions imgSrc={imgSrc} />
        </div>
      )}
      {alt && !hideAltText && (
        <BottomContainer>
          <AltText alt={alt} />
          <BottomContainerActions withBg />
        </BottomContainer>
      )}
    </>
  );
}
