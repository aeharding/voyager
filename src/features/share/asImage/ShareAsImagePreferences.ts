import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { db } from "../../../services/db";
import {
  AppDispatch,
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../../../store";
import { useCallback, useEffect } from "react";
import { DeepPartial } from "../../../helpers/deepPartial";

export interface ShareAsImagePreferences {
  post: {
    hideCommunity: boolean;
    hideUsername: boolean;
    watermark: boolean;
  };
  comment: {
    includePostDetails: boolean;
    includePostText: boolean;
    hideUsernames: boolean;
    watermark: boolean;
    allParentComments: boolean;
  };
}

const initialState: ShareAsImagePreferences = {
  post: {
    hideCommunity: false,
    hideUsername: false,
    watermark: false,
  },
  comment: {
    includePostText: false,
    includePostDetails: false,
    hideUsernames: false,
    watermark: false,
    allParentComments: false,
  },
};

const { reducer, actions } = createSlice({
  name: "shareAsImagePreferences",
  initialState,
  reducers: {
    setShareAsImagePreferences: (
      state,
      action: PayloadAction<DeepPartial<ShareAsImagePreferences>>,
    ) => {
      const { post, comment } = action.payload;
      state.post.hideCommunity =
        post?.hideCommunity ?? state.post.hideCommunity;
      state.post.hideUsername = post?.hideUsername ?? state.post.hideUsername;
      state.post.watermark = post?.watermark ?? state.post.watermark;

      state.comment.includePostText =
        comment?.includePostText ?? state.comment.includePostText;
      state.comment.includePostDetails =
        comment?.includePostDetails ?? state.comment.includePostDetails;
      state.comment.hideUsernames =
        comment?.hideUsernames ?? state.comment.hideUsernames;
      state.comment.watermark = comment?.watermark ?? state.comment.watermark;
      state.comment.allParentComments =
        comment?.allParentComments ?? state.comment.allParentComments;

      db.setSetting("share_as_image_preferences", {
        post: { ...state.post },
        comment: { ...state.comment },
      });
    },
  },
});

export default reducer;

export const useShareAsImagePreferences = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load settings from DB on mount
    dispatch(async (dispatchImpl: AppDispatch) => {
      const share_as_image_preferences = await db.getSetting(
        "share_as_image_preferences",
      );
      dispatchImpl(
        actions.setShareAsImagePreferences(
          share_as_image_preferences ?? initialState,
        ),
      );
    });
  }, [dispatch]);

  const shareAsImagePreferences = useAppSelector(
    (state) => state.shareAsImagePreferences,
  );

  const setShareAsImagePreferences = useCallback(
    (payload: DeepPartial<ShareAsImagePreferences>) => {
      dispatch(actions.setShareAsImagePreferences(payload));
    },
    [dispatch],
  );

  return { shareAsImagePreferences, setShareAsImagePreferences };
};
