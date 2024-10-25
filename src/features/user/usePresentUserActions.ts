import { mailOutline, removeCircleOutline } from "ionicons/icons";
import { useCallback, useContext } from "react";
import { PageContext } from "../auth/PageContext";
import { useOptimizedIonRouter } from "../../helpers/useOptimizedIonRouter";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { compact } from "lodash";
import { ActionSheetButton, useIonActionSheet } from "@ionic/react";
import store, { useAppDispatch } from "../../store";
import { usernameSelector } from "../auth/authSelectors";
import { blockUser } from "./userSlice";
import { getBlockUserErrorMessage } from "../../helpers/lemmyErrors";
import { buildBlocked } from "../../helpers/toastMessages";
import useAppToast from "../../helpers/useAppToast";
import { getHandle } from "../../helpers/lemmy";
import { Person } from "lemmy-js-client";

interface Options {
  prependButtons?: ActionSheetButton[];
  hideMessageButton?: boolean;
}

export default function usePresentUserActions() {
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();
  const { presentLoginIfNeeded } = useContext(PageContext);
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [presentActionSheet] = useIonActionSheet();

  return useCallback(
    (handle: string, options?: Options) => {
      const state = store.getState();

      const isCurrentUser = usernameSelector(state) === handle;

      const blocks = state.site.response?.my_user?.person_blocks;
      const isBlocked = blocks?.some(
        (b) =>
          getHandle(
            "target" in b
              ? (b.target as Person) // TODO lemmy v0.19 and less support
              : b,
          ) === handle,
      );
      const user = state.user.userByHandle[handle];

      presentActionSheet({
        cssClass: "left-align-buttons",
        buttons: compact([
          ...(options?.prependButtons ?? []),
          !isCurrentUser &&
            !options?.hideMessageButton && {
              text: "Send Message",
              data: "message",
              icon: mailOutline,
              handler: () => {
                if (presentLoginIfNeeded()) return;

                router.push(buildGeneralBrowseLink(`/u/${handle}/message`));
              },
            },
          !isCurrentUser && {
            text: !isBlocked ? "Block User" : "Unblock User",
            data: "block",
            role: !isBlocked ? "destructive" : undefined,
            icon: removeCircleOutline,
            handler: () => {
              (async () => {
                if (presentLoginIfNeeded()) return;
                if (!user) return;

                try {
                  await dispatch(blockUser(!isBlocked, user.id));
                } catch (error) {
                  presentToast({
                    color: "danger",
                    message: getBlockUserErrorMessage(error, user),
                  });

                  throw error;
                }

                presentToast(buildBlocked(!isBlocked, handle));
              })();
            },
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]),
      });
    },
    [
      presentActionSheet,
      presentLoginIfNeeded,
      router,
      buildGeneralBrowseLink,
      presentToast,
      dispatch,
    ],
  );
}
