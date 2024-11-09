import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { UploadImageResponse } from "lemmy-js-client";

import { clientSelector } from "#/features/auth/authSelectors";
import { _uploadImage } from "#/services/lemmy";
import { AppDispatch, RootState } from "#/store";

interface UploadImageState {
  pendingSubmitImages: UploadImageResponse[];
}

const initialState: UploadImageState = {
  pendingSubmitImages: [],
};

export const uploadImageSlice = createSlice({
  name: "uploadImage",
  initialState,
  reducers: {
    onUploadedImage: (state, action: PayloadAction<UploadImageResponse>) => {
      state.pendingSubmitImages.push(action.payload);
    },
    onHandledPendingImages: (
      state,
      // if undefined, everything is handled
      action: PayloadAction<UploadImageResponse[] | undefined>,
    ) => {
      if (!action.payload) {
        state.pendingSubmitImages = [];
        return;
      }

      state.pendingSubmitImages = state.pendingSubmitImages.filter(
        (img) => action.payload !== img.url,
      );
    },
  },
});

export const { onUploadedImage, onHandledPendingImages } =
  uploadImageSlice.actions;

export default uploadImageSlice.reducer;

export const uploadImage =
  (image: File) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const client = clientSelector(getState());

    const response = await _uploadImage(client, image);

    dispatch(onUploadedImage(response));

    return response.url!;
  };

export const deletePendingImageUploads =
  (exceptUrl?: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const client = clientSelector(getState());

    const toRemove = getState().uploadImage.pendingSubmitImages.filter(
      (img) => {
        if (exceptUrl && img.url === exceptUrl) return false;

        return true;
      },
    );

    try {
      await Promise.all(
        toRemove.map(async (img) => {
          const file = img.files?.[0];
          if (!file) return;

          await client.deleteImage({
            token: file.delete_token,
            filename: file.file,
          });
        }),
      );
    } finally {
      dispatch(onHandledPendingImages(toRemove));
    }
  };
