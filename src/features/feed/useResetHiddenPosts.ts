import { useIonActionSheet } from "@ionic/react";
import { useCallback } from "react";

import { clearHidden } from "#/features/post/postSlice";
import { useAppDispatch } from "#/store";

export default function useResetHiddenPosts() {
  const dispatch = useAppDispatch();
  const [presentActionSheet] = useIonActionSheet();

  return useCallback(
    (cb?: () => void) => {
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
    },
    [dispatch, presentActionSheet],
  );
}
