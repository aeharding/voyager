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
  shareOutline,
} from "ionicons/icons";
import { useState } from "react";
import useHidePosts from "../feed/useHidePosts";
import useCommunityActions from "./useCommunityActions";
import { Community, CommunityView } from "lemmy-js-client";

interface MoreActionsProps {
  community: CommunityView | undefined;
}

export default function MoreActions({ community }: MoreActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IonButton
        disabled={!community}
        fill="default"
        onClick={() => setOpen(true)}
      >
        <IonIcon icon={ellipsisHorizontal} color="primary" />
      </IonButton>

      {community && (
        <MoreActionsActionSheet
          community={community?.community}
          open={open}
          setOpen={setOpen}
        />
      )}
    </>
  );
}

interface MoreActionsActionSheetProps {
  community: Community;
  open: boolean;
  setOpen: (open: boolean) => void;
}

function MoreActionsActionSheet({
  community,
  open,
  setOpen,
}: MoreActionsActionSheetProps) {
  const {
    isSubscribed,
    isBlocked,
    isFavorite,
    subscribe,
    block,
    post,
    sidebar,
    favorite,
    share,
  } = useCommunityActions(community);
  const hidePosts = useHidePosts();

  return (
    <IonActionSheet
      cssClass="left-align-buttons"
      isOpen={open}
      buttons={[
        {
          text: "Submit Post",
          data: "post",
          icon: createOutline,
          handler: () => {
            post();
          },
        },
        {
          text: "Hide Read Posts",
          data: "hide-read",
          icon: eyeOffOutline,
          handler: () => {
            hidePosts();
          },
        },
        {
          text: !isSubscribed ? "Subscribe" : "Unsubscribe",
          data: "subscribe",
          icon: !isSubscribed ? heartOutline : heartDislikeOutline,
          handler: () => {
            subscribe();
          },
        },
        {
          text: !isFavorite ? "Favorite" : "Unfavorite",
          data: "favorite",
          icon: !isFavorite ? starOutline : starSharp,
          handler: () => {
            favorite();
          },
        },
        {
          text: "Sidebar",
          data: "sidebar",
          icon: tabletPortraitOutline,
          handler: () => {
            sidebar();
          },
        },
        {
          text: "Share",
          data: "share",
          icon: shareOutline,
          handler: () => {
            share();
          },
        },
        {
          text: !isBlocked ? "Block Community" : "Unblock Community",
          role: !isBlocked ? "destructive" : undefined,
          data: "block",
          icon: removeCircleOutline,
          handler: () => {
            block();
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ]}
      onDidDismiss={() => setOpen(false)}
    />
  );
}
