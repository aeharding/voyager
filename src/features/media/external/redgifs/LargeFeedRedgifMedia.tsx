import { IonButton, IonText } from "@ionic/react";
import { ComponentProps, useEffect } from "react";

import MediaPlaceholder from "#/features/media/MediaPlaceholder";
import LargeFeedMedia from "#/features/post/inFeed/large/media/LargeFeedMedia";
import { setEmbedExternalMedia } from "#/features/settings/settingsSlice";
import { stopIonicTapClick } from "#/helpers/ionic";
import { useAppDispatch, useAppSelector } from "#/store";

import {
  enable,
  getVideoSrc,
  initializeIfNeeded,
  validTokenSelector,
} from "./redgifsSlice";

import styles from "./LargeFeedRedgifMedia.module.css";

interface RedgifProps
  extends Omit<ComponentProps<typeof LargeFeedMedia>, "src"> {
  url: string;
}

export default function LargeFeedRedgifMedia({ url, ...rest }: RedgifProps) {
  const dispatch = useAppDispatch();
  const validToken = useAppSelector(validTokenSelector);
  const status = useAppSelector((state) => state.redgifs.providerFetchStatus);
  const src = useAppSelector((state) => {
    const video = state.redgifs.videoByUrl[url];
    if (typeof video === "object") return video.src;
  });

  useEffect(() => {
    dispatch(initializeIfNeeded());
    dispatch(getVideoSrc(url));
  }, [validToken, url, dispatch]);

  if (status === "needs-enable")
    return (
      <MediaPlaceholder state="custom">
        <div className={styles.enableWarningContainer}>
          <IonText className="ion-margin-bottom">
            Embed videos from <strong>redgifs.com</strong>?
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
