import { IonActionSheet, IonButton, IonIcon } from "@ionic/react";
import {
  createOutline,
  ellipsisHorizontal,
  heartDislikeOutline,
  heartOutline,
  starOutline,
  starSharp,
  removeCircleOutline,
  tabletPortraitOutline,
  eyeOffOutline,
} from "ionicons/icons";
import { useState } from "react";
import { useAppSelector } from "../../store";
import useHidePosts from "../feed/useHidePosts";
import useCommunityActions from "./useCommunityActions";

interface MoreActionsProps {
  community: string;
}

export default function MoreActions({ community }: MoreActionsProps) {
  const [open, setOpen] = useState(false);

  const hidePosts = useHidePosts();

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle,
  );

  const {
    isSubscribed,
    isBlocked,
    isFavorite,
    subscribe,
    block,
    post,
    sidebar,
  } = useCommunityActions(communityByHandle[community]!);

  return (
    <>
      <IonButton
        disabled={!communityByHandle[community]}
        fill="default"
        onClick={() => setOpen(true)}
      >
        <IonIcon icon={ellipsisHorizontal} color="primary" />
      </IonButton>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        buttons={[
          {
            text: "Submit Post",
            data: "post",
            icon: createOutline,
            handler: post,
          },
          {
            text: "Hide Read Posts",
            data: "hide-read",
            icon: eyeOffOutline,
            handler: hidePosts,
          },
          {
            text: !isSubscribed ? "Subscribe" : "Unsubscribe",
            data: "subscribe",
            icon: !isSubscribed ? heartOutline : heartDislikeOutline,
            handler: subscribe,
          },
          {
            text: !isFavorite ? "Favorite" : "Unfavorite",
            data: "favorite",
            icon: !isFavorite ? starOutline : starSharp,
          },
          {
            text: "Sidebar",
            data: "sidebar",
            icon: tabletPortraitOutline,
            handler: sidebar,
          },
          {
            text: !isBlocked ? "Block Community" : "Unblock Community",
            role: !isBlocked ? "destructive" : undefined,
            data: "block",
            icon: removeCircleOutline,
            handler: block,
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
        onDidDismiss={() => setOpen(false)}
      />
    </>
  );
}
