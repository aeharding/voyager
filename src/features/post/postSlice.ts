import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { PostView, SortType } from "lemmy-js-client";
import { AppDispatch, RootState } from "../../store";
import { clientSelector } from "../auth/authSlice";

const POST_SORT_KEY = "post-sort";

interface PostState {
  postById: Dictionary<PostView>;
  postVotesById: Dictionary<1 | -1 | 0>;

  sort: SortType;
}

const initialState: PostState = {
  postById: {},
  postVotesById: {},
  sort: localStorage[POST_SORT_KEY] ?? "Hot",
};

export const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    receivedPosts: (state, action: PayloadAction<PostView[]>) => {
      for (const post of action.payload) {
        state.postById[post.post.id] = post;

        if (post.my_vote)
          state.postVotesById[post.post.id] = post.my_vote as 1 | -1;
      }
    },
    updatePostVote: (
      state,
      action: PayloadAction<{ postId: number; vote: -1 | 1 | 0 }>
    ) => {
      state.postVotesById[action.payload.postId] = action.payload.vote;
    },
    resetPosts: () => initialState,
    updateSortType(state, action: PayloadAction<SortType>) {
      state.sort = action.payload;
      localStorage[POST_SORT_KEY] = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { receivedPosts, updatePostVote, resetPosts, updateSortType } =
  postSlice.actions;

export default postSlice.reducer;

export const voteOnPost =
  (postId: number, vote: 1 | -1 | 0) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(updatePostVote({ postId, vote }));

    const jwt = getState().auth.jwt;

    clientSelector(getState())?.likePost({
      post_id: postId,
      score: vote,
      auth: jwt!,
    });
  };
