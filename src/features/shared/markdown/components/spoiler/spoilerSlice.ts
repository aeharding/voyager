import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ExtraProps } from "react-markdown";

interface NetworkState {
  byId: Record<string, boolean>;
}

const initialState: NetworkState = {
  byId: {},
};

export const spoilerSlice = createSlice({
  name: "spoiler",
  initialState,
  reducers: {
    updateSpoilerState(
      state,
      action: PayloadAction<{ id: string; isOpen: boolean }>,
    ) {
      if (!action.payload.isOpen) {
        delete state.byId[action.payload.id];
        return;
      }

      state.byId[action.payload.id] = true;
    },
  },
});

export const { updateSpoilerState } = spoilerSlice.actions;

export default spoilerSlice.reducer;

export function getSpoilerId(
  markdownItemId: string,
  node: NonNullable<ExtraProps["node"]> | undefined,
) {
  return `${markdownItemId}__${node?.position?.start.offset ?? 0}`;
}
