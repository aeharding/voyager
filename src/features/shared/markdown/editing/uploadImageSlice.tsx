import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UploadImageResponse } from "threadiverse";

import {
  activeAccountSelector,
  getInstanceFromHandle,
} from "#/features/auth/authSelectors";
import { Credential } from "#/features/auth/authSlice";
import { getClient } from "#/services/client";
import { _uploadImage } from "#/services/lemmy";
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
        (img) =>
          !action.payload?.some((handledImg) => handledImg.url === img.url),
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
    const account = _account ?? activeAccountSelector(state);

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
          const account = getState().auth.accountData?.accounts.find(
            ({ handle }) => handle === img._handle,
          );

          if (!account) return;

          const client = getClient(
            getInstanceFromHandle(account.handle),
            account.jwt,
          );

          // Lemmy v0 requires its per-image deletion token; PieFed and Lemmy
          // v1 own uploads through the authenticated account and may not
          // return one. Preflight the exact payload so the provider decides.
          const payload = {
            url: img.url,
            delete_token: img.delete_token ?? "",
          };
          if (!(await client.supports("deleteImage", payload))) return;

          // Capability discovery is asynchronous. The credential that owns
          // this image may have been removed or replaced while it was in
          // flight; never delete through a stale account client.
          const currentAccount = getState().auth.accountData?.accounts.find(
            ({ handle }) => handle === img._handle,
          );
          if (!currentAccount || currentAccount.jwt !== account.jwt) return;

          await client.deleteImage(payload);
        }),
      );
    } finally {
      dispatch(onHandledPendingImages(toRemove));
    }
  };
