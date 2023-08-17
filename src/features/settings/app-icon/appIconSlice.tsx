import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppIcon as CapAppIcon } from "@capacitor-community/app-icon";
import { AppDispatch } from "../../../store";
import { isNative } from "../../../helpers/device";
import { without } from "lodash";

export const APP_ICONS = [
  "default",
  "planetary",
  "psych",
  "space",
  "galactic",
  "original",
] as const;

export type AppIcon = (typeof APP_ICONS)[number];

interface CommunityState {
  icon: AppIcon;
}

const initialState: CommunityState = {
  icon: "default",
};

export const appIconSlice = createSlice({
  name: "appIcon",
  initialState,
  reducers: {
    updatedAppIcon: (state, action: PayloadAction<AppIcon>) => {
      state.icon = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updatedAppIcon } = appIconSlice.actions;

export default appIconSlice.reducer;

export const updateAppIcon =
  (name: AppIcon) => async (dispatch: AppDispatch) => {
    dispatch(updatedAppIcon(name));

    if (name === "default") {
      CapAppIcon.reset({
        suppressNotification: false,
        disable: without(APP_ICONS, "default"),
      });
      return;
    }

    CapAppIcon.change({
      name,
      suppressNotification: false,
      disable: without(APP_ICONS, name, "default"),
    });
  };

export const fetchAppIcon = () => async (dispatch: AppDispatch) => {
  if (!isNative()) return;

  const { value } = await CapAppIcon.getName();

  dispatch(updatedAppIcon((value || "default") as AppIcon));
};
