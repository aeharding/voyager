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
    resetLinks: () => initialState,
  },
});

export default migrationSlice.reducer;

export const addMigrationLink =
  (link: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;
    const links = uniq([link, ...getState().migration.links]);

    if (!userHandle) return;

    dispatch(setMigrationLinks(links));

    db.setSetting("migration_links", links, {
      user_handle: userHandle,
    });
  };

export const getMigrationLinks =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    if (!userHandle) {
      dispatch(setMigrationLinks([]));
      return;
    }

    const links = await db.getSetting("migration_links", {
      user_handle: userHandle,
    });

    dispatch(setMigrationLinks(links || []));
  };

export const resetMigrationLinks =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    if (!userHandle) return;

    dispatch(resetLinks);

    db.setSetting("migration_links", [], {
      user_handle: userHandle,
    });
  };

const { setMigrationLinks, resetLinks } = migrationSlice.actions;
