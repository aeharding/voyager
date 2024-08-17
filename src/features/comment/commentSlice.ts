import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import { clientSelector } from "../auth/authSelectors";
import { Comment, CommentView } from "lemmy-js-client";
import { resolveCommentReport } from "../moderation/modSlice";

interface CommentState {
  commentCollapsedById: Record<string, boolean>;
  commentVotesById: Record<string, 1 | -1 | 0 | undefined>;
  commentSavedById: Record<string, boolean | undefined>;
  commentById: Record<string, Comment>;
}

const initialState: CommentState = {
  commentCollapsedById: {},
  commentVotesById: {},
  commentSavedById: {},
  /**
   * surgical changes received after user edits or deletes comment
   */
  commentById: {},
};

export const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    receivedComments: (state, action: PayloadAction<CommentView[]>) => {
      for (const comment of action.payload) {
        // If the store has a mutated copy (e.g. user edit, delete) and later we get a change, update
        // We do this a bit surgically so we're not throwing every comment ever fetched in the store.
        if (state.commentById[comment.comment.id])
          state.commentById[comment.comment.id] = comment.comment;

        if (comment.my_vote)
          state.commentVotesById[comment.comment.id] = comment.my_vote as
            | 1
            | -1;

        if (comment.saved) {
          state.commentSavedById[comment.comment.id] = comment.saved;
        }
      }
    },

    // For edits and deletes
    mutatedComment: (state, action: PayloadAction<CommentView>) => {
      const comment = action.payload;
      state.commentById[comment.comment.id] = comment.comment;

      if (comment.my_vote)
        state.commentVotesById[comment.comment.id] = comment.my_vote as 1 | -1;
    },
    toggleCommentCollapseState: (state, action: PayloadAction<number>) => {
      state.commentCollapsedById[action.payload] =
        !state.commentCollapsedById[action.payload];
    },
    updateCommentVote: (
      state,
      action: PayloadAction<{
        commentId: number;
        vote: -1 | 1 | 0 | undefined;
      }>,
    ) => {
      state.commentVotesById[action.payload.commentId] = action.payload.vote;
    },
    updateCommentSaved: (
      state,
      action: PayloadAction<{ commentId: number; saved: boolean | undefined }>,
    ) => {
      state.commentSavedById[action.payload.commentId] = action.payload.saved;
    },
    resetComments: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  receivedComments,
  mutatedComment,
  toggleCommentCollapseState,
  updateCommentVote,
  updateCommentSaved,
  resetComments,
} = commentSlice.actions;

export default commentSlice.reducer;

export const voteOnComment =
  (commentId: number, vote: 1 | -1 | 0) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const oldVote = getState().comment.commentVotesById[commentId];

    dispatch(updateCommentVote({ commentId, vote }));

    try {
      await clientSelector(getState())?.likeComment({
        comment_id: commentId,
        score: vote,
      });
    } catch (error) {
      dispatch(updateCommentVote({ commentId, vote: oldVote }));

      throw error;
    }
  };

export const saveComment =
  (commentId: number, save: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const oldSaved = getState().comment.commentSavedById[commentId];

    dispatch(updateCommentSaved({ commentId, saved: save }));

    try {
      await clientSelector(getState())?.saveComment({
        comment_id: commentId,
        save,
      });
    } catch (error) {
      dispatch(updateCommentSaved({ commentId, saved: oldSaved }));

      throw error;
    }
  };

export const deleteComment =
  (commentId: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const response = await clientSelector(getState())?.deleteComment({
      comment_id: commentId,
      deleted: true,
    });

    dispatch(mutatedComment(response.comment_view));
  };

export const editComment =
  (commentId: number, content: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const response = await clientSelector(getState())?.editComment({
      comment_id: commentId,
      content,
    });

    dispatch(mutatedComment(response.comment_view));

    return response.comment_view;
  };

export const modRemoveComment =
  (commentId: number, removed: boolean, reason?: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const response = await clientSelector(getState())?.removeComment({
      comment_id: commentId,
      removed,
      reason,
    });

    dispatch(mutatedComment(response.comment_view));
    await dispatch(resolveCommentReport(commentId));
  };

export const modNukeCommentChain =
  (commentId: number, reason?: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const client = clientSelector(getState());

    if (!client) throw new Error("Not authorized");

    const { comments } = await client.getComments({
      parent_id: commentId,
      max_depth: 100,
    });

    const commentIds = comments
      .filter((c) => !c.creator_is_moderator && !c.creator_is_admin)
      .map((c) => c.comment.id);

    await Promise.all(
      commentIds.map(async (commentId) => {
        const comment = await client.removeComment({
          comment_id: commentId,
          removed: true,
          reason,
        });

        dispatch(mutatedComment(comment.comment_view));
        await dispatch(resolveCommentReport(commentId));
      }),
    );
  };

export const modDistinguishComment =
  (commentId: number, distinguished: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const response = await clientSelector(getState())?.distinguishComment({
      comment_id: commentId,
      distinguished,
    });

    dispatch(mutatedComment(response.comment_view));
  };
