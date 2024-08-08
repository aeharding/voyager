import { ComponentProps, useCallback, useContext, useMemo } from "react";
import type { BaseSlidingVote } from "../../BaseSliding";
import { PageContext } from "../../../../auth/PageContext";
import { CommentsContext } from "../../../../comment/inTree/CommentsContext";
import { AppContext } from "../../../../auth/AppContext";
import useAppToast from "../../../../../helpers/useAppToast";
import store, { useAppDispatch, useAppSelector } from "../../../../../store";
import { isInboxItem, useSharedVoteActions } from "../shared";
import GenericBaseSliding, {
  GenericBaseSlidingProps,
} from "../GenericBaseSliding";
import { markRead } from "../../../../inbox/inboxSlice";
import { savePost, voteOnPost } from "../../../../post/postSlice";
import {
  saveComment,
  toggleCommentCollapseState,
  voteOnComment,
} from "../../../../comment/commentSlice";
import { getVoteErrorMessage } from "../../../../../helpers/lemmyErrors";
import { getCanModerate } from "../../../../moderation/useCanModerate";
import { isStubComment } from "../../../../comment/CommentHeader";
import {
  postLocked,
  replyStubError,
  saveSuccess,
} from "../../../../../helpers/toastMessages";
import useCollapseRootComment from "../../../../comment/inTree/useCollapseRootComment";
import { scrollCommentIntoViewIfNeeded } from "../../../../comment/inTree/CommentTree";
import { share } from "../../../../../helpers/lemmy";

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

  const shared = useSharedVoteActions(item);

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
        if (isPost) await dispatch(voteOnPost(item.post.id, score));
        else await dispatch(voteOnComment(item.comment.id, score));
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

  const { id, isSaved } = useMemo(() => {
    if (isPost) {
      const id = item.post.id;
      return { id: id, isSaved: postSavedById[id] };
    } else {
      const id = item.comment.id;
      return { id: id, isSaved: commentSavedById[id] };
    }
  }, [item, isPost, postSavedById, commentSavedById]);

  const save = useCallback(async () => {
    if (presentLoginIfNeeded()) return;
    try {
      await dispatch((isPost ? savePost : saveComment)(id, !isSaved));

      if (!isSaved) presentToast(saveSuccess);
    } catch (error) {
      presentToast({
        message: "Failed to mark item as saved",
        color: "danger",
      });
      throw error;
    }
  }, [presentLoginIfNeeded, dispatch, isPost, id, isSaved, presentToast]);

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

  const shareTrigger = useCallback(async () => {
    share(isPost ? item.post : item.comment);
  }, [isPost, item]);

  return (
    <GenericBaseSliding
      shareTrigger={shareTrigger}
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
