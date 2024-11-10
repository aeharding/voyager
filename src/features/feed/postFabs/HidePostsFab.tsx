import { IonFab, IonFabButton, IonIcon } from "@ionic/react";
import { eyeOffOutline } from "ionicons/icons";
import { useContext } from "react";
import { LongPressCallbackReason, useLongPress } from "use-long-press";

import { AppContext } from "#/features/auth/AppContext";
import { scrollUpIfNeeded } from "#/helpers/scrollUpIfNeeded";

import useHidePosts from "../useHidePosts";
import useResetHiddenPosts from "../useResetHiddenPosts";

interface HidePostsFabProps {
  forceRefresh: () => void;
}

export default function HidePostsFab({ forceRefresh }: HidePostsFabProps) {
  const hidePosts = useHidePosts();
  const resetHiddenPosts = useResetHiddenPosts();
  const { activePageRef } = useContext(AppContext);

  const bind = useLongPress(
    () => {
      resetHiddenPosts(() => {
        forceRefresh();
        scrollUpIfNeeded(activePageRef?.current, 0, "auto");
      });
    },
    {
      cancelOnMovement: 15,
      onCancel: (_, meta) => {
        if (meta.reason !== LongPressCallbackReason.CancelledByRelease) return;

        hidePosts();
      },
    },
  );

  return (
    <IonFab slot="fixed" vertical="bottom" horizontal="end">
      <IonFabButton onClick={hidePosts} {...bind()}>
        <IonIcon icon={eyeOffOutline} />
      </IonFabButton>
    </IonFab>
  );
}
