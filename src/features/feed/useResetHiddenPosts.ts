import { useIonActionSheet } from "@ionic/react";
import { compact } from "es-toolkit";

import { clearHidden } from "#/features/post/postSlice";
import { useAppDispatch, useAppSelector } from "#/store";

export default function useResetHiddenPosts() {
  const dispatch = useAppDispatch();
  const [presentActionSheet] = useIonActionSheet();
  const neverShowReadPosts = useAppSelector(
    (state) => state.settings.general.posts.neverShowReadPosts,
  );

  return function (cb?: () => void, onUpdateHideDbCb?: () => void) {
    presentActionSheet({
      header: neverShowReadPosts
        ? 'Note: You have "Never Show Previously Read" turned on, so read posts will remain hidden'
        : undefined,
      buttons: compact([
        onUpdateHideDbCb && {
          text: "Show hidden temporarily",
          handler: () => {
            (async () => {
              onUpdateHideDbCb?.();
            })();
          },
        },
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
      ]),
    });
  };
}
