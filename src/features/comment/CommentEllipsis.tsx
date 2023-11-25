import styled from "@emotion/styled";
import {
  ActionSheetOptions,
  IonIcon,
  IonLoading,
  useIonActionSheet,
  useIonRouter,
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
import {
  CommentReplyView,
  CommentView,
  PersonMentionView,
} from "lemmy-js-client";
import { useContext } from "react";
import { notEmpty } from "../../helpers/array";
import {
  getHandle,
  getRemoteHandle,
  canModify as isCommentMutable,
  share,
} from "../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import {
  postLocked,
  saveError,
  saveSuccess,
  voteError,
} from "../../helpers/toastMessages";
import { useAppDispatch, useAppSelector } from "../../store";
import { PageContext } from "../auth/PageContext";
import { handleSelector, isDownvoteEnabledSelector } from "../auth/authSlice";
import { CommentsContext } from "./CommentsContext";
import { deleteComment, saveComment, voteOnComment } from "./commentSlice";
import useCollapseRootComment from "./useCollapseRootComment";
import useAppToast from "../../helpers/useAppToast";
import { ModeratorRole, getModIcon } from "../moderation/useCanModerate";
import useCommentModActions from "../moderation/useCommentModActions";

const StyledIonIcon = styled(IonIcon)`
  padding: 8px 12px 8px 6px;
  margin: -8px -12px -8px -6px;

  font-size: 1.2em;
`;

interface MoreActionsProps {
  comment: CommentView | PersonMentionView | CommentReplyView;
  rootIndex: number | undefined;
  appendActions?: ActionSheetOptions["buttons"];
  canModerate: ModeratorRole | undefined;
}

export default function MoreActions({
  comment: commentView,
  rootIndex,
  appendActions,
  canModerate,
}: MoreActionsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const { prependComments } = useContext(CommentsContext);
  const myHandle = useAppSelector(handleSelector);
  const presentToast = useAppToast();
  const [presentActionSheet] = useIonActionSheet();
  const [presentSecondaryActionSheet] = useIonActionSheet();
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
    (state) => state.comment.commentVotesById,
  );
  const commentSavedById = useAppSelector(
    (state) => state.comment.commentSavedById,
  );

  const myVote = commentVotesById[comment.id] ?? commentView.my_vote;
  const mySaved = commentSavedById[comment.id] ?? commentView.saved;

  const downvoteAllowed = useAppSelector(isDownvoteEnabledSelector);
  const isMyComment = getRemoteHandle(commentView.creator) === myHandle;
  const commentExists = !comment.deleted && !comment.removed;

  const { loading, present: presentCommentModActions } =
    useCommentModActions(commentView);

  function onClick() {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: [
        canModerate
          ? {
              cssClass: `${canModerate} detail`,
              text: "Moderator",
              icon: getModIcon(canModerate),
              handler: presentCommentModActions,
            }
          : undefined,
        ...(appendActions || []),
        {
          text: myVote !== 1 ? "Upvote" : "Undo Upvote",
          icon: arrowUpOutline,
          handler: () => {
            (async () => {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(voteOnComment(comment.id, myVote === 1 ? 0 : 1));
              } catch (error) {
                presentToast(voteError);
              }
            })();
          },
        },
        downvoteAllowed
          ? {
              text: myVote !== -1 ? "Downvote" : "Undo Downvote",
              icon: arrowDownOutline,
              handler: () => {
                (async () => {
                  if (presentLoginIfNeeded()) return;

                  try {
                    await dispatch(
                      voteOnComment(comment.id, myVote === -1 ? 0 : -1),
                    );
                  } catch (error) {
                    presentToast(voteError);
                  }
                })();
              },
            }
          : undefined,
        {
          text: !mySaved ? "Save" : "Unsave",
          icon: bookmarkOutline,
          handler: () => {
            (async () => {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(saveComment(comment.id, !mySaved));

                if (!mySaved) presentToast(saveSuccess);
              } catch (error) {
                presentToast(saveError);
              }
            })();
          },
        },
        isMyComment && isCommentMutable(comment)
          ? {
              text: "Edit",
              icon: pencilOutline,
              handler: () => {
                presentCommentEdit(comment);
              },
            }
          : undefined,
        isMyComment && isCommentMutable(comment)
          ? {
              text: "Delete",
              icon: trashOutline,
              handler: () => {
                presentSecondaryActionSheet({
                  buttons: [
                    {
                      text: "Delete Comment",
                      role: "destructive",
                      handler: () => {
                        (async () => {
                          try {
                            await dispatch(deleteComment(comment.id));
                          } catch (error) {
                            presentToast({
                              message:
                                "Problem deleting comment. Please try again.",
                              color: "danger",
                            });

                            throw error;
                          }

                          presentToast({
                            message: "Comment deleted!",
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
              },
            }
          : undefined,
        {
          text: "Reply",
          icon: arrowUndoOutline,
          handler: () => {
            (async () => {
              if (presentLoginIfNeeded()) return;
              if (commentView.post.locked) {
                presentToast(postLocked);
                return;
              }

              const reply = await presentCommentReply(commentView);

              if (reply) prependComments([reply]);
            })();
          },
        },
        commentExists && comment.content
          ? {
              text: "Select Text",
              icon: textOutline,
              handler: () => {
                presentSelectText(comment.content);
              },
            }
          : undefined,
        {
          text: getHandle(commentView.creator),
          icon: personOutline,
          handler: () => {
            router.push(
              buildGeneralBrowseLink(`/u/${getHandle(commentView.creator)}`),
            );
          },
        },
        {
          text: "Share",
          icon: shareOutline,
          handler: () => {
            share(comment);
          },
        },
        rootIndex !== undefined
          ? {
              text: "Collapse to Top",
              icon: chevronCollapseOutline,
              handler: () => {
                collapseRootComment();
              },
            }
          : undefined,
        {
          text: "Report",
          role: "report",
          icon: flagOutline,
          handler: () => {
            presentReport(commentView);
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ].filter(notEmpty),
    });
  }

  return (
    <>
      <IonLoading isOpen={loading} />
      <StyledIonIcon
        icon={ellipsisHorizontal}
        onClick={(e) => {
          onClick();
          e.stopPropagation();
        }}
      />
    </>
  );
}
