import { ComponentProps, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  enable,
  getVideoSrc,
  initializeIfNeeded,
  validTokenSelector,
} from "./redgifsSlice";
import LargeFeedMedia from "../../../post/inFeed/large/media/LargeFeedMedia";
import { IonButton, IonText } from "@ionic/react";
import { stopIonicTapClick } from "../../../../helpers/ionic";
import { styled } from "@linaria/react";
import { setEmbedExternalMedia } from "../../../settings/settingsSlice";
import { css } from "@linaria/core";
import MediaPlaceholder from "../../../post/inFeed/large/media/MediaPlaceholder";

const EnableWarningContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  text-align: center;
`;

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
        <EnableWarningContainer>
          <IonText
            className={css`
              margin-bottom: 16px;
            `}
          >
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
        </EnableWarningContainer>
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
