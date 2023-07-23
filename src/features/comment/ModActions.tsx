import { IonActionSheet, IonIcon, IonLoading, useIonAlert } from "@ionic/react";
import {
  checkmarkCircleOutline,
  colorWandOutline,
  personRemoveOutline,
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
  const [present] = useIonAlert();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const localUser = useAppSelector(localUserSelector);

  const isSelf = comment.creator_id === localUser?.person_id;

  return (
    <>
      <ModIonIcon
        icon={shield}
        onClick={(e) => {
          setOpen(true);
          e.stopPropagation();
        }}
      />

      <IonLoading isOpen={loading} message="Nuking..." />

      <IonActionSheet
        cssClass="left-align-buttons mod"
        onClick={(e) => e.stopPropagation()}
        isOpen={open}
        buttons={[
          isSelf
            ? {
                text: !comment.distinguished ? "Distinguish" : "Undistinguish",
                data: "distinguish",
                icon: shieldCheckmarkOutline,
              }
            : undefined,
          {
            text: "Approve",
            data: "approve",
            icon: checkmarkCircleOutline,
          },
          {
            text: "Remove",
            data: "remove",
            icon: trashOutline,
          },
          {
            text: "Comment Nuke",
            data: "nuke",
            icon: colorWandOutline,
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ].filter(notEmpty)}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={async (e) => {
          switch (e.detail.data) {
            case "distinguish":
              dispatch(
                modDistinguishComment(comment.id, !comment.distinguished)
              );
              break;
            case "approve":
              dispatch(modRemoveComment(comment.id, false));

              break;
            case "remove":
              dispatch(modRemoveComment(comment.id, true));

              break;
            case "nuke":
              present(
                `Remove ${counts.child_count + 1} comments in comment chain?`,
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
                ]
              );
          }
        }}
      />
    </>
  );
}
