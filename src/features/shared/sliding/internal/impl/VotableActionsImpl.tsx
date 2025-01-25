import { CommentView, PostView } from "lemmy-js-client";
import { ComponentProps, useCallback, useContext, useMemo } from "react";

import { AppContext } from "#/features/auth/AppContext";
import { PageContext } from "#/features/auth/PageContext";
import { isStubComment } from "#/features/comment/CommentHeader";
import {
  saveComment,
  toggleCommentCollapseState,
  voteOnComment,
} from "#/features/comment/commentSlice";
import { CommentsContext } from "#/features/comment/inTree/CommentsContext";
import { scrollCommentIntoViewIfNeeded } from "#/features/comment/inTree/CommentTree";
import useCollapseRootComment from "#/features/comment/inTree/useCollapseRootComment";
import { markRead } from "#/features/inbox/inboxSlice";
import { getCanModerate } from "#/features/moderation/useCanModerate";
import { savePost, voteOnPost } from "#/features/post/postSlice";
import {
  isInboxItem,
  useSharedInboxActions,
} from "#/features/shared/sliding/internal/shared";
import { useSharePostComment } from "#/features/shared/useSharePostComment";
import { getVoteErrorMessage } from "#/helpers/lemmyErrors";
import {
  postLocked,
  replyStubError,
  saveSuccess,
} from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import store, { useAppDispatch, useAppSelector } from "#/store";

import type { BaseSlidingVote } from "../../BaseSliding";
import GenericBaseSliding, {
  GenericBaseSlidingProps,
} from "../GenericBaseSliding";

export function VotableActionsImpl({
  item,
  rootIndex,
  ...rest
}: ComponentProps<typeof BaseSlidingVote>) {
  const { presentLoginIfNeeded, presentCommentReply } = useContext(PageContext);
  const { prependComments } = useContext(CommentsContext);

  const { activePageRef } = useContext(AppContext);

  const presentToast = useAppToast();
  const dispatch = useAppDispatch();

  const shared = useSharedInboxActions(item);
  const { share } = useSharePostComment(item);

  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const commentVotesById = useAppSelector(
    (state) => state.comment.commentVotesById,
  );
  const typedMyVote = item.my_vote as 1 | -1 | 0 | undefined;
  const isPost = "unread_comments" in item;
  const currentVote = isPost
    ? (postVotesById[item.post.id] ?? typedMyVote)
    : (commentVotesById[item.comment.id] ?? typedMyVote);

  const postSavedById = useAppSelector((state) => state.post.postSavedById);
  const commentSavedById = useAppSelector(
    (state) => state.comment.commentSavedById,
  );

  const isHidden = useAppSelector(
    (state) => state.post.postHiddenById[item.post?.id]?.hidden,
  );

  const onVote: GenericBaseSlidingProps["onVote"] = useCallback(
    async (score) => {
      if (presentLoginIfNeeded()) return;

      if (isInboxItem(item)) dispatch(markRead(item, true));

      try {
        if (isPost) await dispatch(voteOnPost(item, score));
        else await dispatch(voteOnComment(item, score));
      } catch (error) {
        presentToast({
          color: "danger",
          message: getVoteErrorMessage(error),
        });

        throw error;
      }
    },
    [presentLoginIfNeeded, isPost, dispatch, item, presentToast],
  );

  const reply: GenericBaseSlidingProps["reply"] = useCallback(async () => {
    if (presentLoginIfNeeded()) return;

    if (isInboxItem(item)) dispatch(markRead(item, true));

    const canModerate = getCanModerate(item.community);

    // Prevent replying to a comment that's been deleted, or removed by mod (if you're not a mod)
    if (!isPost) {
      const comment =
        store.getState().comment.commentById[item.comment.id] ?? item.comment;

      const stub = isStubComment(comment, canModerate);

      if (stub) {
        presentToast(replyStubError);
        return;
      }
    }

    if (item.post.locked && !canModerate) {
      presentToast(postLocked);
      return;
    }

    const reply = await presentCommentReply(item);
    if (!isPost && reply) prependComments([reply]);
  }, [
    item,
    isPost,
    presentCommentReply,
    presentLoginIfNeeded,
    prependComments,
    presentToast,
    dispatch,
  ]);

  const isSaved = useMemo(() => {
    if (isPost) {
      const id = item.post.id;
      return postSavedById[id];
    } else {
      const id = item.comment.id;
      return commentSavedById[id];
    }
  }, [item, isPost, postSavedById, commentSavedById]);

  const save = useCallback(async () => {
    if (presentLoginIfNeeded()) return;
    try {
      await dispatch(
        (isPost ? savePost : saveComment)(
          item as PostView & CommentView,
          !isSaved,
        ),
      );

      if (!isSaved) presentToast(saveSuccess);
    } catch (error) {
      presentToast({
        message: "Failed to mark item as saved",
        color: "danger",
      });
      throw error;
    }
  }, [presentLoginIfNeeded, dispatch, isPost, item, isSaved, presentToast]);

  const collapseRootComment = useCollapseRootComment(
    !isPost ? item : undefined,
    rootIndex,
  );

  const collapse = useCallback(
    (e: TouchEvent | MouseEvent) => {
      if (isPost) return;

      dispatch(toggleCommentCollapseState(item.comment.id));

      if (e.target) scrollCommentIntoViewIfNeeded(e.target, activePageRef);
    },
    [dispatch, isPost, item, activePageRef],
  );

  return (
    <GenericBaseSliding
      shareTrigger={share}
      collapse={collapse}
      collapseRootComment={collapseRootComment}
      save={save}
      reply={reply}
      currentVote={currentVote}
      onVote={onVote}
      isHidden={isHidden}
      isSaved={isSaved}
      {...shared}
      {...rest}
    />
  );
}
