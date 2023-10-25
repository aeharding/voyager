import {
  IonIcon,
  IonLoading,
  useIonActionSheet,
  useIonAlert,
} from "@ionic/react";
import {
  checkmarkCircleOutline,
  colorWandOutline,
  shield,
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

const ModIonIcon = styled(IonIcon)`
  color: var(--ion-color-success);
`;

interface ModActionsProps {
  comment: Comment;
  counts: CommentAggregates;
}

export default function ModActions({ comment, counts }: ModActionsProps) {
  const [presentAlert] = useIonAlert();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const localUser = useAppSelector(localUserSelector);
  const [presentActionSheet] = useIonActionSheet();

  const isSelf = comment.creator_id === localUser?.person_id;

  return (
    <>
      <ModIonIcon
        icon={shield}
        onClick={(e) => {
          e.stopPropagation();

          presentActionSheet({
            cssClass: "left-align-buttons mod",
            buttons: [
              isSelf
                ? {
                    text: !comment.distinguished
                      ? "Distinguish"
                      : "Undistinguish",
                    icon: shieldCheckmarkOutline,
                    handler: () => {
                      dispatch(
                        modDistinguishComment(
                          comment.id,
                          !comment.distinguished,
                        ),
                      );
                    },
                  }
                : undefined,
              {
                text: "Approve",
                icon: checkmarkCircleOutline,
                handler: () => {
                  dispatch(modRemoveComment(comment.id, false));
                },
              },
              {
                text: "Remove",
                icon: trashOutline,
                handler: () => {
                  dispatch(modRemoveComment(comment.id, true));
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
              },
            ].filter(notEmpty),
          });
        }}
      />

      <IonLoading isOpen={loading} message="Nuking..." />
    </>
  );
}
