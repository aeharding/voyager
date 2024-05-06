import { IonButton, useIonActionSheet } from "@ionic/react";
import {
  eyeOffOutline,
  imageOutline,
  listOutline,
  shareOutline,
} from "ionicons/icons";
import useHidePosts from "./useHidePosts";
import HeaderEllipsisIcon from "../shared/HeaderEllipsisIcon";
import { Share } from "@capacitor/share";
import { ListingType } from "lemmy-js-client";
import store from "../../store";
import { urlSelector } from "../auth/authSelectors";
import {
  OPostAppearanceType,
  setPostAppearance,
} from "../settings/settingsSlice";

interface SpecialFeedMoreActionsProps {
  type: ListingType;
}

export default function SpecialFeedMoreActions({
  type,
}: SpecialFeedMoreActionsProps) {
  const [presentActionSheet] = useIonActionSheet();
  const hidePosts = useHidePosts();

  function present() {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: [
        {
          text: "Hide Read Posts",
          icon: eyeOffOutline,
          handler: () => {
            hidePosts();
          },
        },
        buildTogglePostAppearanceButton(),
        {
          text: "Share",
          icon: shareOutline,
          handler: () => {
            const url = urlSelector(store.getState());

            Share.share({
              url: `https://${url}?dataType=Post&listingType=${type}`,
            });
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });
  }

  return (
    <IonButton onClick={present}>
      <HeaderEllipsisIcon slot="icon-only" />
    </IonButton>
  );
}

export function buildTogglePostAppearanceButton() {
  const postAppearanceType = store.getState().settings.appearance.posts.type;

  switch (postAppearanceType) {
    case OPostAppearanceType.Compact:
      return {
        text: "Large Posts",
        icon: imageOutline,
        handler: () => {
          store.dispatch(setPostAppearance(OPostAppearanceType.Large));
        },
      };
    case OPostAppearanceType.Large:
      return {
        text: "Compact Posts",
        icon: listOutline,
        handler: () => {
          store.dispatch(setPostAppearance(OPostAppearanceType.Compact));
        },
      };
  }
}
