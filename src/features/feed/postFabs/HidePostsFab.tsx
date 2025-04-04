import { IonFab, IonFabButton, IonIcon } from "@ionic/react";
import { eyeOffOutline, eyeOutline } from "ionicons/icons";
import { use } from "react";
import { LongPressCallbackReason, useLongPress } from "use-long-press";

import { AppContext } from "#/features/auth/AppContext";
import { scrollUpIfNeeded } from "#/helpers/scrollUpIfNeeded";

import useHidePosts from "../useHidePosts";
import useResetHiddenPosts from "../useResetHiddenPosts";

interface HidePostsFabProps {
  forceRefresh: () => void;
  setShowHiddenPosts: (show: boolean) => void;
  showHiddenPosts: boolean;
}

export default function HidePostsFab({
  forceRefresh,
  setShowHiddenPosts,
  showHiddenPosts,
}: HidePostsFabProps) {
  const hidePosts = useHidePosts();
  const resetHiddenPosts = useResetHiddenPosts();
  const { activePageRef } = use(AppContext);

  const bind = useLongPress(
    () => {
      resetHiddenPosts(
        () => {
          forceRefresh();
          scrollUpIfNeeded(activePageRef?.current, 0, "auto");
        },
        () => {
          setShowHiddenPosts(true);
          forceRefresh();
          scrollUpIfNeeded(activePageRef?.current, 0, "auto");
        },
      );
    },
    {
      cancelOnMovement: 15,
      onCancel: (_, meta) => {
        if (meta.reason !== LongPressCallbackReason.CancelledByRelease) return;

        if (showHiddenPosts) {
          setShowHiddenPosts(false);
          forceRefresh();
          scrollUpIfNeeded(activePageRef?.current, 0, "auto");
          return;
        }

        hidePosts();
      },
    },
  );

  return (
    <IonFab slot="fixed" vertical="bottom" horizontal="end">
      <IonFabButton {...bind()}>
        <IonIcon icon={showHiddenPosts ? eyeOutline : eyeOffOutline} />
      </IonFabButton>
    </IonFab>
  );
}
