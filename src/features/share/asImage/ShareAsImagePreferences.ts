import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { db } from "../../../services/db";
import { AppDispatch, useAppDispatch, useAppSelector } from "../../../store";
import { useCallback, useEffect } from "react";
import { DeepPartial } from "../../../helpers/deepPartial";
import { defaultPreferences } from "./DefaultPreferences";

export interface ShareAsImagePreferences {
  common: {
    hideUsernames: boolean;
    watermark: boolean;
  };
  post: {
    hideCommunity: boolean;
  };
  comment: {
    includePostDetails: boolean;
    includePostContent: boolean;
    allParentComments: boolean;
  };
}

const initialState = defaultPreferences;

const { reducer, actions } = createSlice({
  name: "shareAsImagePreferences",
  initialState,
  reducers: {
    setShareAsImagePreferences: (
      state,
      action: PayloadAction<DeepPartial<ShareAsImagePreferences>>,
    ) => {
      const { post, comment, common } = action.payload;

      state.common.hideUsernames =
        common?.hideUsernames ?? state.common.hideUsernames;
      state.common.watermark = common?.watermark ?? state.common.watermark;

      state.post.hideCommunity =
        post?.hideCommunity ?? state.post.hideCommunity;

      state.comment.includePostContent =
        comment?.includePostContent ?? state.comment.includePostContent;
      state.comment.includePostDetails =
        comment?.includePostDetails ?? state.comment.includePostDetails;
      state.comment.allParentComments =
        comment?.allParentComments ?? state.comment.allParentComments;

      db.setSetting(
        "share_as_image_preferences",
        JSON.parse(JSON.stringify(state)),
      );
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
