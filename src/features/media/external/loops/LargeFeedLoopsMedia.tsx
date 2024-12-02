import { IonButton, IonText } from "@ionic/react";
import { ComponentProps, useEffect } from "react";

import MediaPlaceholder from "#/features/media/MediaPlaceholder";
import LargeFeedMedia from "#/features/post/inFeed/large/media/LargeFeedMedia";
import { setEmbedExternalMedia } from "#/features/settings/settingsSlice";
import { stopIonicTapClick } from "#/helpers/ionic";
import { useAppDispatch, useAppSelector } from "#/store";

import { enable, getVideoSrc } from "./loopsSlice";

import styles from "./LargeFeedLoopsMedia.module.css";

interface LoopsProps
  extends Omit<ComponentProps<typeof LargeFeedMedia>, "src"> {
  url: string;
}

export default function LargeFeedLoopsMedia({ url, ...rest }: LoopsProps) {
  const dispatch = useAppDispatch();
  const enabled = useAppSelector((state) => state.loops.enabled);
  const src = useAppSelector((state) => {
    const video = state.loops.videoByUrl[url];
    if (typeof video === "object") return video.src;
  });

  useEffect(() => {
    dispatch(getVideoSrc(url));
  }, [enabled, url, dispatch]);

  if (!enabled)
    return (
      <MediaPlaceholder state="custom" className={rest.className}>
        <div className={styles.enableWarningContainer}>
          <IonText className="ion-margin-bottom">
            Embed videos from <strong>loops.video</strong>?
          </IonText>
          <IonButton
            onClick={(e) => {
              e.stopPropagation();
              dispatch(enable());
            }}
            onTouchStart={() => stopIonicTapClick()}
            size="default"
          >
            Ok
          </IonButton>
          <IonButton
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setEmbedExternalMedia(false));
            }}
            onTouchStart={() => stopIonicTapClick()}
            size="default"
            fill="clear"
            color="dark"
          >
            Never embed external media
          </IonButton>
        </div>
      </MediaPlaceholder>
    );

  if (!src)
    return (
      <MediaPlaceholder
        state="loading"
        onTouchStart={() => stopIonicTapClick()}
      />
    );

  return <LargeFeedMedia {...rest} src={src} />;
}
