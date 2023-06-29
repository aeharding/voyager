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

const POST_SORT_KEY = "post-sort";

const NOT_LOGGED_IN_HANDLE = "__@@NOT_LOGGED_IN@@__";
const HIDDEN_POSTS_KEY_PREFIX = "hidden-posts-";

function getHiddenPostsKey(handle: string) {
  return `${HIDDEN_POSTS_KEY_PREFIX}${handle}`;
}

interface PostState {
  postById: Dictionary<PostView>;
  postVotesById: Dictionary<1 | -1 | 0>;

  sort: SortType;

  hiddenPosts: {
    [handle: string]: number[];
  };
}

const initialState: PostState = {
  postById: {},
  postVotesById: {},
  sort: localStorage[POST_SORT_KEY] ?? POST_SORTS[0],
  hiddenPosts: {
    [NOT_LOGGED_IN_HANDLE]: JSON.parse(
      localStorage[getHiddenPostsKey(NOT_LOGGED_IN_HANDLE)] ?? "[]"
    ),
  },
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
      localStorage[POST_SORT_KEY] = action.payload;
    },
    updatePostHidden: (
      state,
      action: PayloadAction<{ postId: number; handle: string; hidden: boolean }>
    ) => {
      const handle = action.payload.handle;
      const userHiddenPosts = state.hiddenPosts[handle];
      const index = userHiddenPosts.indexOf(action.payload.postId);

      if (action.payload.hidden && index === -1) {
        userHiddenPosts.push(action.payload.postId);
      } else {
        userHiddenPosts.splice(index, 1);
      }

      localStorage[getHiddenPostsKey(handle)] = JSON.stringify(userHiddenPosts);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateUserDetails, (state, action) => {
      // Rehydrate hidden posts from local storage when user logs in (or loads the app when logged in)

      const person = action.payload.my_user?.local_user_view.person;

      // This should never fall back to NOT_LOGGED_IN_HANDLE, but just in case and to make TS happy
      const handle = person ? getRemoteHandle(person) : NOT_LOGGED_IN_HANDLE;

      return {
        ...state,
        hiddenPosts: {
          ...state.hiddenPosts,
          [handle]: JSON.parse(localStorage[getHiddenPostsKey(handle)] ?? "[]"),
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

export const hiddenPostsSelector = createSelector(
  [
    (state: RootState) => handleSelector(state) || NOT_LOGGED_IN_HANDLE,
    (state: RootState) => state.post.hiddenPosts,
  ],
  (handle, hiddenPosts) => hiddenPosts[handle] ?? []
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
    const handle = handleSelector(getState()) || NOT_LOGGED_IN_HANDLE;

    dispatch(updatePostHidden({ postId, handle, hidden: true }));
  };

export const unhidePost =
  (postId: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const handle = handleSelector(getState()) || NOT_LOGGED_IN_HANDLE;

    dispatch(updatePostHidden({ postId, handle, hidden: false }));
  };
