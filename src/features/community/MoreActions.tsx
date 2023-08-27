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
import useHidePosts from "../feed/useHidePosts";
import useCommunityActions from "./useCommunityActions";

interface MoreActionsProps {
  community: string;
}

export default function MoreActions({ community }: MoreActionsProps) {
  const [open, setOpen] = useState(false);
  const hidePosts = useHidePosts();
  const {
    communityByHandle,
    isSubscribed,
    isFavorite,
    isBlocked,
    post,
    subscribe,
    favorite,
    sidebar,
    block,
  } = useCommunityActions(community);

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
            icon: createOutline,
            handler: post,
          },
          {
            text: "Hide Read Posts",
            icon: eyeOffOutline,
            handler: () => hidePosts(),
          },
          {
            text: !isSubscribed ? "Subscribe" : "Unsubscribe",
            icon: !isSubscribed ? heartOutline : heartDislikeOutline,
            handler: () => subscribe(),
          },
          {
            text: !isFavorite ? "Favorite" : "Unfavorite",
            icon: !isFavorite ? starOutline : starSharp,
            handler: favorite,
          },
          {
            text: "Sidebar",
            icon: tabletPortraitOutline,
            handler: sidebar,
          },
          {
            text: !isBlocked ? "Block Community" : "Unblock Community",
            role: !isBlocked ? "destructive" : undefined,
            icon: removeCircleOutline,
            handler: () => block(),
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
