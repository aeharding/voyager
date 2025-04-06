import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UploadImageResponse } from "lemmy-js-client";

import {
  activeAccount,
  getInstanceFromHandle,
} from "#/features/auth/authSelectors";
import { Credential } from "#/features/auth/authSlice";
import { _uploadImage, getClient } from "#/services/lemmy";
import { AppDispatch, RootState } from "#/store";

export type UploadImageContext = "body" | "post-content";

/**
 * Uploaded images can be from multiple instances. For example,
 * switch accounts in comment modal and then upload an image.
 *
 * So we need to keep track of the account/instance the image belongs to.
 */
interface Image extends UploadImageResponse {
  _handle: string;
  _context: UploadImageContext;
}

interface UploadImageState {
  pendingSubmitImages: Image[];
}

const initialState: UploadImageState = {
  pendingSubmitImages: [],
};

export const uploadImageSlice = createSlice({
  name: "uploadImage",
  initialState,
  reducers: {
    onUploadedImage: (state, action: PayloadAction<Image>) => {
      state.pendingSubmitImages.push(action.payload);
    },
    onHandledPendingImages: (
      state,
      // if undefined, everything is handled
      action: PayloadAction<Image[] | undefined>,
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
  (image: File, context: UploadImageContext, _account?: Credential) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const account = _account ?? activeAccount(state);

    if (!account) throw new Error("Account is not valid/signed in");

    const instance = getInstanceFromHandle(account.handle);
    const client = getClient(instance, account.jwt);

    const response = await _uploadImage(instance, client, image);

    dispatch(
      onUploadedImage({
        ...response,
        _handle: account.handle,
        _context: context,
      }),
    );

    return response.url!;
  };

export const deletePendingImageUploads =
  (filter?: (img: Image) => boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const images = getState().uploadImage.pendingSubmitImages;
    const toRemove = filter ? images.filter(filter) : images;

    try {
      await Promise.all(
        toRemove.map(async (img) => {
          const file = img.files?.[0];
          if (!file) return;

          const account = getState().auth.accountData?.accounts.find(
            ({ handle }) => handle === img._handle,
          );

          if (!account) return;

          const client = getClient(
            getInstanceFromHandle(account.handle),
            account.jwt,
          );

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
