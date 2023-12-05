import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";

export const IMAGE_FAILED = -1;

interface ImageState {
  loadedBySrc: Dictionary<number | typeof IMAGE_FAILED>;
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
      action: PayloadAction<{ src: string; aspectRatio: number }>,
    ) => {
      state.loadedBySrc[action.payload.src] = action.payload.aspectRatio;
    },
    imageFailed: (state, action: PayloadAction<string>) => {
      state.loadedBySrc[action.payload] = IMAGE_FAILED;
    },
  },
});

// Action creators are generated for each case reducer function
export const { imageLoaded, imageFailed } = imageSlice.actions;

export default imageSlice.reducer;
