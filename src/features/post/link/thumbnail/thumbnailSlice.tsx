import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { RootState } from "#/store";

import { determineThumbnail, Thumbnail } from "./thumbnailinator";

interface ThumbnailState {
  thumbnailSrcByUrl: Record<string, "pending" | "failed" | "none" | Thumbnail>;
}

const initialState: ThumbnailState = {
  thumbnailSrcByUrl: {},
};

export const thumbnailSlice = createSlice({
  name: "thumbnail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchThumbnail.pending, (state, action) => {
        if (state.thumbnailSrcByUrl[action.meta.arg]) return;
        state.thumbnailSrcByUrl[action.meta.arg] = "pending";
      })
      .addCase(fetchThumbnail.rejected, (state, action) => {
        if (state.thumbnailSrcByUrl[action.meta.arg] !== "pending") return;
        state.thumbnailSrcByUrl[action.meta.arg] = "failed";
      })
      .addCase(fetchThumbnail.fulfilled, (state, action) => {
        if (state.thumbnailSrcByUrl[action.meta.arg] !== "pending") return;
        state.thumbnailSrcByUrl[action.meta.arg] = action.payload ?? "none";
      });
  },
});

export default thumbnailSlice.reducer;

export const fetchThumbnail = createAsyncThunk(
  "thumbnail/fetch",
  async (url: string) => await determineThumbnail(url),
  {
    condition: (url, { getState }) => {
      // Only allow fetch once
      return !(getState() as RootState).thumbnail.thumbnailSrcByUrl[url];
    },
  },
);
