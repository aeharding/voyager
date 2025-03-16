import { IonButton, useIonActionSheet } from "@ionic/react";
import { eyeOffOutline, imageOutline, listOutline } from "ionicons/icons";
import { ListingType } from "lemmy-js-client";

import { urlSelector } from "#/features/auth/authSelectors";
import {
  usePostAppearance,
  useSetPostAppearance,
} from "#/features/post/appearance/PostAppearanceProvider";
import { OPostAppearanceType } from "#/features/settings/settingsSlice";
import HeaderEllipsisIcon from "#/features/shared/HeaderEllipsisIcon";
import { getShareIcon } from "#/helpers/device";
import { shareUrl } from "#/helpers/share";
import { buildBaseLemmyUrl } from "#/services/lemmy";
import store from "#/store";

import useHidePosts from "./useHidePosts";

interface SpecialFeedMoreActionsProps {
  type: ListingType;
}

export default function SpecialFeedMoreActions({
  type,
}: SpecialFeedMoreActionsProps) {
  const [presentActionSheet] = useIonActionSheet();
  const hidePosts = useHidePosts();
  const buildTogglePostAppearanceButton = useBuildTogglePostAppearanceButton();

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
          icon: getShareIcon(),
          handler: () => {
            const url = buildBaseLemmyUrl(urlSelector(store.getState()));

            shareUrl(`${url}?dataType=Post&listingType=${type}`);
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

export function useBuildTogglePostAppearanceButton() {
  const postAppearance = usePostAppearance();
  const setPostAppearance = useSetPostAppearance();

  return () => {
    switch (postAppearance) {
      case OPostAppearanceType.Compact:
        return {
          text: "Large Posts",
          icon: imageOutline,
          handler: () => {
            setPostAppearance(OPostAppearanceType.Large);
          },
        };
      case OPostAppearanceType.Large:
        return {
          text: "Compact Posts",
          icon: listOutline,
          handler: () => {
            setPostAppearance(OPostAppearanceType.Compact);
          },
        };
    }
  };
}
