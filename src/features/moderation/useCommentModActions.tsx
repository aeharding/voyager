import { useIonActionSheet, useIonAlert } from "@ionic/react";
import { compact } from "es-toolkit";
import {
  checkmarkCircleOutline,
  colorWandOutline,
  hammerOutline,
  shieldCheckmarkOutline,
  trashOutline,
} from "ionicons/icons";
import { CommentView } from "lemmy-js-client";
import { useCallback, useContext, useMemo, useState } from "react";

import { PageContext } from "#/features/auth/PageContext";
import { localUserSelector } from "#/features/auth/siteSlice";
import {
  modDistinguishComment,
  modNukeCommentChain,
  modRemoveComment,
} from "#/features/comment/commentSlice";
import { trashEllipse } from "#/features/icons";
import { banUser } from "#/features/user/userSlice";
import {
  buildBanFailed,
  buildBanned,
  commentApproved,
  commentDistinguished,
  commentRemovedMod,
} from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import store, { useAppDispatch } from "#/store";

import { reportsByCommentIdSelector, resolveCommentReport } from "./modSlice";
import { getCanModerate } from "./useCanModerate";
import { stringifyReports } from "./usePostModActions";

export default function useCommentModActions(commentView: CommentView) {
  const dispatch = useAppDispatch();
  const [presentAlert] = useIonAlert();
  const [presentActionSheet] = useIonActionSheet();
  const presentToast = useAppToast();
  const { presentBanUser } = useContext(PageContext);

  const [loading, setLoading] = useState(false);

  // Do all logic sync in present() so it doesn't slow down initial render
  const present = useCallback(() => {
    const state = store.getState();

    const comment =
      state.comment.commentById[commentView.comment.id] ?? commentView.comment;

    const localUser = localUserSelector(state);

    const isSelf = comment.creator_id === localUser?.person_id;

    const reports = reportsByCommentIdSelector(state)[comment.id];

    const bannedFromCommunity =
      state.user.bannedByCommunityIdUserId[
        `${commentView.community.id}${commentView.creator.id}`
      ];

    const banned =
      bannedFromCommunity ?? commentView.creator_banned_from_community;

    const role = getCanModerate(commentView.community);

    presentActionSheet({
      header: stringifyReports(reports),
      cssClass: `${role} left-align-buttons`,
      buttons: compact([
        isSelf && {
          text: !comment.distinguished ? "Distinguish" : "Undistinguish",
          icon: shieldCheckmarkOutline,
          handler: () => {
            (async () => {
              await dispatch(
                modDistinguishComment(comment.id, !comment.distinguished),
              );

              presentToast(commentDistinguished);
            })();
          },
        },
        !comment.removed && reports?.length
          ? {
              text: "Approve",
              icon: checkmarkCircleOutline,
              handler: () => {
                (async () => {
                  await dispatch(resolveCommentReport(comment.id));

                  presentToast(commentApproved);
                })();
              },
            }
          : undefined,
        !comment.removed
          ? {
              text: "Remove",
              icon: trashOutline,
              handler: () => {
                (async () => {
                  await dispatch(modRemoveComment(comment, true));

                  presentToast(commentRemovedMod);
                })();
              },
            }
          : {
              text: "Restore",
              icon: checkmarkCircleOutline,
              handler: () => {
                (async () => {
                  await dispatch(modRemoveComment(comment, false));

                  presentToast(commentApproved);
                })();
              },
            },
        !comment.removed && {
          text: "Remove With Reason",
          icon: trashEllipse,
          handler: () => {
            presentAlert({
              message: "Remove with reason",
              buttons: [
                {
                  text: "Remove",
                  cssClass: "mod",
                  handler: ({ reason }) => {
                    (async () => {
                      await dispatch(modRemoveComment(comment, true, reason));

                      presentToast(commentRemovedMod);
                    })();
                  },
                },
                { text: "Cancel", role: "cancel", cssClass: "mod" },
              ],
              inputs: [
                {
                  placeholder: "Public removal reason",
                  name: "reason",
                },
              ],
            });
          },
        },
        {
          text: "Comment Nuke",
          icon: colorWandOutline,
          handler: () => {
            presentAlert({
              message: `Remove ${
                commentView.counts.child_count + 1
              } comments in comment chain?`,
              buttons: [
                {
                  text: "Begone",
                  cssClass: "mod",
                  handler: ({ reason }) => {
                    (async () => {
                      setLoading(true);

                      try {
                        await dispatch(modNukeCommentChain(comment.id, reason));
                      } finally {
                        setLoading(false);
                      }
                    })();
                  },
                },
                { text: "Cancel", role: "cancel", cssClass: "mod" },
              ],
              inputs: [
                {
                  placeholder: "Reason (public, optional)",
                  name: "reason",
                },
              ],
            });
          },
        },
        role === "mod" || role === "admin-local"
          ? {
              text: !banned ? "Ban User" : "Unban User",
              icon: hammerOutline,
              handler: () => {
                (async () => {
                  if (banned) {
                    try {
                      await dispatch(
                        banUser({
                          person_id: commentView.creator.id,
                          community_id: commentView.community.id,
                          ban: false,
                        }),
                      );
                    } catch (error) {
                      presentToast(buildBanFailed(false));
                      throw error;
                    }

                    presentToast(buildBanned(false));

                    return;
                  }

                  presentBanUser({
                    user: commentView.creator,
                    community: commentView.community,
                  });
                })();
              },
            }
          : undefined,
        {
          text: "Cancel",
          role: "cancel",
        },
      ]),
    });
  }, [
    commentView,
    dispatch,
    presentActionSheet,
    presentAlert,
    presentBanUser,
    presentToast,
  ]);

  return useMemo(() => ({ present, loading }), [loading, present]);
}
