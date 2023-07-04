import {
  PayloadAction,
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { RootState } from "../../../store";
import { MAX_DEFAULT_COMMENT_DEPTH } from "../../../helpers/lemmy";
import { db } from "../../../services/db";

export const OPostAppearanceType = {
  Compact: "compact",
  Large: "large",
} as const;

export type PostAppearanceType =
  (typeof OPostAppearanceType)[keyof typeof OPostAppearanceType];

export const OCommentThreadCollapse = {
  Always: "always",
  Never: "never",
  // TODO- remember per subreddit
} as const;

export type CommentThreadCollapse =
  (typeof OCommentThreadCollapse)[keyof typeof OCommentThreadCollapse];

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
  dark: {
    usingSystemDarkMode: boolean;
    userDarkMode: boolean;
  };
}

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
  dark: {
    usingSystemDarkMode: true,
    userDarkMode: false,
  },
};

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
  initialState,
  extraReducers: (builder) => {
    builder.addCase(
      fetchSettingsFromStorage.fulfilled,
      (_, action: PayloadAction<AppearanceState>) => action.payload
    );
  },
  reducers: {
    setFontSizeMultiplier(state, action: PayloadAction<number>) {
      state.font.fontSizeMultiplier = action.payload;

      db.setSetting("font_size_multiplier", action.payload);
    },
    setUseSystemFontSize(state, action: PayloadAction<boolean>) {
      state.font.useSystemFontSize = action.payload;

      db.setSetting("use_system_font_size", action.payload);
    },
    setCommentsCollapsed(state, action: PayloadAction<CommentThreadCollapse>) {
      state.comments.collapseCommentThreads = action.payload;

      db.setSetting("collapse_comment_threads", action.payload);
    },
    setPostAppearance(state, action: PayloadAction<PostAppearanceType>) {
      state.posts.type = action.payload;

      db.setSetting("post_appearance_type", action.payload);
    },
    setUserDarkMode(state, action: PayloadAction<boolean>) {
      state.dark.userDarkMode = action.payload;

      db.setSetting("user_dark_mode", action.payload);
    },
    setUseSystemDarkMode(state, action: PayloadAction<boolean>) {
      state.dark.usingSystemDarkMode = action.payload;

      db.setSetting("use_system_dark_mode", action.payload);
    },

    resetAppearance: () => initialState,
  },
});

export const fetchSettingsFromStorage = createAsyncThunk<AppearanceState>(
  "appearance/fetchSettingsFromStorage",
  async () => {
    const font_size_multiplier = await db.getSetting("font_size_multiplier");
    const use_system_font_size = await db.getSetting("use_system_font_size");
    const collapse_comment_threads = await db.getSetting(
      "collapse_comment_threads"
    );
    const post_appearance_type = await db.getSetting("post_appearance_type");
    const use_system_dark_mode = await db.getSetting("use_system_dark_mode");
    const user_dark_mode = await db.getSetting("user_dark_mode");

    return {
      font: {
        fontSizeMultiplier: font_size_multiplier,
        useSystemFontSize: use_system_font_size,
      },
      comments: {
        collapseCommentThreads: collapse_comment_threads,
      },
      posts: {
        type: post_appearance_type,
      },
      dark: {
        usingSystemDarkMode: use_system_dark_mode,
        userDarkMode: user_dark_mode,
      },
    };
  }
);

export const {
  setFontSizeMultiplier,
  setUseSystemFontSize,
  setCommentsCollapsed,
  setPostAppearance,
  setUserDarkMode,
  setUseSystemDarkMode,
} = appearanceSlice.actions;

export default appearanceSlice.reducer;
