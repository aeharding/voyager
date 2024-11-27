import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AnyFeed, serializeFeedName } from "#/features/feed/helpers";
import { db, PostAppearanceType } from "#/services/db";

interface PostAppearanceState {
  /**
   * `null`: Loaded from database, but nothing there
   */
  postAppearanceByFeedName: Record<string, PostAppearanceType | null>;
}

const initialState: PostAppearanceState = {
  postAppearanceByFeedName: {},
};

export const postAppearanceSlice = createSlice({
  name: "postAppearance",
  initialState,
  reducers: {
    setPostAppeartance: (
      state,
      action: PayloadAction<{
        feed: AnyFeed;
        postAppearance: PostAppearanceType;
      }>,
    ) => {
      const feedName = serializeFeedName(action.payload.feed);
      state.postAppearanceByFeedName[feedName] = action.payload.postAppearance;

      db.setSetting("post_appearance_type", action.payload.postAppearance, {
        community: feedName,
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPostAppearance.fulfilled, (state, action) => {
      const { feedName, postAppearance } = action.payload;

      state.postAppearanceByFeedName[feedName] = postAppearance;
    });
  },
});

// Action creators are generated for each case reducer function
export const { setPostAppeartance } = postAppearanceSlice.actions;

export default postAppearanceSlice.reducer;

export const getPostAppearance = createAsyncThunk(
  "postAppearance/getPostAppearance",
  async (feed: AnyFeed) => {
    const feedName = serializeFeedName(feed);
    const postAppearance =
      (await db.getSetting("post_appearance_type", {
        community: feedName,
      })) ?? null; // null = loaded, but not found

    return {
      feedName,
      postAppearance,
    };
  },
);
