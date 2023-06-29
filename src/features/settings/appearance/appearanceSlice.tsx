import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { get, set } from "../storage";
import { merge } from "lodash";

const STORAGE_KEYS = {
  FONT: {
    FONT_SIZE_MULTIPLIER: "appearance--font-size-multiplier",
    USE_SYSTEM: "appearance--font-use-system",
  },
} as const;

interface AppearanceState {
  font: {
    fontSizeMultiplier: number;
    useSystemFontSize: boolean;
  };
}

const initialState: AppearanceState = {
  font: {
    fontSizeMultiplier: 1,
    useSystemFontSize: false,
  },
};

const stateFromStorage: AppearanceState = merge(initialState, {
  font: {
    fontSizeMultiplier: get(STORAGE_KEYS.FONT.FONT_SIZE_MULTIPLIER),
    useSystemFontSize: get(STORAGE_KEYS.FONT.USE_SYSTEM),
  },
});

export const appearanceSlice = createSlice({
  name: "appearance",
  initialState: stateFromStorage,
  reducers: {
    setFontSizeMultiplier(state, action: PayloadAction<number>) {
      state.font.fontSizeMultiplier = action.payload;

      set(STORAGE_KEYS.FONT.FONT_SIZE_MULTIPLIER, action.payload);
    },
    setUseSystemFontSize(state, action: PayloadAction<boolean>) {
      state.font.useSystemFontSize = action.payload;

      set(STORAGE_KEYS.FONT.USE_SYSTEM, action.payload);
    },

    resetAppearance: () => initialState,
  },
});

export const { setFontSizeMultiplier, setUseSystemFontSize } =
  appearanceSlice.actions;

export default appearanceSlice.reducer;
