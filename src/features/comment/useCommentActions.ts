import { ActionSheetOptions, useIonActionSheet } from "@ionic/react";
import { compact } from "es-toolkit";
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
  textOutline,
  trashOutline,
} from "ionicons/icons";
import {
  CommentReplyView,
  CommentView,
  PersonMentionView,
} from "lemmy-js-client";
import { useCallback, useContext, useMemo } from "react";

import { userHandleSelector } from "#/features/auth/authSelectors";
import { PageContext } from "#/features/auth/PageContext";
import { isDownvoteEnabledSelector } from "#/features/auth/siteSlice";
import {
  getCanModerate,
  getModIcon,
} from "#/features/moderation/useCanModerate";
import useCommentModActions from "#/features/moderation/useCommentModActions";
import { useSharePostComment } from "#/features/shared/useSharePostComment";
import { getShareIcon } from "#/helpers/device";
import {
  getHandle,
  getRemoteHandle,
  canModify as isCommentMutable,
} from "#/helpers/lemmy";
import { getVoteErrorMessage } from "#/helpers/lemmyErrors";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import {
  commentDeleted,
  commentDeleteFailed,
  postLocked,
  saveError,
  saveSuccess,
} from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import store, { useAppDispatch } from "#/store";

import { isStubComment } from "./CommentHeader";
import { deleteComment, saveComment, voteOnComment } from "./commentSlice";
import { CommentsContext } from "./inTree/CommentsContext";
import useCollapseRootComment from "./inTree/useCollapseRootComment";

export interface CommentActionsProps {
  comment: CommentView | PersonMentionView | CommentReplyView;
  rootIndex: number | undefined;
  appendActions?: ActionSheetOptions["buttons"];
}

export default function useCommentActions({
  comment: commentView,
  rootIndex,
  appendActions,
}: CommentActionsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const { prependComments, getComments } = useContext(CommentsContext);
  const presentToast = useAppToast();
  const [presentActionSheet] = useIonActionSheet();
  const [presentSecondaryActionSheet] = useIonActionSheet();
  const collapseRootComment = useCollapseRootComment(commentView, rootIndex);
  const { share } = useSharePostComment(commentView);

  const router = useOptimizedIonRouter();

  const {
    presentLoginIfNeeded,
    presentCommentReply,
    presentCommentEdit,
    presentReport,
    presentSelectText,
    presentShareAsImage,
  } = useContext(PageContext);

  const { loading, present: presentCommentModActions } =
    useCommentModActions(commentView);

  // Do all logic sync in present() so it doesn't slow down initial render
  const present = useCallback(() => {
    const state = store.getState();

    const myHandle = userHandleSelector(state);

    const commentVotesById = state.comment.commentVotesById;
    const commentSavedById = state.comment.commentSavedById;

    const commentById = state.comment.commentById;

    // Comment from slice might be more up to date, e.g. edits
    const comment = commentById[commentView.comment.id] ?? commentView.comment;

    const myVote = commentVotesById[comment.id] ?? commentView.my_vote;
    const mySaved = commentSavedById[comment.id] ?? commentView.saved;

    const downvoteAllowed = isDownvoteEnabledSelector(state);
    const isMyComment = getRemoteHandle(commentView.creator) === myHandle;

    const post = state.post.postById[commentView.post.id];

    const canModerate = getCanModerate(commentView.community);

    const stub = isStubComment(comment, canModerate);

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
                await dispatch(
                  voteOnComment(commentView, myVote === 1 ? 0 : 1),
                );
              } catch (error) {
                presentToast({
                  color: "danger",
                  message: getVoteErrorMessage(error),
                });

                throw error;
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
                      voteOnComment(commentView, myVote === -1 ? 0 : -1),
                    );
                  } catch (error) {
                    presentToast({
                      color: "danger",
                      message: getVoteErrorMessage(error),
                    });

                    throw error;
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
                await dispatch(saveComment(commentView, !mySaved));

                if (!mySaved) presentToast(saveSuccess);
              } catch (error) {
                presentToast(saveError);
                throw error;
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
                            presentToast(commentDeleteFailed);

                            throw error;
                          }

                          presentToast(commentDeleted);
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
        !stub && {
          text: "Reply",
          icon: arrowUndoOutline,
          handler: () => {
            (async () => {
              if (presentLoginIfNeeded()) return;
              if (commentView.post.locked && !canModerate) {
                presentToast(postLocked);
                return;
              }

              const reply = await presentCommentReply(commentView);

              if (reply) prependComments([reply]);
            })();
          },
        },
        !stub &&
          comment.content && {
            text: "Select Text",
            icon: textOutline,
            handler: () => {
              presentSelectText(comment.content);
            },
          },
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
          icon: getShareIcon(),
          handler: () => {
            share();
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
    collapseRootComment,
    commentView,
    dispatch,
    getComments,
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
    share,
  ]);

  return useMemo(() => ({ loading, present }), [loading, present]);
}
