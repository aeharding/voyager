import { ComponentProps, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  getVideoSrc,
  initializeIfNeeded,
  validTokenSelector,
} from "./redgifsSlice";
import LargeFeedMedia, {
  PlaceholderContainer,
} from "../../../post/inFeed/large/media/LargeFeedMedia";
import { IonButton, IonText } from "@ionic/react";
import { preventIonicTapClick } from "../../../../helpers/ionic";

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

  if (!status)
    return (
      <PlaceholderContainer
        className="not-loaded"
        onTouchStart={() => preventIonicTapClick()}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div>
          <IonText>Load embed video from redgifs.com?</IonText>
          <IonButton>Connect</IonButton>
        </div>
      </PlaceholderContainer>
    );

  if (!src) return <></>;

  return <LargeFeedMedia {...rest} src={src} />;
}
