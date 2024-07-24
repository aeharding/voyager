import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { db, UserTag } from "../../services/db";

interface CommunityState {
  tagByRemoteHandle: Record<string, UserTag | "pending">;
}

const initialState: CommunityState = {
  tagByRemoteHandle: {},
};

export const userTagSlice = createSlice({
  name: "userTag",
  initialState,
  reducers: {
    updateTagVotes: (
      state,
      action: PayloadAction<{
        handle: string;
        oldVote: 1 | -1 | 0;
        newVote: 1 | -1 | 0;
      }>,
    ) => {
      const tag =
        state.tagByRemoteHandle[action.payload.handle] ??
        generateNewTag(action.payload.handle);

      if (tag === "pending") return;

      if (action.payload.newVote === 1 && action.payload.oldVote !== 1) {
        tag.upvotes += 1;
      }

      if (action.payload.newVote === -1 && action.payload.oldVote !== -1) {
        tag.downvotes += 1;
      }

      if (action.payload.oldVote === 1 && action.payload.newVote !== 1) {
        tag.upvotes -= 1;
      }

      if (action.payload.oldVote === -1 && action.payload.newVote !== -1) {
        tag.downvotes -= 1;
      }

      state.tagByRemoteHandle[action.payload.handle] = tag;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTagsForHandles.pending, (state, action) => {
        action.meta.arg.forEach((handle) => {
          state.tagByRemoteHandle[handle] = "pending";
        });
      })
      .addCase(fetchTagsForHandles.fulfilled, (state, action) => {
        action.payload.forEach((tag) => {
          state.tagByRemoteHandle[tag.handle] = tag;
        });
      })
      .addCase(fetchTagsForHandles.rejected, (state, action) => {
        action.meta.arg.forEach((handle) => {
          delete state.tagByRemoteHandle[handle];
        });
      });
  },
});

export default userTagSlice.reducer;

export const fetchTagsForHandles = createAsyncThunk(
  "userTags/fetch",
  async (handles: string[]) => {
    return await db.fetchTagsForHandles(handles);
  },
);

function generateNewTag(handle: string): UserTag {
  return {
    handle,
    upvotes: 0,
    downvotes: 0,
  };
}
