import {
  PayloadAction,
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { merge } from "lodash";
import { RootState } from "../../../store";
import { MAX_DEFAULT_COMMENT_DEPTH } from "../../../helpers/lemmy";
import {
  CommentThreadCollapse,
  OCommentThreadCollapse,
  OPostAppearanceType,
  PostAppearanceType,
  OCompactThumbnailPositionType,
  CompactThumbnailPositionType,
  db,
} from "../../../services/db";
import { get, set } from "../storage";

export {
  type CommentThreadCollapse,
  type PostAppearanceType,
  type CompactThumbnailPositionType,
  OCommentThreadCollapse,
  OPostAppearanceType,
  OCompactThumbnailPositionType,
} from "../../../services/db";

interface AppearanceState {
  font: {
    fontSizeMultiplier: number;
    useSystemFontSize: boolean;
  };
  comments: {
    collapseCommentThreads: CommentThreadCollapse;
  };
  posts: {
    type: PostAppearanceType;
  };
  compact: {
    thumbnailsPosition: CompactThumbnailPositionType;
    showVotingButtons: boolean;
  };
  dark: {
    usingSystemDarkMode: boolean;
    userDarkMode: boolean;
  };
}

const LOCALSTORAGE_KEYS = {
  FONT: {
    FONT_SIZE_MULTIPLIER: "appearance--font-size-multiplier",
    USE_SYSTEM: "appearance--font-use-system",
  },
  DARK: {
    USE_SYSTEM: "appearance--dark-use-system",
    USER_MODE: "appearance--dark-user-mode",
  },
} as const;

const initialState: AppearanceState = {
  font: {
    fontSizeMultiplier: 1,
    useSystemFontSize: false,
  },
  comments: {
    collapseCommentThreads: OCommentThreadCollapse.Never,
  },
  posts: {
    type: OPostAppearanceType.Large,
  },
  compact: {
    thumbnailsPosition: OCompactThumbnailPositionType.Left,
    showVotingButtons: true,
  },
  dark: {
    usingSystemDarkMode: true,
    userDarkMode: false,
  },
};

// We continue using localstorage for specific items because indexeddb is slow
// and we don't want to wait for it to load before rendering the app and cause flickering
const stateWithLocalstorageItems: AppearanceState = merge(initialState, {
  font: {
    fontSizeMultiplier: get(LOCALSTORAGE_KEYS.FONT.FONT_SIZE_MULTIPLIER),
    useSystemFontSize: get(LOCALSTORAGE_KEYS.FONT.USE_SYSTEM),
  },
  dark: {
    usingSystemDarkMode: get(LOCALSTORAGE_KEYS.DARK.USE_SYSTEM),
    userDarkMode: get(LOCALSTORAGE_KEYS.DARK.USER_MODE),
  },
});

export const defaultCommentDepthSelector = createSelector(
  [(state: RootState) => state.appearance.comments.collapseCommentThreads],
  (collapseCommentThreads): number => {
    switch (collapseCommentThreads) {
      case OCommentThreadCollapse.Always:
        return 1;
      case OCommentThreadCollapse.Never:
        return MAX_DEFAULT_COMMENT_DEPTH;
    }
  }
);

export const appearanceSlice = createSlice({
  name: "appearance",
  initialState: stateWithLocalstorageItems,
  extraReducers: (builder) => {
    builder.addCase(
      fetchSettingsFromDatabase.fulfilled,
      (_, action: PayloadAction<AppearanceState>) => action.payload
    );
  },
  reducers: {
    setFontSizeMultiplier(state, action: PayloadAction<number>) {
      state.font.fontSizeMultiplier = action.payload;

      set(LOCALSTORAGE_KEYS.FONT.FONT_SIZE_MULTIPLIER, action.payload);
    },
    setUseSystemFontSize(state, action: PayloadAction<boolean>) {
      state.font.useSystemFontSize = action.payload;

      set(LOCALSTORAGE_KEYS.FONT.USE_SYSTEM, action.payload);
    },
    setCommentsCollapsed(state, action: PayloadAction<CommentThreadCollapse>) {
      state.comments.collapseCommentThreads = action.payload;

      db.setSetting("collapse_comment_threads", action.payload);
    },
    setPostAppearance(state, action: PayloadAction<PostAppearanceType>) {
      state.posts.type = action.payload;

      db.setSetting("post_appearance_type", action.payload);
    },
    setShowVotingButtons(state, action: PayloadAction<boolean>) {
      state.compact.showVotingButtons = action.payload;

      db.setSetting("compact_show_voting_buttons", action.payload);
    },
    setThumbnailPosition(
      state,
      action: PayloadAction<CompactThumbnailPositionType>
    ) {
      state.compact.thumbnailsPosition = action.payload;

      db.setSetting("compact_thumbnail_position_type", action.payload);
    },
    setUserDarkMode(state, action: PayloadAction<boolean>) {
      state.dark.userDarkMode = action.payload;

      set(LOCALSTORAGE_KEYS.DARK.USER_MODE, action.payload);
    },
    setUseSystemDarkMode(state, action: PayloadAction<boolean>) {
      state.dark.usingSystemDarkMode = action.payload;

      set(LOCALSTORAGE_KEYS.DARK.USE_SYSTEM, action.payload);
    },

    resetAppearance: () => initialState,
  },
});

export const fetchSettingsFromDatabase = createAsyncThunk<AppearanceState>(
  "appearance/fetchSettingsFromDatabase",
  async (_, thunkApi) => {
    return db.transaction("r", db.settings, async () => {
      const state = thunkApi.getState() as RootState;
      const collapse_comment_threads = await db.getSetting(
        "collapse_comment_threads"
      );
      const post_appearance_type = await db.getSetting("post_appearance_type");
      const compact_thumbnail_position_type = await db.getSetting(
        "compact_thumbnail_position_type"
      );
      const compact_show_voting_buttons = await db.getSetting(
        "compact_show_voting_buttons"
      );

      return {
        ...state.appearance,
        comments: {
          collapseCommentThreads: collapse_comment_threads,
        },
        posts: {
          type: post_appearance_type,
        },
        compact: {
          thumbnailsPosition: compact_thumbnail_position_type,
          showVotingButtons: compact_show_voting_buttons,
        },
      };
    });
  }
);

export const {
  setFontSizeMultiplier,
  setUseSystemFontSize,
  setCommentsCollapsed,
  setPostAppearance,
  setThumbnailPosition,
  setShowVotingButtons,
  setUserDarkMode,
  setUseSystemDarkMode,
} = appearanceSlice.actions;

export default appearanceSlice.reducer;
