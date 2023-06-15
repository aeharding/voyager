import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";

interface CommentState {
  commentCollapsedById: Dictionary<boolean>;
}

const initialState: CommentState = {
  commentCollapsedById: {},
};

export const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    updateCommentCollapseState: (
      state,
      action: PayloadAction<{ commentId: number; collapsed: boolean }>
    ) => {
      state.commentCollapsedById[action.payload.commentId] =
        action.payload.collapsed;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateCommentCollapseState } = commentSlice.actions;

export default commentSlice.reducer;
