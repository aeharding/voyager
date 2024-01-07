import { useIonActionSheet, useIonAlert } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../store";
import { useContext, useState } from "react";
import useAppToast from "../../helpers/useAppToast";
import { CommentView } from "lemmy-js-client";
import { localUserSelector } from "../auth/siteSlice";
import { notEmpty } from "../../helpers/array";
import useCanModerate from "./useCanModerate";
import {
  checkmarkCircleOutline,
  colorWandOutline,
  hammerOutline,
  shieldCheckmarkOutline,
  trashOutline,
} from "ionicons/icons";
import {
  buildBanFailed,
  buildBanned,
  commentApproved,
  commentDistinguished,
  commentRemoved,
} from "../../helpers/toastMessages";
import {
  modDistinguishComment,
  modNukeCommentChain,
  modRemoveComment,
} from "../comment/commentSlice";
import { stringifyReports } from "./usePostModActions";
import { reportsByCommentIdSelector, resolveCommentReport } from "./modSlice";
import { banUser } from "../user/userSlice";
import { PageContext } from "../auth/PageContext";

export default function useCommentModActions(commentView: CommentView) {
  const [presentAlert] = useIonAlert();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const localUser = useAppSelector(localUserSelector);
  const [presentActionSheet] = useIonActionSheet();
  const presentToast = useAppToast();
  const { presentBanUser } = useContext(PageContext);
  const role = useCanModerate(commentView.community);

  const comment = useAppSelector(
    (state) =>
      state.comment.commentById[commentView.comment.id] ?? commentView.comment,
  );

  const isSelf = comment.creator_id === localUser?.person_id;

  const reports = useAppSelector(
    (state) => reportsByCommentIdSelector(state)[comment.id],
  );

  const bannedFromCommunity = useAppSelector(
    (state) =>
      state.user.bannedByCommunityIdUserId[
        `${commentView.community.id}${commentView.creator.id}`
      ],
  );

  const banned =
    bannedFromCommunity ?? commentView.creator_banned_from_community;

  function present() {
    presentActionSheet({
      header: stringifyReports(reports),
      cssClass: `${role} left-align-buttons`,
      buttons: [
        isSelf
          ? {
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
            }
          : undefined,
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
                  await dispatch(modRemoveComment(comment.id, true));

                  presentToast(commentRemoved);
                })();
              },
            }
          : {
              text: "Restore",
              icon: checkmarkCircleOutline,
              handler: () => {
                (async () => {
                  await dispatch(modRemoveComment(comment.id, false));

                  presentToast(commentApproved);
                })();
              },
            },
        {
          text: "Comment Nuke",
          icon: colorWandOutline,
          handler: () => {
            presentAlert(
              `Remove ${
                commentView.counts.child_count + 1
              } comments in comment chain?`,
              [
                {
                  text: "Begone",
                  cssClass: "mod",
                  handler: () => {
                    (async () => {
                      setLoading(true);

                      try {
                        await dispatch(modNukeCommentChain(comment.id));
                      } finally {
                        setLoading(false);
                      }
                    })();
                  },
                },
                { text: "Cancel", role: "cancel", cssClass: "mod" },
              ],
            );
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
      ].filter(notEmpty),
    });
  }

  return { present, loading };
}
