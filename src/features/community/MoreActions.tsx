import { IonButton, useIonActionSheet } from "@ionic/react";
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
import useHidePosts from "../feed/useHidePosts";
import useCommunityActions from "./useCommunityActions";
import { Community, CommunityView } from "lemmy-js-client";
import { useAppSelector } from "../../store";
import { compact } from "lodash";
import HeaderEllipsisIcon from "../shared/HeaderEllipsisIcon";
import { useBuildTogglePostAppearanceButton } from "../feed/SpecialFeedMoreActions";

interface MoreActionsProps {
  community: CommunityView | undefined;
}

export default function MoreActions({ community }: MoreActionsProps) {
  if (!community) return buildButtonJsx();

  return <MoreActionsWithCommunity community={community.community} />;
}

interface MoreActionsActionSheetProps {
  community: Community;
}

function MoreActionsWithCommunity({ community }: MoreActionsActionSheetProps) {
  const [presentActionSheet] = useIonActionSheet();
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
  const buildTogglePostAppearanceButton = useBuildTogglePostAppearanceButton();

  const showHiddenInCommunities = useAppSelector(
    (state) => state.settings.general.posts.showHiddenInCommunities,
  );

  function present() {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: compact([
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
        buildTogglePostAppearanceButton(),
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
      ]),
    });
  }

  return buildButtonJsx(present);
}

function buildButtonJsx(onClick?: () => void) {
  return (
    <IonButton disabled={!onClick} onClick={onClick}>
      <HeaderEllipsisIcon slot="icon-only" />
    </IonButton>
  );
}
