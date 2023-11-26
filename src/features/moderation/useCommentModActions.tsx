import { useIonActionSheet, useIonAlert } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../store";
import { useState } from "react";
import useAppToast from "../../helpers/useAppToast";
import { CommentView } from "lemmy-js-client";
import { localUserSelector } from "../auth/authSlice";
import { notEmpty } from "../../helpers/array";
import useCanModerate from "./useCanModerate";
import {
  checkmarkCircleOutline,
  colorWandOutline,
  shieldCheckmarkOutline,
  trashOutline,
} from "ionicons/icons";
import {
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
import { reportsByCommentIdSelector } from "./modSlice";

export default function useCommentModActions(commentView: CommentView) {
  const [presentAlert] = useIonAlert();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const localUser = useAppSelector(localUserSelector);
  const [presentActionSheet] = useIonActionSheet();
  const presentToast = useAppToast();
  const role = useCanModerate(commentView.community);

  const comment = useAppSelector(
    (state) =>
      state.comment.commentById[commentView.comment.id] ?? commentView.comment,
  );

  const isSelf = comment.creator_id === localUser?.person_id;

  const reports = useAppSelector(
    (state) => reportsByCommentIdSelector(state)[comment.id],
  );

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
        {
          text: "Approve",
          icon: checkmarkCircleOutline,
          handler: () => {
            (async () => {
              await dispatch(modRemoveComment(comment.id, false));

              presentToast(commentApproved);
            })();
          },
        },
        {
          text: "Remove",
          icon: trashOutline,
          handler: () => {
            (async () => {
              await dispatch(modRemoveComment(comment.id, true));

              presentToast(commentRemoved);
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
                { text: "Cancel", role: "cancel" },
              ],
            );
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ].filter(notEmpty),
    });
  }

  return { present, loading };
}
