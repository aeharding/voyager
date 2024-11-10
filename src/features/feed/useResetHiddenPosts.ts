import { useIonActionSheet } from "@ionic/react";

import { clearHidden } from "#/features/post/postSlice";
import { useAppDispatch } from "#/store";

export default function useResetHiddenPosts() {
  const dispatch = useAppDispatch();
  const [presentActionSheet] = useIonActionSheet();

  return function (cb?: () => void) {
    presentActionSheet({
      buttons: [
        {
          text: "Reset hidden posts",
          role: "destructive",
          handler: () => {
            (async () => {
              await dispatch(clearHidden());
              cb?.();
            })();
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });
  };
}
