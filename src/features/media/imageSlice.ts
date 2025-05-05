import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { round } from "es-toolkit";

export const IMAGE_FAILED = -1;

export interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: number;
}

interface ImageState {
  loadedBySrc: Record<string, ImageMetadata | typeof IMAGE_FAILED>;
}

const initialState: ImageState = {
  loadedBySrc: {},
};

export const imageSlice = createSlice({
  name: "resolve",
  initialState,
  reducers: {
    imageLoaded: (
      state,
      action: PayloadAction<{ src: string; width: number; height: number }>,
    ) => {
      state.loadedBySrc[action.payload.src] = {
        width: action.payload.width,
        height: action.payload.height,
        aspectRatio: round(action.payload.width / action.payload.height, 6),
      };
    },
    imageFailed: (state, action: PayloadAction<string>) => {
      state.loadedBySrc[action.payload] = IMAGE_FAILED;
    },
  },
});

// Action creators are generated for each case reducer function
export const { imageLoaded, imageFailed } = imageSlice.actions;

export default imageSlice.reducer;
