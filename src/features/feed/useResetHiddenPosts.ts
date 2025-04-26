import { ActionSheetButton, useIonActionSheet } from "@ionic/react";
import { compact } from "es-toolkit";

import { clearHidden } from "#/features/post/postSlice";
import { useAppDispatch, useAppSelector } from "#/store";

export default function useResetHiddenPosts() {
  const dispatch = useAppDispatch();
  const [presentActionSheet] = useIonActionSheet();
  const neverShowReadPosts = useAppSelector(
    (state) => state.settings.general.posts.neverShowReadPosts,
  );

  return function (options?: {
    onFinishReset?: () => void;
    prependButtons?: ActionSheetButton[];
  }) {
    presentActionSheet({
      header: neverShowReadPosts
        ? 'Note: You have "Never Show Previously Read" turned on, so read posts will remain hidden'
        : undefined,
      buttons: compact([
        ...(options?.prependButtons ?? []),
        {
          text: "Reset hidden posts",
          role: "destructive",
          handler: () => {
            (async () => {
              await dispatch(clearHidden());
              options?.onFinishReset?.();
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
