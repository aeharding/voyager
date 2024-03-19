import { IonActionSheet, IonButton } from "@ionic/react";
import {
  createOutline,
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
import { useAppSelector } from "../../store";
import { compact } from "lodash";
import HeaderEllipsisIcon from "../shared/HeaderEllipsisIcon";

interface MoreActionsProps {
  community: CommunityView | undefined;
}

export default function MoreActions({ community }: MoreActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IonButton disabled={!community} onClick={() => setOpen(true)}>
        <HeaderEllipsisIcon slot="icon-only" />
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

  const showHiddenInCommunities = useAppSelector(
    (state) => state.settings.general.posts.showHiddenInCommunities,
  );

  return (
    <IonActionSheet
      cssClass="left-align-buttons"
      isOpen={open}
      buttons={compact([
        {
          text: "Submit Post",
          cssClass: "detail",
          icon: createOutline,
          handler: () => {
            post();
          },
        },
        !showHiddenInCommunities && {
          text: "Hide Read Posts",
          icon: eyeOffOutline,
          handler: () => {
            hidePosts();
          },
        },
        {
          text: !isSubscribed ? "Subscribe" : "Unsubscribe",
          icon: !isSubscribed ? heartOutline : heartDislikeOutline,
          handler: () => {
            subscribe();
          },
        },
        {
          text: !isFavorite ? "Favorite" : "Unfavorite",
          icon: !isFavorite ? starOutline : starSharp,
          handler: () => {
            favorite();
          },
        },
        {
          text: "Sidebar",
          icon: tabletPortraitOutline,
          handler: () => {
            sidebar();
          },
        },
        {
          text: "Share",
          icon: shareOutline,
          handler: () => {
            share();
          },
        },
        {
          text: !isBlocked ? "Block Community" : "Unblock Community",
          role: !isBlocked ? "destructive" : undefined,
          icon: removeCircleOutline,
          handler: () => {
            block();
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ])}
      onDidDismiss={() => setOpen(false)}
    />
  );
}
