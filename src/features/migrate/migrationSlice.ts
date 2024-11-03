import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { uniq, without } from "lodash";

import { db } from "#/services/db";
import { AppDispatch } from "#/store";

interface MigrationSlice {
  links: Array<string>;
}

const initialState: MigrationSlice = {
  links: [],
};

export const migrationSlice = createSlice({
  name: "migration",
  initialState,
  reducers: {
    setMigrationLinks: (state, action: PayloadAction<string[]>) => {
      state.links = action.payload;
    },
    addMigrationLink: (state, action: PayloadAction<string>) => {
      state.links = uniq([action.payload, ...state.links]);
      db.setSetting("migration_links", state.links);
    },
    removeMigrationLink: (state, action: PayloadAction<string>) => {
      state.links = without(state.links, action.payload);
      db.setSetting("migration_links", state.links);
    },
  },
});

export default migrationSlice.reducer;

export const { setMigrationLinks, addMigrationLink, removeMigrationLink } =
  migrationSlice.actions;

export const getMigrationLinks = () => async (dispatch: AppDispatch) => {
  const links = await db.getSetting("migration_links");

  dispatch(setMigrationLinks(links || []));
};
