import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NotFoundError, Post, PostView } from "threadiverse";

import {
  clientSelector,
  jwtSelector,
  userHandleSelector,
} from "#/features/auth/authSelectors";
import { resolvePostReport } from "#/features/moderation/modSlice";
import {
  fetchTagsForHandles,
  updateTagVotes,
} from "#/features/tags/userTagSlice";
import { getRemoteHandle } from "#/helpers/lemmy";
import { isLemmyError } from "#/helpers/lemmyErrors";
import { voteToIsUpvote } from "#/helpers/vote";
import { db } from "#/services/db";
import { IPostMetadata } from "#/services/db/types";
import { AppDispatch, RootState } from "#/store";

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
  postById: Record<string, PostView | "not-found">;

  /**
   * Separate deleted dictionary is so that the feed can observe and not get hammered with updates
   * (this should only ever change when the user deletes their own post to trigger the feed to hide it)
   */
  postDeletedById: Record<string, boolean>;

  postHiddenById: Record<string, PostHiddenData>;
  postVotesById: Record<string, 1 | -1 | 0 | undefined>;
  postSavedById: Record<string, boolean | undefined>;
  postReadById: Record<string, boolean>;
  postCollapsedById: Record<string, boolean>;

  /**
   * Local override of a post's `read_comments_at`, set when its comments are
   * read in-session. An override (not a mutation of the server `postById`
   * PostView): the feed hides the unread pill while it's present, and the
   * highlight boundary reads it. Cleared by `receivedPosts` so fresh server
   * data is authoritative again.
   */
  postReadCommentsAtById: Record<string, string | undefined>;
}

const initialState: PostState = {
  postById: {},
  postDeletedById: {},
  postHiddenById: {},
  postVotesById: {},
  postSavedById: {},
  postReadById: {},
  postCollapsedById: {},
  postReadCommentsAtById: {},
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
    updatePostRead: (state, action: PayloadAction<{ postId: number }>) => {
      state.postReadById[action.payload.postId] = true;
    },
    /**
     * Optimistically record that a post's comments were read in-session (an
     * override, not a mutation of the server PostView). Hides the feed's unread
     * pill and advances the highlight boundary so re-opening doesn't re-tint
     * comments we just read. `receivedPosts` clears it so the server is
     * authoritative again (the server is reset separately via getPost on open).
     */
    markPostCommentsRead: (
      state,
      action: PayloadAction<{ postId: number; readCommentsAt: string }>,
    ) => {
      state.postReadCommentsAtById[action.payload.postId] =
        action.payload.readCommentsAt;
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

          // Fresh server data is authoritative for unread comments; drop the
          // local "read in-session" override so a refreshed unread count (e.g.
          // new comments since) shows again.
          delete state.postReadCommentsAtById[post.post.id];

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
    const handle = userHandleSelector(rootState);

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
    const handle = userHandleSelector(rootState);

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
    const handle = userHandleSelector(rootState);
    const postHiddenById: Record<string, boolean> = {};

    if (!handle)
      return {
        posts,
        postHiddenById,
      };

    const receivedPostsIds = posts.map((post) => post.post.id);

    let postMetadatas: IPostMetadata[];

    try {
      postMetadatas = await db.getPostMetadatas(receivedPostsIds, handle);
    } catch (error) {
      // If lockdown mode or indexeddb unavailable, continue
      postMetadatas = [];
      console.error("Error fetching post metadatas", error);
    }

    for (const postMetadata of postMetadatas) {
      postHiddenById[postMetadata.post_id] = !!postMetadata.hidden;
    }

    thunkAPI.dispatch(
      fetchTagsForHandles(posts.map((c) => getRemoteHandle(c.creator))),
    );

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
  updatePostSaved,
  updatePostRead,
  markPostCommentsRead,
  receivedPostNotFound,
  postDeleted,
  togglePostCollapse,
  resetHidden,
} = postSlice.actions;

export default postSlice.reducer;

export const savePost =
  (post: PostView, save: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const postId = post.post.id;
    const oldSaved = getState().post.postSavedById[postId];

    const { upvoteOnSave } = getState().settings.general.posts;

    if (upvoteOnSave && save) {
      dispatch(voteOnPost(post, 1));
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
  (postId: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!jwtSelector(getState())) return;

    if (getState().settings.general.posts.disableMarkingRead) return;

    if (getState().post.postReadById[postId]) return;

    dispatch(updatePostRead({ postId }));
    await clientSelector(getState())?.markPostAsRead({
      post_ids: [postId],
      read: true,
    });
  };

/**
 * Fetching a post is what records `read_comments` on the server — both Lemmy
 * v0 and v1 call `update_read_comments` in their `get_post` handler, stamping
 * read_comments_amount = current total and read_comments_at = now. (markPostAsRead
 * only sets the `read` boolean and does NOT touch this.)
 *
 * Fired as a fire-and-forget side effect when opening a post so the "X new
 * comments" feed pill reflects truly-new comments on the next feed fetch. The
 * response is intentionally ignored — we don't want to overwrite the store (the
 * response carries the pre-update boundary, which the open page already snapshotted).
 */
export const markPostCommentsReadOnServer =
  (postId: number) =>
  async (_dispatch: AppDispatch, getState: () => RootState) => {
    if (!jwtSelector(getState())) return;
    if (getState().settings.general.posts.disableMarkingRead) return;

    try {
      await clientSelector(getState()).getPost({ id: postId });
    } catch {
      // Best-effort: this only refreshes server-side read state.
    }
  };

export const setPostHidden =
  (postId: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!jwtSelector(getState())) return;

    if (getState().settings.general.posts.disableMarkingRead) return;
    if (!getState().settings.general.posts.autoHideRead) return;

    dispatch(hidePost(postId, false));
  };

export const voteOnPost =
  (post: PostView, vote: 1 | -1 | 0) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const postId = post.post.id;

    const oldVote = getState().post.postVotesById[postId];

    dispatch(updatePostVote({ postId, vote }));

    dispatch(setPostRead(postId));

    dispatch(
      updateTagVotes({
        handle: getRemoteHandle(post.creator),
        oldVote,
        newVote: vote,
      }),
    );

    try {
      await clientSelector(getState())?.likePost({
        post_id: postId,
        is_upvote: voteToIsUpvote(vote),
      });
    } catch (error) {
      dispatch(updatePostVote({ postId, vote: oldVote }));

      dispatch(
        updateTagVotes({
          handle: getRemoteHandle(post.creator),
          oldVote: vote,
          newVote: oldVote,
        }),
      );

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
      if (error instanceof NotFoundError || isLemmyError(error, "unknown")) {
        dispatch(receivedPostNotFound(id));
      }

      throw error;
    }

    dispatch(receivedPosts([result.post_view]));
    return result;
  };

export const deletePost =
  (id: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    await clientSelector(getState()).deletePost({
      post_id: id,
      deleted: true,
    });

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
    const handle = userHandleSelector(getState());
    if (!handle) return;
    await db.clearHiddenPosts(handle);
    await dispatch(resetHidden());
  };

export const postHiddenByIdSelector = (state: RootState) => {
  return state.post.postHiddenById;
};

export const modRemovePost =
  (post: Post, removed: boolean, reason?: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const response = await clientSelector(getState())?.removePost({
      post_id: post.id,
      removed,
      reason,
    });

    dispatch(receivedPosts([response.post_view]));
    await dispatch(resolvePostReport(post.id));
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
      feature_type: "community",
      featured: stickied,
    });

    dispatch(receivedPosts([response.post_view]));
  };
