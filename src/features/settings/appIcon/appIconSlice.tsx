import { AppIcon as CapAppIcon } from "@capacitor-community/app-icon";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { without } from "es-toolkit";

import { isAndroid, isNative } from "#/helpers/device";
import { AppDispatch } from "#/store";

/**
 * Important: name must be ONLY a-z characters
 */
export const APP_ICONS = [
  "default",
  "planetary",
  "psych",
  "pride",
  "holidays",
  "space",
  "galactic",
  "original",
] as const;

export type AppIcon = (typeof APP_ICONS)[number];

interface AppIconState {
  icon: AppIcon;
}

const initialState: AppIconState = {
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
      // iOS needed cache busting at some point due to moving Alternate App Icons around (thus `_v2`)
      name: isAndroid() ? name : `${name}_v2`,
      suppressNotification: false,
      disable: without(APP_ICONS, name, "default"),
    });
  };

export const fetchAppIcon = () => async (dispatch: AppDispatch) => {
  if (!isNative()) return;

  const { value } = await CapAppIcon.getName();

  // remove cache busting: planetary_v2 -> planetary
  const iconName = value?.replace(/_.*$/, "");

  dispatch(updatedAppIcon((iconName || "default") as AppIcon));
};
