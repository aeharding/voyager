import {
  Dictionary,
  PayloadAction,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { PostView, SortType } from "lemmy-js-client";
import { AppDispatch, RootState } from "../../store";
import {
  clientSelector,
  handleSelector,
  jwtSelector,
  updateUserDetails,
} from "../auth/authSlice";
import { POST_SORTS } from "../feed/PostSort";
import { getRemoteHandle } from "../../helpers/lemmy";
import { set } from "../settings/storage";
import { pull } from "lodash";
import {
  buildHiddenPostsByIdFromArray,
  getStoredHiddenPosts,
  updateStoredHiddenPosts,
} from "./hidden/hiddenStorage";

const POST_SORT_KEY = "post-sort";

interface PostState {
  postById: Dictionary<PostView>;
  postVotesById: Dictionary<1 | -1 | 0>;

  sort: SortType;

  hiddenPosts: Dictionary<{
    /**
     * Storage array of hidden posts, ordered new to old
     */
    storedHiddenPosts: number[];

    /**
     * Upon page load, this dictionary is hydrated so that post
     * hidden lookups remain fast, even with tens of thousands
     * of hidden posts
     */
    byPostId: Dictionary<true>;
  }>;
}

const initialState: PostState = {
  postById: {},
  postVotesById: {},
  sort: localStorage[POST_SORT_KEY] ?? POST_SORTS[0],
  hiddenPosts: {},
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
      action: PayloadAction<{ postId: number; vote: -1 | 1 | 0 | undefined }>
    ) => {
      state.postVotesById[action.payload.postId] = action.payload.vote;
    },
    resetPosts: () => initialState,
    updateSortType(state, action: PayloadAction<SortType>) {
      state.sort = action.payload;
      set(POST_SORT_KEY, action.payload);
    },
    updatePostHidden: (
      state,
      action: PayloadAction<{ postId: number; handle: string; hidden: boolean }>
    ) => {
      const handle = action.payload.handle;
      const userHiddenPosts = state.hiddenPosts[handle];

      if (!userHiddenPosts) return;

      if (action.payload.hidden) {
        userHiddenPosts.byPostId[action.payload.postId] = true;
        userHiddenPosts.storedHiddenPosts.unshift(action.payload.postId);
      } else {
        delete userHiddenPosts.byPostId[action.payload.postId];
        pull(userHiddenPosts.storedHiddenPosts, action.payload.postId);
      }

      updateStoredHiddenPosts(
        action.payload.handle,
        userHiddenPosts.storedHiddenPosts
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateUserDetails, (state, action) => {
      // Rehydrate hidden posts from local storage when user logs in (or loads the app when logged in)
      const person = action.payload.my_user?.local_user_view.person;

      if (!person) {
        return state;
      }

      const handle = getRemoteHandle(person);

      const storedHiddenPosts = getStoredHiddenPosts(handle);

      return {
        ...state,
        hiddenPosts: {
          ...state.hiddenPosts,
          [handle]: {
            storedHiddenPosts,
            byPostId: buildHiddenPostsByIdFromArray(storedHiddenPosts),
          },
        },
      };
    });
  },
});

// Action creators are generated for each case reducer function
export const {
  receivedPosts,
  updatePostVote,
  resetPosts,
  updateSortType,
  updatePostHidden,
} = postSlice.actions;

export default postSlice.reducer;

export const hiddenPostsByIdSelector = createSelector(
  [
    (state: RootState) => handleSelector(state),
    (state: RootState) => state.post.hiddenPosts,
  ],
  (handle, hiddenPosts) => (handle && hiddenPosts[handle]?.byPostId) || {}
);

export const storedHiddenPostsSelector = createSelector(
  [
    (state: RootState) => handleSelector(state),
    (state: RootState) => state.post.hiddenPosts,
  ],
  (handle, hiddenPosts) =>
    (handle && hiddenPosts[handle]?.storedHiddenPosts) || []
);

export const voteOnPost =
  (postId: number, vote: 1 | -1 | 0) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const oldVote = getState().post.postVotesById[postId];

    dispatch(updatePostVote({ postId, vote }));

    const jwt = jwtSelector(getState());

    if (!jwt) throw new Error("Not authorized");

    try {
      await clientSelector(getState())?.likePost({
        post_id: postId,
        score: vote,
        auth: jwt,
      });
    } catch (error) {
      dispatch(updatePostVote({ postId, vote: oldVote }));

      throw error;
    }
  };

export const getPost =
  (id: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = jwtSelector(getState());

    const result = await clientSelector(getState()).getPost({
      id,
      auth: jwt,
    });

    if (result) dispatch(receivedPosts([result.post_view]));
  };

export const hidePost =
  (postId: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const handle = handleSelector(getState());
    if (!handle) return;

    dispatch(updatePostHidden({ postId, handle, hidden: true }));
  };

export const unhidePost =
  (postId: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const handle = handleSelector(getState());
    if (!handle) return;

    dispatch(updatePostHidden({ postId, handle, hidden: false }));
  };
