import { IonFab, IonFabButton, IonIcon } from "@ionic/react";
import { eyeOffOutline } from "ionicons/icons";
import { useCallback, useContext } from "react";
import {
  LongPressCallback,
  LongPressCallbackReason,
  useLongPress,
} from "use-long-press";

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

  const onJumpLongPress = useCallback(() => {
    resetHiddenPosts(() => {
      forceRefresh();
      scrollUpIfNeeded(activePageRef?.current, 0, "auto");
    });
  }, [resetHiddenPosts, forceRefresh, activePageRef]);

  const onLongPressCancel: LongPressCallback = useCallback(
    (_, meta) => {
      if (meta.reason !== LongPressCallbackReason.CancelledByRelease) return;

      hidePosts();
    },
    [hidePosts],
  );

  const bind = useLongPress(onJumpLongPress, {
    cancelOnMovement: 15,
    onCancel: onLongPressCancel,
  });

  return (
    <IonFab slot="fixed" vertical="bottom" horizontal="end">
      <IonFabButton onClick={hidePosts} {...bind()}>
        <IonIcon icon={eyeOffOutline} />
      </IonFabButton>
    </IonFab>
  );
}
