import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { addMinutes } from "date-fns";

import { parseJWT } from "#/helpers/jwt";
import { db, RedgifsProvider } from "#/services/db";
import { getGif, getTemporaryToken } from "#/services/redgifs";
import { RootState } from "#/store";

import { redgifUrlRegex } from "./helpers";

type FetchStatus = "needs-enable" | "pending" | "fulfilled" | "error";

interface Video {
  src: string;
  exp: number;
}

interface RedgifsState {
  providerFetchStatus: FetchStatus | undefined;
  providerData: RedgifsProvider | undefined;
  videoByUrl: Record<string, Video | "pending">;
}

const initialState: RedgifsState = {
  providerData: undefined,
  providerFetchStatus: undefined,
  videoByUrl: {},
};

export const redgifsSlice = createSlice({
  name: "redgifs",
  initialState,
  reducers: {
    resetRedgifs: () => {
      db.resetProviders(); // this should be abstracted when other providers added
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeIfNeeded.pending, (state) => {
        state.providerFetchStatus = "pending";
      })
      .addCase(enable.pending, (state) => {
        state.providerFetchStatus = "pending";
      })
      .addCase(initializeIfNeeded.rejected, (state) => {
        state.providerFetchStatus = "error";
        state.providerData = undefined;
      })
      .addCase(enable.rejected, (state) => {
        state.providerFetchStatus = "error";
        state.providerData = undefined;
      })
      .addCase(initializeIfNeeded.fulfilled, (state, action) => {
        if (!action.payload) {
          state.providerData = undefined;
          state.providerFetchStatus = "needs-enable";
          return;
        }

        state.providerFetchStatus = "fulfilled";
        state.providerData = action.payload;
      })
      .addCase(enable.fulfilled, (state, action) => {
        state.providerFetchStatus = "fulfilled";
        state.providerData = action.payload;
      })
      .addCase(getVideoSrc.fulfilled, (state, action) => {
        state.videoByUrl[action.meta.arg] = {
          src: action.payload,

          // according to redgifs, video urls expire after an hour or so (but not specific, so be conservative)
          exp: Math.round(addMinutes(new Date(), 15).getTime() / 1_000),
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

export const { resetRedgifs } = redgifsSlice.actions;

export const validTokenSelector = createSelector(
  [(state: RootState) => state.redgifs.providerData],
  (providerData) => {
    if (!providerData) return false;

    return isValidToken(providerData.data.token);
  },
);

export const getVideoSrc = createAsyncThunk(
  "redgifs/getVideoSrc",
  async (url: string, { getState }) => {
    const providerData = (getState() as RootState).redgifs.providerData;

    if (!providerData) throw new Error("Provider data not ready");

    const token = providerData.data.token;

    const match = url.match(redgifUrlRegex);
    if (!match || !match[1])
      throw new Error(`Expected redgif URL, instead received ${url}`);

    return await getGif(match[1], token);
  },
  {
    condition: (url, { getState }) => {
      const state = getState() as RootState;

      if (!validTokenSelector(state)) return false;

      const potentialVideo = state.redgifs.videoByUrl[url];

      if (!potentialVideo) return true;
      if (potentialVideo === "pending") return false;

      if (Date.now() / 1_000 < potentialVideo.exp) return false;

      return true;
    },
  },
);

export const initializeIfNeeded = createAsyncThunk(
  "redgifs/initialize",
  async (_, { dispatch }) => {
    const providerData = await db.getProvider("redgifs");

    if (!providerData) return;

    if (!isValidToken(providerData.data.token))
      queueMicrotask(() => dispatch(enable()));

    return providerData;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;

      if (validTokenSelector(state)) return false;

      const status = state.redgifs.providerFetchStatus;
      if (status === "pending" || status === "needs-enable") return false;

      return true;
    },
  },
);

export const enable = createAsyncThunk("redgifs/enable", async () => {
  const newProvider = {
    name: "redgifs",
    data: { token: await getTemporaryToken() },
  } as const;

  await db.setProvider(newProvider);
  return newProvider;
});

export default redgifsSlice.reducer;

function isValidToken(token: string): boolean {
  return Date.now() / 1_000 < parseJWT<{ exp: number }>(token).exp;
}
