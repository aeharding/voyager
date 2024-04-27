import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { UploadImageResponse } from "lemmy-js-client";
import { AppDispatch, RootState } from "../../../../store";
import { clientSelector } from "../../../auth/authSelectors";
import { _uploadImage } from "../../../../services/lemmy";

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
    onHandledPendingImages: (state) => {
      state.pendingSubmitImages = [];
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
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const client = clientSelector(getState());

    try {
      await Promise.all(
        getState().uploadImage.pendingSubmitImages.map(async (img) => {
          const file = img.files?.[0];
          if (!file) return;

          await client.deleteImage({
            token: file.delete_token,
            filename: file.file,
          });
        }),
      );
    } finally {
      dispatch(onHandledPendingImages());
    }
  };
