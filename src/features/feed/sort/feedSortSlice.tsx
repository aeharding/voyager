import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CommentSortType, ListingType, SortType } from "lemmy-js-client";
import { db } from "../../../services/db";
import { RootState } from "../../../store";
import { getFeedUrlName } from "../../community/mod/ModActions";

interface PostSortState {
  /**
   * `null`: Loaded from database, but nothing there
   */
  sortByContextByFeedName: {
    posts: Record<string, SortType | null>;
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
      feed: FeedSortFeed;
      sort: SortType;
      context: "posts";
    }
  | {
      feed: FeedSortFeed;
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

export type FeedSortFeed =
  | {
      remoteCommunityHandle: string;
    }
  | {
      listingType: ListingType;
    };

export const getFeedSort = createAsyncThunk(
  "feedSort/getFeedSort",
  async ({
    feed,
    context,
  }: {
    feed: FeedSortFeed;
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
  (feed: FeedSortFeed | undefined, context: "posts" | "comments") =>
  (state: RootState) =>
    feed
      ? state.feedSort.sortByContextByFeedName[context][serializeFeedName(feed)]
      : null;

function serializeFeedName(feed: FeedSortFeed): string {
  switch (true) {
    case "remoteCommunityHandle" in feed:
      return feed.remoteCommunityHandle; // always contains @ - will never overlap with getFeedUrlName
    case "listingType" in feed:
      return getFeedUrlName(feed.listingType);
    default:
      return feed;
  }
}

function getDefaultSortSettingForContext(context: "posts" | "comments") {
  switch (context) {
    case "comments":
      return "default_comment_sort_by_feed";
    case "posts":
      return "default_post_sort_by_feed";
  }
}
