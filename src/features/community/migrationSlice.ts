import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import { db } from "../../services/db";
import { uniq } from "lodash";

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
    resetMigrationLinks: (state) => {
      state.links = [];
      db.setSetting("migration_links", state.links);
    },
  },
});

export default migrationSlice.reducer;

export const getMigrationLinks = () => async (dispatch: AppDispatch) => {
  const links = await db.getSetting("migration_links");

  dispatch(setMigrationLinks(links || []));
};

export const { setMigrationLinks, addMigrationLink, resetMigrationLinks } =
  migrationSlice.actions;
