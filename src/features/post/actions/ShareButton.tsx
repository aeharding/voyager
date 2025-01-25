import { IonIcon } from "@ionic/react";
import { PostView } from "lemmy-js-client";
import { LongPressCallbackReason, useLongPress } from "use-long-press";

import { useSharePostComment } from "#/features/shared/useSharePostComment";
import { getShareIcon } from "#/helpers/device";

import { ActionButton } from "./ActionButton";

interface ShareButtonProps {
  post: PostView;
}

export default function ShareButton({ post }: ShareButtonProps) {
  const { share, onAsk } = useSharePostComment(post);
  const bind = useLongPress(onAsk, {
    cancelOnMovement: 15,
    onCancel: (_, meta) => {
      if (meta.reason !== LongPressCallbackReason.CancelledByRelease) return;

      share();
    },
  });

  return (
    <ActionButton {...bind()}>
      <IonIcon icon={getShareIcon()} />
    </ActionButton>
  );
}
