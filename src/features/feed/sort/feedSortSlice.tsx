import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CommentSortType, PostSortType } from "lemmy-js-client";

import { db } from "#/services/db";
import { RootState } from "#/store";

import { AnyFeed, serializeFeedName } from "../helpers";

interface PostSortState {
  /**
   * `null`: Loaded from database, but nothing there
   */
  sortByContextByFeedName: {
    posts: Record<string, PostSortType | null>;
    comments: Record<string, CommentSortType | null>;
  };
}

const initialState: PostSortState = {
  sortByContextByFeedName: {
    posts: {},
    comments: {},
  },
};

export type SetSortActionPayload =
  | {
      feed: AnyFeed;
      sort: PostSortType;
      context: "posts";
    }
  | {
      feed: AnyFeed;
      sort: CommentSortType;
      context: "comments";
    };

export const feedSortSlice = createSlice({
  name: "feedSort",
  initialState,
  reducers: {
    setFeedSort: (state, action: PayloadAction<SetSortActionPayload>) => {
      const feedName = serializeFeedName(action.payload.feed);
      state.sortByContextByFeedName[action.payload.context][feedName] =
        action.payload.sort;

      db.setSetting(
        getDefaultSortSettingForContext(action.payload.context),
        action.payload.sort,
        {
          community: feedName,
        },
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getFeedSort.fulfilled, (state, action) => {
      const { feedName, sort, context } = action.payload;

      state.sortByContextByFeedName[context][feedName] = sort;
    });
  },
});

// Action creators are generated for each case reducer function
export const { setFeedSort } = feedSortSlice.actions;

export default feedSortSlice.reducer;

export const getFeedSort = createAsyncThunk(
  "feedSort/getFeedSort",
  async ({
    feed,
    context,
  }: {
    feed: AnyFeed;
    context: "posts" | "comments";
  }) => {
    const feedName = serializeFeedName(feed);
    const sort =
      (await db.getSetting(getDefaultSortSettingForContext(context), {
        community: feedName,
      })) ?? null; // null = loaded, but not found

    return {
      feedName,
      sort,
      context,
    };
  },
);

export const getFeedSortSelectorBuilder =
  (feed: AnyFeed | undefined, context: "posts" | "comments") =>
  (state: RootState) =>
    feed
      ? state.feedSort.sortByContextByFeedName[context][serializeFeedName(feed)]
      : null;

function getDefaultSortSettingForContext(context: "posts" | "comments") {
  switch (context) {
    case "comments":
      return "default_comment_sort_by_feed";
    case "posts":
      return "default_post_sort_by_feed";
  }
}
