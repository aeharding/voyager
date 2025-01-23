import { useIonActionSheet } from "@ionic/react";

import { clearHidden } from "#/features/post/postSlice";
import { useAppDispatch, useAppSelector } from "#/store";

export default function useResetHiddenPosts() {
  const dispatch = useAppDispatch();
  const [presentActionSheet] = useIonActionSheet();
  const neverShowReadPosts = useAppSelector(
    (state) => state.settings.general.posts.neverShowReadPosts,
  );

  return function (cb?: () => void) {
    presentActionSheet({
      header: neverShowReadPosts
        ? 'Note: You have "Never Show Previously Read" turned on, so read posts will remain hidden'
        : undefined,
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
