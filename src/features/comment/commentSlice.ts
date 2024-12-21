import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Comment, CommentView } from "lemmy-js-client";

import { clientSelector } from "#/features/auth/authSelectors";
import { resolveCommentReport } from "#/features/moderation/modSlice";
import {
  fetchTagsForHandles,
  updateTagVotes,
} from "#/features/tags/userTagSlice";
import { getRemoteHandle } from "#/helpers/lemmy";
import { AppDispatch, RootState } from "#/store";

export const LOADING_CONTENT = -1;

interface CommentState {
  commentCollapsedById: Record<string, boolean>;
  commentVotesById: Record<string, 1 | -1 | 0 | undefined>;
  commentSavedById: Record<string, boolean | undefined>;
  commentById: Record<string, Comment>;
  commentContentById: Record<number, string | typeof LOADING_CONTENT>;
}

const initialState: CommentState = {
  commentCollapsedById: {},
  commentVotesById: {},
  commentSavedById: {},
  /**
   * surgical changes received after user edits or deletes comment
   */
  commentById: {},

  // https://github.com/LemmyNet/lemmy/issues/5230
  commentContentById: {},
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
    setCommentContent: (state, action: PayloadAction<Comment>) => {
      state.commentContentById[action.payload.id] = action.payload.content;
    },
    resetComments: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCommentContent.fulfilled, (state, action) => {
        state.commentContentById[action.meta.arg] = action.payload ?? "";
      })
      .addCase(getCommentContent.pending, (state, action) => {
        state.commentContentById[action.meta.arg] = LOADING_CONTENT;
      })
      .addCase(getCommentContent.rejected, (state, action) => {
        state.commentContentById[action.meta.arg] = "";
      });
  },
});

// Action creators are generated for each case reducer function
export const {
  mutatedComment,
  toggleCommentCollapseState,
  updateCommentVote,
  updateCommentSaved,
  resetComments,
  setCommentContent,
} = commentSlice.actions;

export default commentSlice.reducer;

export const voteOnComment =
  (comment: CommentView, vote: 1 | -1 | 0) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const commentId = comment.comment.id;
    const oldVote = getState().comment.commentVotesById[commentId];

    dispatch(updateCommentVote({ commentId, vote }));

    dispatch(
      updateTagVotes({
        handle: getRemoteHandle(comment.creator),
        oldVote,
        newVote: vote,
      }),
    );

    try {
      await clientSelector(getState())?.likeComment({
        comment_id: commentId,
        score: vote,
      });
    } catch (error) {
      dispatch(updateCommentVote({ commentId, vote: oldVote }));

      dispatch(
        updateTagVotes({
          handle: getRemoteHandle(comment.creator),
          oldVote: vote,
          newVote: oldVote,
        }),
      );

      throw error;
    }
  };

export const saveComment =
  (comment: CommentView, save: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const commentId = comment.comment.id;
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
  (comment: Comment, removed: boolean, reason?: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const response = await clientSelector(getState())?.removeComment({
      comment_id: comment.id,
      removed,
      reason,
    });

    dispatch(setCommentContent(comment));
    dispatch(mutatedComment(response.comment_view));
    await dispatch(resolveCommentReport(comment.id));
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

export const receivedComments =
  (comments: CommentView[]) => async (dispatch: AppDispatch) => {
    dispatch(commentSlice.actions.receivedComments(comments));
    dispatch(
      fetchTagsForHandles(comments.map((c) => getRemoteHandle(c.creator))),
    );
  };

export const getCommentContent = createAsyncThunk(
  "comment/getCommentContent",
  async (commentId: number, thunkAPI) => {
    const rootState = thunkAPI.getState() as RootState;
    const client = clientSelector(rootState);

    const log = await client.getModlog({ comment_id: commentId });

    return log.removed_comments[0]?.comment.content;
  },
  {
    condition: (commentId, { getState }) => {
      const state = getState() as RootState;

      if (state.comment.commentContentById[commentId] === undefined)
        return true;

      return false;
    },
  },
);
