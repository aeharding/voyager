import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ListingType, SortType } from "lemmy-js-client";
import { db } from "../../../services/db";
import { RootState } from "../../../store";
import { getFeedUrlName } from "../../community/mod/ModActions";

interface PostSortState {
  sortByFeedName: Record<string, SortType | null>;
}

const initialState: PostSortState = {
  sortByFeedName: {},
};

export const feedSortSlice = createSlice({
  name: "feedSort",
  initialState,
  reducers: {
    setFeedSort: (
      state,
      action: PayloadAction<{ feed: FeedSortFeed; sort: SortType }>,
    ) => {
      const feedName = serializeFeedName(action.payload.feed);
      state.sortByFeedName[feedName] = action.payload.sort;

      db.setSetting("default_post_sort_by_feed", action.payload.sort, {
        community: feedName,
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getFeedSort.fulfilled, (state, action) => {
      const { feedName, sort } = action.payload;

      state.sortByFeedName[feedName] = sort;
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
  async (feed: FeedSortFeed) => {
    const feedName = serializeFeedName(feed);
    const sort =
      (await db.getSetting("default_post_sort_by_feed", {
        community: feedName,
      })) ?? null;

    return {
      feedName,
      sort,
    };
  },
);

export const getFeedSortSelectorBuilder =
  (feed: FeedSortFeed | undefined) => (state: RootState) =>
    feed ? state.feedSort.sortByFeedName[serializeFeedName(feed)] : null;

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
