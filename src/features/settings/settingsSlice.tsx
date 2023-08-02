import {
  PayloadAction,
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { merge } from "lodash";
import { AppDispatch, RootState } from "../../store";
import { MAX_DEFAULT_COMMENT_DEPTH } from "../../helpers/lemmy";
import {
  CommentThreadCollapse,
  OCommentThreadCollapse,
  OPostAppearanceType,
  PostBlurNsfwType,
  PostAppearanceType,
  OCompactThumbnailPositionType,
  CompactThumbnailPositionType,
  db,
  OPostBlurNsfw,
  CommentDefaultSort,
  OCommentDefaultSort,
  InstanceUrlDisplayMode,
  OInstanceUrlDisplayMode,
  VoteDisplayMode,
  OVoteDisplayMode,
  OProfileLabelType,
  ProfileLabelType,
  AppThemeType,
} from "../../services/db";
import { get, set } from "./storage";
import { Mode } from "@ionic/core";

export {
  type CommentThreadCollapse,
  type PostAppearanceType,
  type CompactThumbnailPositionType,
  OCommentThreadCollapse,
  OPostAppearanceType,
  OCompactThumbnailPositionType,
} from "../../services/db";

interface SettingsState {
  ready: boolean;
  appearance: {
    font: {
      fontSizeMultiplier: number;
      useSystemFontSize: boolean;
    };
    general: {
      userInstanceUrlDisplay: InstanceUrlDisplayMode;
      profileLabel: ProfileLabelType;
    };
    posts: {
      blurNsfw: PostBlurNsfwType;
      type: PostAppearanceType;
    };
    compact: {
      thumbnailsPosition: CompactThumbnailPositionType;
      showVotingButtons: boolean;
    };
    voting: {
      voteDisplayMode: VoteDisplayMode;
    };
    dark: {
      usingSystemDarkMode: boolean;
      userDarkMode: boolean;
      pureBlack: boolean;
    };
    deviceMode: Mode;
    theme: AppThemeType;
  };
  general: {
    comments: {
      collapseCommentThreads: CommentThreadCollapse;
      sort: CommentDefaultSort;
    };
    posts: {
      disableMarkingRead: boolean;
      markReadOnScroll: boolean;
      showHideReadButton: boolean;
    };
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
    PURE_BLACK: "appearance--pure-black",
  },
  DEVICE_MODE: "appearance--device-mode",
  THEME: "appearance--theme",
} as const;

const initialState: SettingsState = {
  ready: false,
  appearance: {
    font: {
      fontSizeMultiplier: 1,
      useSystemFontSize: false,
    },
    general: {
      userInstanceUrlDisplay: OInstanceUrlDisplayMode.Never,
      profileLabel: OProfileLabelType.Instance,
    },
    posts: {
      blurNsfw: OPostBlurNsfw.InFeed,
      type: OPostAppearanceType.Large,
    },
    compact: {
      thumbnailsPosition: OCompactThumbnailPositionType.Left,
      showVotingButtons: true,
    },
    voting: {
      voteDisplayMode: OVoteDisplayMode.Total,
    },
    dark: {
      usingSystemDarkMode: true,
      userDarkMode: false,
      pureBlack: true,
    },
    deviceMode: "ios",
    theme: "default",
  },
  general: {
    comments: {
      collapseCommentThreads: OCommentThreadCollapse.Never,
      sort: OCommentDefaultSort.Hot,
    },
    posts: {
      disableMarkingRead: false,
      markReadOnScroll: false,
      showHideReadButton: false,
    },
  },
};

// We continue using localstorage for specific items because indexeddb is slow
// and we don't want to wait for it to load before rendering the app and cause flickering
const stateWithLocalstorageItems: SettingsState = merge(initialState, {
  appearance: {
    font: {
      fontSizeMultiplier: get(LOCALSTORAGE_KEYS.FONT.FONT_SIZE_MULTIPLIER),
      useSystemFontSize: get(LOCALSTORAGE_KEYS.FONT.USE_SYSTEM),
    },
    dark: {
      usingSystemDarkMode: get(LOCALSTORAGE_KEYS.DARK.USE_SYSTEM),
      userDarkMode: get(LOCALSTORAGE_KEYS.DARK.USER_MODE),
      pureBlack: get(LOCALSTORAGE_KEYS.DARK.PURE_BLACK),
    },
    deviceMode: get(LOCALSTORAGE_KEYS.DEVICE_MODE),
    theme: get(LOCALSTORAGE_KEYS.THEME),
  },
});

export const defaultCommentDepthSelector = createSelector(
  [
    (state: RootState) =>
      state.settings.general.comments.collapseCommentThreads,
  ],
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
      (_, action: PayloadAction<SettingsState>) => action.payload
    );
  },
  reducers: {
    setFontSizeMultiplier(state, action: PayloadAction<number>) {
      state.appearance.font.fontSizeMultiplier = action.payload;
      set(LOCALSTORAGE_KEYS.FONT.FONT_SIZE_MULTIPLIER, action.payload);
    },
    setUseSystemFontSize(state, action: PayloadAction<boolean>) {
      state.appearance.font.useSystemFontSize = action.payload;
      set(LOCALSTORAGE_KEYS.FONT.USE_SYSTEM, action.payload);
    },
    setUserInstanceUrlDisplay(
      state,
      action: PayloadAction<InstanceUrlDisplayMode>
    ) {
      state.appearance.general.userInstanceUrlDisplay = action.payload;
      db.setSetting("user_instance_url_display", action.payload);
    },
    setProfileLabel(state, action: PayloadAction<ProfileLabelType>) {
      state.appearance.general.profileLabel = action.payload;
      db.setSetting("profile_label", action.payload);
    },
    setCommentsCollapsed(state, action: PayloadAction<CommentThreadCollapse>) {
      state.general.comments.collapseCommentThreads = action.payload;
      db.setSetting("collapse_comment_threads", action.payload);
    },
    setPostAppearance(state, action: PayloadAction<PostAppearanceType>) {
      state.appearance.posts.type = action.payload;
      db.setSetting("post_appearance_type", action.payload);
    },
    setNsfwBlur(state, action: PayloadAction<PostBlurNsfwType>) {
      state.appearance.posts.blurNsfw = action.payload;
      // Per user setting is updated in StoreProvider
    },
    setShowVotingButtons(state, action: PayloadAction<boolean>) {
      state.appearance.compact.showVotingButtons = action.payload;
      db.setSetting("compact_show_voting_buttons", action.payload);
    },
    setThumbnailPosition(
      state,
      action: PayloadAction<CompactThumbnailPositionType>
    ) {
      state.appearance.compact.thumbnailsPosition = action.payload;
      db.setSetting("compact_thumbnail_position_type", action.payload);
    },
    setVoteDisplayMode(state, action: PayloadAction<VoteDisplayMode>) {
      state.appearance.voting.voteDisplayMode = action.payload;
      db.setSetting("vote_display_mode", action.payload);
    },
    setUserDarkMode(state, action: PayloadAction<boolean>) {
      state.appearance.dark.userDarkMode = action.payload;
      set(LOCALSTORAGE_KEYS.DARK.USER_MODE, action.payload);
    },
    setPureBlack(state, action: PayloadAction<boolean>) {
      state.appearance.dark.pureBlack = action.payload;
      set(LOCALSTORAGE_KEYS.DARK.PURE_BLACK, action.payload);
    },
    setUseSystemDarkMode(state, action: PayloadAction<boolean>) {
      state.appearance.dark.usingSystemDarkMode = action.payload;
      set(LOCALSTORAGE_KEYS.DARK.USE_SYSTEM, action.payload);
    },
    setDeviceMode(state, action: PayloadAction<Mode>) {
      state.appearance.deviceMode = action.payload;

      set(LOCALSTORAGE_KEYS.DEVICE_MODE, action.payload);
    },
    setDefaultCommentSort(state, action: PayloadAction<CommentDefaultSort>) {
      state.general.comments.sort = action.payload;
      db.setSetting("default_comment_sort", action.payload);
    },
    setDisableMarkingPostsRead(state, action: PayloadAction<boolean>) {
      state.general.posts.disableMarkingRead = action.payload;
      db.setSetting("disable_marking_posts_read", action.payload);
    },
    setMarkPostsReadOnScroll(state, action: PayloadAction<boolean>) {
      state.general.posts.markReadOnScroll = action.payload;

      db.setSetting("mark_read_on_scroll", action.payload);
    },
    setShowHideReadButton(state, action: PayloadAction<boolean>) {
      state.general.posts.showHideReadButton = action.payload;

      db.setSetting("show_hide_read_button", action.payload);
    },
    setTheme(state, action: PayloadAction<AppThemeType>) {
      state.appearance.theme = action.payload;
      set(LOCALSTORAGE_KEYS.THEME, action.payload);
    },

    resetSettings: () => ({
      ...initialState,
      ready: true,
    }),

    settingsReady: (state) => {
      state.ready = true;
    },
  },
});

export const markReadOnScrollSelector = (state: RootState) => {
  return (
    !state.settings.general.posts.disableMarkingRead &&
    state.settings.general.posts.markReadOnScroll
  );
};

export const setBlurNsfwState =
  (blurNsfw: PostBlurNsfwType) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    dispatch(setNsfwBlur(blurNsfw));

    db.setSetting("blur_nsfw", blurNsfw, {
      user_handle: userHandle,
    });
  };

export const getBlurNsfw =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    const blurNsfw = await db.getSetting("blur_nsfw", {
      user_handle: userHandle,
    });

    dispatch(setNsfwBlur(blurNsfw ?? initialState.appearance.posts.blurNsfw));
  };

export const fetchSettingsFromDatabase = createAsyncThunk<SettingsState>(
  "appearance/fetchSettingsFromDatabase",
  async (_, thunkApi) => {
    const result = db.transaction("r", db.settings, async () => {
      const state = thunkApi.getState() as RootState;
      const collapse_comment_threads = await db.getSetting(
        "collapse_comment_threads"
      );
      const user_instance_url_display = await db.getSetting(
        "user_instance_url_display"
      );
      const profile_label = await db.getSetting("profile_label");
      const post_appearance_type = await db.getSetting("post_appearance_type");
      const blur_nsfw = await db.getSetting("blur_nsfw");
      const compact_thumbnail_position_type = await db.getSetting(
        "compact_thumbnail_position_type"
      );
      const compact_show_voting_buttons = await db.getSetting(
        "compact_show_voting_buttons"
      );
      const vote_display_mode = await db.getSetting("vote_display_mode");
      const default_comment_sort = await db.getSetting("default_comment_sort");
      const disable_marking_posts_read = await db.getSetting(
        "disable_marking_posts_read"
      );
      const mark_read_on_scroll = await db.getSetting("mark_read_on_scroll");
      const show_hide_read_button = await db.getSetting(
        "show_hide_read_button"
      );

      return {
        ...state.settings,
        ready: true,
        appearance: {
          ...state.settings.appearance,
          general: {
            userInstanceUrlDisplay:
              user_instance_url_display ??
              initialState.appearance.general.userInstanceUrlDisplay,
            profileLabel:
              profile_label ?? initialState.appearance.general.profileLabel,
          },
          posts: {
            type: post_appearance_type ?? initialState.appearance.posts.type,
            blurNsfw: blur_nsfw ?? initialState.appearance.posts.blurNsfw,
          },
          compact: {
            thumbnailsPosition:
              compact_thumbnail_position_type ??
              initialState.appearance.compact.thumbnailsPosition,
            showVotingButtons:
              compact_show_voting_buttons ??
              initialState.appearance.compact.showVotingButtons,
          },
          voting: {
            voteDisplayMode:
              vote_display_mode ??
              initialState.appearance.voting.voteDisplayMode,
          },
        },
        general: {
          comments: {
            collapseCommentThreads:
              collapse_comment_threads ??
              initialState.general.comments.collapseCommentThreads,
            sort: default_comment_sort ?? initialState.general.comments.sort,
          },
          posts: {
            disableMarkingRead:
              disable_marking_posts_read ??
              initialState.general.posts.disableMarkingRead,
            markReadOnScroll:
              mark_read_on_scroll ??
              initialState.general.posts.markReadOnScroll,
            showHideReadButton:
              show_hide_read_button ??
              initialState.general.posts.showHideReadButton,
          },
        },
      };
    });

    try {
      return await result;
    } catch (error) {
      // In the event of a database error, attempt to render the UI anyways
      thunkApi.dispatch(settingsReady());

      throw error;
    }
  }
);

export const {
  setFontSizeMultiplier,
  setUseSystemFontSize,
  setUserInstanceUrlDisplay,
  setProfileLabel,
  setCommentsCollapsed,
  setNsfwBlur,
  setPostAppearance,
  setThumbnailPosition,
  setShowVotingButtons,
  setVoteDisplayMode,
  setUserDarkMode,
  setUseSystemDarkMode,
  setDeviceMode,
  setDefaultCommentSort,
  settingsReady,
  setDisableMarkingPostsRead,
  setMarkPostsReadOnScroll,
  setShowHideReadButton,
  setTheme,
  setPureBlack,
} = appearanceSlice.actions;

export default appearanceSlice.reducer;

export function getDeviceMode(): Mode {
  // md mode is beta, so default ios for all devices
  return get(LOCALSTORAGE_KEYS.DEVICE_MODE) ?? "ios";
}
