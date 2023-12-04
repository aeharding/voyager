import {
  Dictionary,
  PayloadAction,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { PostView, SortType } from "lemmy-js-client";
import { AppDispatch, RootState } from "../../store";
import { clientSelector, handleSelector, jwtSelector } from "../auth/authSlice";
import { POST_SORTS } from "../feed/PostSort";
import { get, set } from "../settings/storage";
import { IPostMetadata, db } from "../../services/db";
import { isLemmyError } from "../../helpers/lemmy";
import { resolvePostReport } from "../moderation/modSlice";

const POST_SORT_KEY = "post-sort-v2";

interface PostHiddenData {
  /**
   * Is post hidden?
   */
  hidden: boolean;

  /**
   * Should post be immediately hidden from feed, or just on next refresh?
   *
   * (For example: User pressing "hide" immediately hides,
   * vs "auto hide" hiding on refresh)
   */
  immediate: boolean;
}

interface PostState {
  postById: Dictionary<PostView | "not-found">;

  /**
   * Separate deleted dictionary is so that the feed can observe and not get hammered with updates
   * (this should only ever change when the user deletes their own post to trigger the feed to hide it)
   */
  postDeletedById: Dictionary<boolean>;

  postHiddenById: Dictionary<PostHiddenData>;
  postVotesById: Dictionary<1 | -1 | 0>;
  postSavedById: Dictionary<boolean>;
  postReadById: Dictionary<boolean>;
  postCollapsedById: Dictionary<boolean>;
  sort: SortType;
}

const initialState: PostState = {
  postById: {},
  postDeletedById: {},
  postHiddenById: {},
  postVotesById: {},
  postSavedById: {},
  postReadById: {},
  postCollapsedById: {},
  sort: get(POST_SORT_KEY) ?? POST_SORTS[0],
};

export const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    updatePostVote: (
      state,
      action: PayloadAction<{ postId: number; vote: -1 | 1 | 0 | undefined }>,
    ) => {
      state.postVotesById[action.payload.postId] = action.payload.vote;
    },
    updatePostSaved: (
      state,
      action: PayloadAction<{ postId: number; saved: boolean | undefined }>,
    ) => {
      state.postSavedById[action.payload.postId] = action.payload.saved;
    },
    resetPosts: () => initialState,
    updateSortType(state, action: PayloadAction<SortType>) {
      state.sort = action.payload;
      set(POST_SORT_KEY, action.payload);
    },
    updatePostRead: (state, action: PayloadAction<{ postId: number }>) => {
      state.postReadById[action.payload.postId] = true;
    },
    receivedPostNotFound: (state, action: PayloadAction<number>) => {
      state.postById[action.payload] = "not-found";
    },
    postDeleted: (state, action: PayloadAction<number>) => {
      state.postDeletedById[action.payload] = true;
    },
    togglePostCollapse: (state, action: PayloadAction<number>) => {
      state.postCollapsedById[action.payload] =
        !state.postCollapsedById[action.payload];
    },
    resetHidden: (state) => {
      state.postHiddenById = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(receivedPosts.fulfilled, (state, action) => {
        const { posts, postHiddenById } = action.payload;

        for (const post of posts) {
          state.postById[post.post.id] = post;
          const hidden = postHiddenById[post.post.id];
          if (hidden)
            state.postHiddenById[post.post.id] = {
              hidden,

              // Inherit immediate value, if already hidden with immediate = false
              immediate: state.postHiddenById[post.post.id]?.immediate ?? true,
            };
          if (post.read) state.postReadById[post.post.id] = post.read;

          if (post.my_vote)
            state.postVotesById[post.post.id] = post.my_vote as 1 | -1;

          if (post.saved) state.postSavedById[post.post.id] = post.saved;

          // If user restores a post, reset local state
          // (you can't do this through Voyager, but you can with lemmy-ui)
          if (!post.post.deleted && state.postDeletedById[post.post.id]) {
            delete state.postDeletedById[post.post.id];
          }
        }
      })
      .addCase(updatePostHidden.fulfilled, (state, action) => {
        if (!action.payload) return;

        state.postHiddenById[action.payload.metadata.post_id] = {
          hidden: !!action.payload.metadata.hidden,
          immediate: action.payload.immediate,
        };
      })
      .addCase(bulkUpdatePostsHidden.fulfilled, (state, action) => {
        if (!action.payload) return;

        for (const metadata of action.payload.metadata) {
          state.postHiddenById[metadata.post_id] = {
            hidden: !!metadata.hidden,
            immediate: action.payload.immediate,
          };
        }
      });
  },
});

export const updatePostHidden = createAsyncThunk(
  "post/updatePostHidden",
  async (
    {
      postId,
      hidden,
      immediate,
    }: { postId: number; hidden: boolean; immediate: boolean },
    thunkAPI,
  ) => {
    const rootState = thunkAPI.getState() as RootState;
    const handle = handleSelector(rootState);

    if (!handle) return;

    const newPostMetadata: IPostMetadata = {
      post_id: postId,
      user_handle: handle,
      hidden: hidden ? 1 : 0,
      hidden_updated_at: Date.now(),
    };

    await db.upsertPostMetadata(newPostMetadata);

    return { metadata: newPostMetadata, immediate };
  },
);

export const bulkUpdatePostsHidden = createAsyncThunk(
  "post/bulkUpdatePostsHidden",
  async (
    {
      postIds,
      hidden,
      immediate,
    }: { postIds: number[]; hidden: boolean; immediate: boolean },
    thunkAPI,
  ) => {
    const rootState = thunkAPI.getState() as RootState;
    const handle = handleSelector(rootState);

    if (!handle) return;

    const newPostMetadata: IPostMetadata[] = postIds.map((postId) => ({
      post_id: postId,
      user_handle: handle,
      hidden: hidden ? 1 : 0,
      hidden_updated_at: Date.now(),
    }));

    await Promise.all(
      newPostMetadata.map((metadata) => db.upsertPostMetadata(metadata)),
    );

    return { metadata: newPostMetadata, immediate };
  },
);

export const receivedPosts = createAsyncThunk(
  "post/receivedPosts",
  async (posts: PostView[], thunkAPI) => {
    const rootState = thunkAPI.getState() as RootState;
    const handle = handleSelector(rootState);
    const postHiddenById: Dictionary<boolean> = {};

    if (!handle)
      return {
        posts,
        postHiddenById,
      };

    const receivedPostsIds = posts.map((post) => post.post.id);
    const postMetadatas = await db.getPostMetadatas(receivedPostsIds, handle);

    for (const postMetadata of postMetadatas) {
      postHiddenById[postMetadata.post_id] = !!postMetadata.hidden;
    }

    return {
      posts,
      postHiddenById,
    };
  },
);

// Action creators are generated for each case reducer function
export const {
  updatePostVote,
  resetPosts,
  updateSortType,
  updatePostSaved,
  updatePostRead,
  receivedPostNotFound,
  postDeleted,
  togglePostCollapse,
  resetHidden,
} = postSlice.actions;

export default postSlice.reducer;

export const savePost =
  (postId: number, save: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const oldSaved = getState().post.postSavedById[postId];

    const { upvoteOnSave } = getState().settings.general.posts;

    if (upvoteOnSave && save) {
      dispatch(voteOnPost(postId, 1));
    }

    dispatch(updatePostSaved({ postId, saved: save }));

    try {
      await clientSelector(getState())?.savePost({
        post_id: postId,
        save,
      });
    } catch (error) {
      dispatch(updatePostSaved({ postId, saved: oldSaved }));

      throw error;
    }
  };

export const setPostRead =
  (postId: number, autoHideDisabled = false) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!jwtSelector(getState())) return;
    if (getState().settings.general.posts.disableMarkingRead) return;

    if (getState().settings.general.posts.autoHideRead && !autoHideDisabled)
      dispatch(hidePost(postId, false));

    if (!getState().post.postReadById[postId]) {
      dispatch(updatePostRead({ postId }));
      await clientSelector(getState())?.markPostAsRead({
        post_id: postId,
        read: true,
      });
    }
  };

export const voteOnPost =
  (postId: number, vote: 1 | -1 | 0) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const oldVote = getState().post.postVotesById[postId];

    dispatch(updatePostVote({ postId, vote }));

    dispatch(setPostRead(postId));

    try {
      await clientSelector(getState())?.likePost({
        post_id: postId,
        score: vote,
      });
    } catch (error) {
      dispatch(updatePostVote({ postId, vote: oldVote }));
      throw error;
    }
  };

export const getPost =
  (id: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    let result;

    try {
      result = await clientSelector(getState()).getPost({
        id,
      });
    } catch (error) {
      // I think there is a bug in lemmy-js-client where it tries to parse 404 with non-json body
      if (
        isLemmyError(error, "couldnt_find_post") ||
        error instanceof SyntaxError
      ) {
        dispatch(receivedPostNotFound(id));
      }

      throw error;
    }

    dispatch(receivedPosts([result.post_view]));
    return result;
  };

export const deletePost =
  (id: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      await clientSelector(getState()).deletePost({
        post_id: id,
        deleted: true,
      });
    } catch (error) {
      // I think there is a bug in lemmy-js-client where it tries to parse 404 with non-json body
      if (
        isLemmyError(error, "couldnt_find_post") ||
        error instanceof SyntaxError
      ) {
        dispatch(receivedPostNotFound(id));

        return;
      }

      throw error;
    }

    dispatch(postDeleted(id));
  };

export const hidePost =
  (postId: number, immediate = true) =>
  async (dispatch: AppDispatch) => {
    await dispatch(updatePostHidden({ postId, hidden: true, immediate }));
  };

export const hidePosts =
  (postIds: number[], immediate = true) =>
  async (dispatch: AppDispatch) => {
    await dispatch(bulkUpdatePostsHidden({ postIds, hidden: true, immediate }));
  };

export const unhidePost =
  (postId: number, immediate = true) =>
  async (dispatch: AppDispatch) => {
    await dispatch(updatePostHidden({ postId, hidden: false, immediate }));
  };

export const clearHidden =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const handle = handleSelector(getState());
    if (!handle) return;
    await db.clearHiddenPosts(handle);
    await dispatch(resetHidden());
  };

export const postHiddenByIdSelector = (state: RootState) => {
  return state.post.postHiddenById;
};

export const modRemovePost =
  (postId: number, removed: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const response = await clientSelector(getState())?.removePost({
      post_id: postId,
      removed,
    });

    dispatch(receivedPosts([response.post_view]));
    await dispatch(resolvePostReport(postId));
  };

export const modLockPost =
  (postId: number, locked: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const response = await clientSelector(getState())?.lockPost({
      post_id: postId,
      locked,
    });

    dispatch(receivedPosts([response.post_view]));
  };

export const modStickyPost =
  (postId: number, stickied: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const response = await clientSelector(getState())?.featurePost({
      post_id: postId,
      feature_type: "Community",
      featured: stickied,
    });

    dispatch(receivedPosts([response.post_view]));
  };
