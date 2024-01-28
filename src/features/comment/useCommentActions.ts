import { ActionSheetOptions, useIonActionSheet } from "@ionic/react";
import {
  arrowDownOutline,
  arrowUndoOutline,
  arrowUpOutline,
  bookmarkOutline,
  cameraOutline,
  chevronCollapseOutline,
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
import { useCallback, useContext } from "react";
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
import { userHandleSelector } from "../auth/authSelectors";
import { CommentsContext } from "./CommentsContext";
import { deleteComment, saveComment, voteOnComment } from "./commentSlice";
import useCollapseRootComment from "./useCollapseRootComment";
import useAppToast from "../../helpers/useAppToast";
import { ModeratorRole, getModIcon } from "../moderation/useCanModerate";
import useCommentModActions from "../moderation/useCommentModActions";
import { useOptimizedIonRouter } from "../../helpers/useOptimizedIonRouter";
import { isDownvoteEnabledSelector } from "../auth/siteSlice";
import { compact } from "lodash";

export interface CommentActionsProps {
  comment: CommentView | PersonMentionView | CommentReplyView;
  rootIndex: number | undefined;
  appendActions?: ActionSheetOptions["buttons"];
  canModerate: ModeratorRole | undefined;
}

export default function useCommentActions({
  comment: commentView,
  rootIndex,
  appendActions,
  canModerate,
}: CommentActionsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const { prependComments, getComments } = useContext(CommentsContext);
  const myHandle = useAppSelector(userHandleSelector);
  const presentToast = useAppToast();
  const [presentActionSheet] = useIonActionSheet();
  const [presentSecondaryActionSheet] = useIonActionSheet();
  const collapseRootComment = useCollapseRootComment(commentView, rootIndex);

  const post = useAppSelector(
    (state) => state.post.postById[commentView.post.id],
  );

  const commentById = useAppSelector((state) => state.comment.commentById);

  const router = useOptimizedIonRouter();

  // Comment from slice might be more up to date, e.g. edits
  const comment = commentById[commentView.comment.id] ?? commentView.comment;

  const {
    presentLoginIfNeeded,
    presentCommentReply,
    presentCommentEdit,
    presentReport,
    presentSelectText,
    presentShareAsImage,
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

  const present = useCallback(() => {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: compact([
        canModerate && {
          cssClass: `${canModerate} detail`,
          text: "Moderator",
          icon: getModIcon(canModerate),
          handler: presentCommentModActions,
        },
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
        rootIndex !== undefined && {
          text: "Share as image...",
          icon: cameraOutline,
          handler: () => {
            const comments = getComments();

            if (!comments || !post || post === "not-found") return;

            presentShareAsImage(post, commentView, comments);
          },
        },
        rootIndex !== undefined && {
          text: "Collapse to Top",
          icon: chevronCollapseOutline,
          handler: () => {
            collapseRootComment();
          },
        },
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
      ]),
    });
  }, [
    appendActions,
    buildGeneralBrowseLink,
    canModerate,
    collapseRootComment,
    comment,
    commentExists,
    commentView,
    dispatch,
    downvoteAllowed,
    getComments,
    isMyComment,
    mySaved,
    myVote,
    post,
    prependComments,
    presentActionSheet,
    presentCommentEdit,
    presentCommentModActions,
    presentCommentReply,
    presentLoginIfNeeded,
    presentReport,
    presentSecondaryActionSheet,
    presentSelectText,
    presentShareAsImage,
    presentToast,
    rootIndex,
    router,
  ]);

  return { loading, present };
}
