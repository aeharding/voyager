import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { db } from "#/services/db";
import { getVideo } from "#/services/loops";
import { RootState } from "#/store";

import { loopsUrlRegex } from "./helpers";

interface Video {
  src: string;
}

interface LoopsState {
  enabled: boolean;
  videoByUrl: Record<string, Video | "pending">;
}

const initialState: LoopsState = {
  enabled: false,
  videoByUrl: {},
};

export const loopsSlice = createSlice({
  name: "loops",
  initialState,
  reducers: {
    resetLoops: () => {
      db.resetProviders(); // this should be abstracted when other providers added
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(enable.pending, (state) => {
        state.enabled = true;
      })
      .addCase(enable.rejected, (state) => {
        state.enabled = false;
      })
      .addCase(enable.fulfilled, (state) => {
        state.enabled = true;
      })
      .addCase(getVideoSrc.fulfilled, (state, action) => {
        state.videoByUrl[action.meta.arg] = {
          src: action.payload,
        };
      })
      .addCase(getVideoSrc.pending, (state, action) => {
        state.videoByUrl[action.meta.arg] = "pending";
      })
      .addCase(getVideoSrc.rejected, (state, action) => {
        delete state.videoByUrl[action.meta.arg];
      });
  },
});

export const { resetLoops } = loopsSlice.actions;

export const getVideoSrc = createAsyncThunk(
  "loops/getVideoSrc",
  async (url: string, { getState }) => {
    const enabled = (getState() as RootState).loops.enabled;

    if (!enabled) throw new Error("Provider data not ready");

    const match = url.match(loopsUrlRegex);
    if (!match || !match[1])
      throw new Error(`Expected loops URL, instead received ${url}`);

    return await getVideo(match[1]);
  },
  {
    condition: (url, { getState }) => {
      const state = getState() as RootState;

      const potentialVideo = state.loops.videoByUrl[url];

      if (potentialVideo === undefined) return true;

      return false;
    },
  },
);

export const enable = createAsyncThunk("loops/enable", async () => {
  const newProvider = {
    name: "loops",
    data: {},
  } as const;

  await db.setProvider(newProvider);
  return newProvider;
});

export default loopsSlice.reducer;
