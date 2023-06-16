import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import { clientSelector } from "../auth/authSlice";
import { CommentView } from "lemmy-js-client";

interface CommentState {
  commentCollapsedById: Dictionary<boolean>;
  commentVotesById: Dictionary<1 | -1 | 0>;
}

const initialState: CommentState = {
  commentCollapsedById: {},
  commentVotesById: {},
};

export const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    receivedComments: (state, action: PayloadAction<CommentView[]>) => {
      for (const comment of action.payload) {
        if (comment.my_vote)
          state.commentVotesById[comment.comment.id] = comment.my_vote as
            | 1
            | -1;
      }
    },

    updateCommentCollapseState: (
      state,
      action: PayloadAction<{ commentId: number; collapsed: boolean }>
    ) => {
      state.commentCollapsedById[action.payload.commentId] =
        action.payload.collapsed;
    },
    updateCommentVote: (
      state,
      action: PayloadAction<{ commentId: number; vote: -1 | 1 | 0 | undefined }>
    ) => {
      state.commentVotesById[action.payload.commentId] = action.payload.vote;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  receivedComments,
  updateCommentCollapseState,
  updateCommentVote,
} = commentSlice.actions;

export default commentSlice.reducer;

export const voteOnComment =
  (commentId: number, vote: 1 | -1 | 0) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const oldVote = getState().comment.commentVotesById[commentId];

    dispatch(updateCommentVote({ commentId, vote }));

    const jwt = getState().auth.jwt;

    try {
      await clientSelector(getState())?.likeComment({
        comment_id: commentId,
        score: vote,
        auth: jwt!,
      });
    } catch (error) {
      dispatch(updateCommentVote({ commentId, vote: oldVote }));

      throw error;
    }
  };
