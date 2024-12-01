import { ActionSheetButton, useIonActionSheet } from "@ionic/react";
import { compact } from "es-toolkit";
import {
  mailOutline,
  pricetagOutline,
  removeCircleOutline,
} from "ionicons/icons";
import { Person } from "lemmy-js-client";
import { useContext } from "react";

import { usernameSelector } from "#/features/auth/authSelectors";
import { PageContext } from "#/features/auth/PageContext";
import { getHandle } from "#/helpers/lemmy";
import { getBlockUserErrorMessage } from "#/helpers/lemmyErrors";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { buildBlockedUser } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import store, { useAppDispatch, useAppSelector } from "#/store";

import { blockUser } from "./userSlice";

export interface PresentUserActionsOptions {
  prependButtons?: ActionSheetButton[];
  hideMessageButton?: boolean;

  /**
   * If provided, will be used to generate a new tag.
   * Should be the ap_id of the post/comment
   */
  sourceUrl?: string;
}

export default function usePresentUserActions() {
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();
  const { presentLoginIfNeeded } = useContext(PageContext);
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [presentActionSheet] = useIonActionSheet();
  const { presentUserTag } = useContext(PageContext);
  const userTagsEnabled = useAppSelector(
    (state) => state.settings.tags.enabled,
  );

  return (user: Person, options?: PresentUserActionsOptions) => {
    const state = store.getState();

    const isCurrentUser = usernameSelector(state) === getHandle(user);

    const blocks = state.site.response?.my_user?.person_blocks;
    const isBlocked = blocks?.some(
      (b) =>
        getHandle(
          "target" in b
            ? (b.target as Person) // TODO lemmy v0.19 and less support
            : b,
        ) === getHandle(user),
    );

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

              router.push(
                // intent=send - SendMessageBox uses to determine focus
                buildGeneralBrowseLink(
                  `/u/${getHandle(user)}/message?intent=send`,
                ),
              );
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

              presentToast(buildBlockedUser(!isBlocked));
            })();
          },
        },
        userTagsEnabled && {
          text: "Edit Tag",
          icon: pricetagOutline,
          handler: async () => {
            if (!user) return;

            presentUserTag(user, options?.sourceUrl);
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
