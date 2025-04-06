import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { VgerCommentSortType } from "#/features/comment/CommentSort";
import { VgerCommunitySortType } from "#/routes/pages/search/results/CommunitySort";
import { db } from "#/services/db";
import { RootState } from "#/store";

import { AnyFeed, serializeFeedName } from "../helpers";
import { VgerPostSortType } from "./PostSort";
import { VgerSearchSortType } from "./SearchSort";

interface PostSortState {
  /**
   * `null`: Loaded from database, but nothing there
   */
  sortByContextByFeedName: {
    posts: Record<string, VgerPostSortType | null>;
    comments: Record<string, VgerCommentSortType | null>;
    search: Record<string, VgerSearchSortType | null>;
    communities: Record<string, VgerCommunitySortType | null>;
  };
}

const initialState: PostSortState = {
  sortByContextByFeedName: {
    posts: {},
    comments: {},
    search: {},
    communities: {},
  },
};

export type SetSortActionPayload =
  | {
      feed: AnyFeed;
      sort: VgerPostSortType;
      context: "posts";
    }
  | {
      feed: AnyFeed;
      sort: VgerCommentSortType;
      context: "comments";
    }
  | {
      feed: AnyFeed;
      sort: VgerSearchSortType;
      context: "search";
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
    context: "posts" | "comments" | "search" | "communities";
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
  (
    feed: AnyFeed | undefined,
    context: "posts" | "comments" | "search" | "communities",
  ) =>
  (state: RootState) =>
    feed
      ? state.feedSort.sortByContextByFeedName[context][serializeFeedName(feed)]
      : null;

function getDefaultSortSettingForContext(
  context: "posts" | "comments" | "search" | "communities",
) {
  switch (context) {
    case "comments":
      return "default_comment_sort_by_feed";
    case "posts":
      return "default_post_sort_by_feed";
    case "search":
      return "default_search_sort_by_feed";
    case "communities":
      return "default_community_sort_by_feed";
  }
}
