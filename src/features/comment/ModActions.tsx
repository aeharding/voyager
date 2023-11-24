import {
  IonIcon,
  IonLoading,
  useIonActionSheet,
  useIonAlert,
} from "@ionic/react";
import {
  checkmarkCircleOutline,
  colorWandOutline,
  shieldCheckmark,
  shieldCheckmarkOutline,
  trashOutline,
} from "ionicons/icons";
import { notEmpty } from "../../helpers/array";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  modDistinguishComment,
  modNukeCommentChain,
  modRemoveComment,
} from "./commentSlice";
import { useState } from "react";
import styled from "@emotion/styled";
import { Comment, CommentAggregates } from "lemmy-js-client";
import { localUserSelector } from "../auth/authSlice";
import useAppToast from "../../helpers/useAppToast";
import {
  commentApproved,
  commentDistinguished,
  commentRemoved,
} from "../../helpers/toastMessages";
import {
  ModeratorRole,
  getModColor,
  getModIcon,
} from "../moderation/useCanModerate";

interface ModActionsProps {
  comment: Comment;
  counts: CommentAggregates;
  role: ModeratorRole;
}

export default function ModActions({ comment, counts, role }: ModActionsProps) {
  const [presentAlert] = useIonAlert();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const localUser = useAppSelector(localUserSelector);
  const [presentActionSheet] = useIonActionSheet();
  const presentToast = useAppToast();

  const isSelf = comment.creator_id === localUser?.person_id;

  return (
    <>
      <IonIcon
        icon={getModIcon(role, true)}
        color={getModColor(role)}
        onClick={(e) => {
          e.stopPropagation();

          presentActionSheet({
            cssClass: `${role} left-align-buttons`,
            buttons: [
              isSelf
                ? {
                    text: !comment.distinguished
                      ? "Distinguish"
                      : "Undistinguish",
                    icon: shieldCheckmarkOutline,
                    handler: () => {
                      (async () => {
                        await dispatch(
                          modDistinguishComment(
                            comment.id,
                            !comment.distinguished,
                          ),
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
                      counts.child_count + 1
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
        }}
      />

      <IonLoading isOpen={loading} message="Nuking..." />
    </>
  );
}
