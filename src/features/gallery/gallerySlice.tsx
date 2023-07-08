import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";

interface ImageDimension {
  width: number;
  height: number;
}

interface Image extends ImageDimension {
  src: string;
}

interface CommentState {
  imageDimensionsBySrc: Dictionary<ImageDimension>;
}

const initialState: CommentState = {
  imageDimensionsBySrc: {},
};

export const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {
    imageLoaded: (state, action: PayloadAction<Image>) => {
      state.imageDimensionsBySrc[action.payload.src] = action.payload;
    },
    resetGallery: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const { imageLoaded } = gallerySlice.actions;

export default gallerySlice.reducer;
