import styled from "@emotion/styled";
import {
  IonActionSheet,
  IonIcon,
  useIonActionSheet,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import {
  arrowDownOutline,
  arrowUndoOutline,
  arrowUpOutline,
  bookmarkOutline,
  chevronCollapseOutline,
  ellipsisHorizontal,
  flagOutline,
  pencilOutline,
  personOutline,
  shareOutline,
  textOutline,
  trashOutline,
} from "ionicons/icons";
import { CommentView } from "lemmy-js-client";
import { useContext, useState } from "react";
import { notEmpty } from "../../helpers/array";
import {
  getHandle,
  getRemoteHandle,
  canModify as isCommentMutable,
  share,
} from "../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { saveError, voteError } from "../../helpers/toastMessages";
import { useAppDispatch, useAppSelector } from "../../store";
import { PageContext } from "../auth/PageContext";
import { handleSelector, isDownvoteEnabledSelector } from "../auth/authSlice";
import { CommentsContext } from "./CommentsContext";
import { deleteComment, saveComment, voteOnComment } from "./commentSlice";
import useCollapseRootComment from "./useCollapseRootComment";

const StyledIonIcon = styled(IonIcon)`
  padding: 8px 12px;
  margin: -8px -12px;

  font-size: 1.2em;
`;

interface MoreActionsProps {
  comment: CommentView;
  rootIndex: number | undefined;
}

export default function MoreActions({
  comment: commentView,
  rootIndex,
}: MoreActionsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const { prependComments } = useContext(CommentsContext);
  const myHandle = useAppSelector(handleSelector);
  const [present] = useIonToast();
  const [presentActionSheet] = useIonActionSheet();
  const collapseRootComment = useCollapseRootComment(commentView, rootIndex);

  const commentById = useAppSelector((state) => state.comment.commentById);

  const router = useIonRouter();

  // Comment from slice might be more up to date, e.g. edits
  const comment = commentById[commentView.comment.id] ?? commentView.comment;

  const {
    presentLoginIfNeeded,
    presentCommentReply,
    presentCommentEdit,
    presentReport,
    presentSelectText,
  } = useContext(PageContext);

  const commentVotesById = useAppSelector(
    (state) => state.comment.commentVotesById
  );
  const commentSavedById = useAppSelector(
    (state) => state.comment.commentSavedById
  );

  const myVote = commentVotesById[comment.id] ?? commentView.my_vote;
  const mySaved = commentSavedById[comment.id] ?? commentView.saved;

  const downvoteAllowed = useAppSelector(isDownvoteEnabledSelector);
  const isMyComment = getRemoteHandle(commentView.creator) === myHandle;
  const commentExists = !comment.deleted && !comment.removed;

  return (
    <>
      <StyledIonIcon
        icon={ellipsisHorizontal}
        onClick={(e) => {
          setOpen(true);
          e.stopPropagation();
        }}
      />

      <IonActionSheet
        cssClass="left-align-buttons"
        onClick={(e) => e.stopPropagation()}
        isOpen={open}
        buttons={[
          {
            text: myVote !== 1 ? "Upvote" : "Undo Upvote",
            role: "upvote",
            icon: arrowUpOutline,
          },
          downvoteAllowed
            ? {
                text: myVote !== -1 ? "Downvote" : "Undo Downvote",
                role: "downvote",
                icon: arrowDownOutline,
              }
            : undefined,
          {
            text: !mySaved ? "Save" : "Unsave",
            role: "save",
            icon: bookmarkOutline,
          },
          isMyComment && isCommentMutable(comment)
            ? {
                text: "Edit",
                role: "edit",
                icon: pencilOutline,
              }
            : undefined,
          isMyComment && isCommentMutable(comment)
            ? {
                text: "Delete",
                role: "delete",
                icon: trashOutline,
              }
            : undefined,
          {
            text: "Reply",
            role: "reply",
            icon: arrowUndoOutline,
          },
          commentExists && comment.content
            ? {
                text: "Select Text",
                role: "select-text",
                icon: textOutline,
              }
            : undefined,
          {
            text: getHandle(commentView.creator),
            role: "person",
            icon: personOutline,
          },
          {
            text: "Share",
            role: "share",
            icon: shareOutline,
          },
          rootIndex !== undefined
            ? {
                text: "Collapse to Top",
                role: "collapse",
                icon: chevronCollapseOutline,
              }
            : undefined,
          {
            text: "Report",
            role: "report",
            icon: flagOutline,
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ].filter(notEmpty)}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={async (e) => {
          switch (e.detail.role) {
            case "upvote":
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(voteOnComment(comment.id, myVote === 1 ? 0 : 1));
              } catch (error) {
                present(voteError);
              }

              break;
            case "downvote":
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(
                  voteOnComment(comment.id, myVote === -1 ? 0 : -1)
                );
              } catch (error) {
                present(voteError);
              }

              break;
            case "save":
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(saveComment(comment.id, !mySaved));
              } catch (error) {
                present(saveError);
              }
              break;
            case "edit": {
              presentCommentEdit(comment);
              break;
            }
            case "delete":
              presentActionSheet({
                buttons: [
                  {
                    text: "Delete Comment",
                    role: "destructive",
                    handler: () => {
                      (async () => {
                        try {
                          await dispatch(deleteComment(comment.id));
                        } catch (error) {
                          present({
                            message:
                              "Problem deleting comment. Please try again.",
                            duration: 3500,
                            position: "bottom",
                            color: "danger",
                          });

                          throw error;
                        }

                        present({
                          message: "Comment deleted!",
                          duration: 3500,
                          position: "bottom",
                          color: "primary",
                        });
                      })();
                    },
                  },
                  {
                    text: "Cancel",
                    role: "cancel",
                  },
                ],
              });

              break;
            case "reply": {
              if (presentLoginIfNeeded()) return;

              const reply = await presentCommentReply(commentView);

              if (reply) prependComments([reply]);
              break;
            }
            case "select-text":
              return presentSelectText(comment.content);
            case "person":
              router.push(
                buildGeneralBrowseLink(`/u/${getHandle(commentView.creator)}`)
              );
              break;
            case "share":
              share(comment);
              break;
            case "collapse":
              collapseRootComment();
              break;
            case "report":
              presentReport(commentView);
              break;
          }
        }}
      />
    </>
  );
}
