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
  CompactThumbnailSizeType,
  OCompactThumbnailSizeType,
  LinkHandlerType,
  OLinkHandlerType,
  JumpButtonPositionType,
  OJumpButtonPositionType,
  DefaultFeedType,
  ODefaultFeedType,
  TapToCollapseType,
  OTapToCollapseType,
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
      thumbnailSize: CompactThumbnailSizeType;
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
      tapToCollapse: TapToCollapseType;
      sort: CommentDefaultSort;
      showJumpButton: boolean;
      jumpButtonPosition: JumpButtonPositionType;
      highlightNewAccount: boolean;
      touchFriendlyLinks: boolean;
      showCommentImages: boolean;
    };
    posts: {
      disableMarkingRead: boolean;
      markReadOnScroll: boolean;
      showHideReadButton: boolean;
      autoHideRead: boolean;
      disableAutoHideInCommunities: boolean;
      infiniteScrolling: boolean;
      upvoteOnSave: boolean;
    };
    enableHapticFeedback: boolean;
    linkHandler: LinkHandlerType;
    defaultFeed: DefaultFeedType | undefined;
    noSubscribedInFeed: boolean;
  };
  blocks: {
    keywords: string[];
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
      thumbnailSize: OCompactThumbnailSizeType.Small,
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
      tapToCollapse: OTapToCollapseType.Both,
      sort: OCommentDefaultSort.Hot,
      showJumpButton: false,
      jumpButtonPosition: OJumpButtonPositionType.RightBottom,
      highlightNewAccount: true,
      touchFriendlyLinks: true,
      showCommentImages: true,
    },
    posts: {
      disableMarkingRead: false,
      markReadOnScroll: false,
      showHideReadButton: false,
      autoHideRead: false,
      disableAutoHideInCommunities: false,
      infiniteScrolling: true,
      upvoteOnSave: false,
    },
    enableHapticFeedback: true,
    linkHandler: OLinkHandlerType.InApp,
    defaultFeed: undefined,
    noSubscribedInFeed: false,
  },
  blocks: {
    keywords: [],
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
  },
);

export const appearanceSlice = createSlice({
  name: "appearance",
  initialState: stateWithLocalstorageItems,
  extraReducers: (builder) => {
    builder.addCase(
      fetchSettingsFromDatabase.fulfilled,
      (_, action: PayloadAction<SettingsState>) => action.payload,
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
      action: PayloadAction<InstanceUrlDisplayMode>,
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
    setTapToCollapse(state, action: PayloadAction<TapToCollapseType>) {
      state.general.comments.tapToCollapse = action.payload;
      db.setSetting("tap_to_collapse", action.payload);
    },
    setShowJumpButton(state, action: PayloadAction<boolean>) {
      state.general.comments.showJumpButton = action.payload;
      db.setSetting("show_jump_button", action.payload);
    },
    setJumpButtonPosition(
      state,
      action: PayloadAction<JumpButtonPositionType>,
    ) {
      state.general.comments.jumpButtonPosition = action.payload;
      db.setSetting("jump_button_position", action.payload);
    },
    setHighlightNewAccount(state, action: PayloadAction<boolean>) {
      state.general.comments.highlightNewAccount = action.payload;
      db.setSetting("highlight_new_account", action.payload);
    },
    setTouchFriendlyLinks(state, action: PayloadAction<boolean>) {
      state.general.comments.touchFriendlyLinks = action.payload;
      db.setSetting("touch_friendly_links", action.payload);
    },
    setShowCommentImages(state, action: PayloadAction<boolean>) {
      state.general.comments.showCommentImages = action.payload;
      db.setSetting("show_comment_images", action.payload);
    },
    setPostAppearance(state, action: PayloadAction<PostAppearanceType>) {
      state.appearance.posts.type = action.payload;
      db.setSetting("post_appearance_type", action.payload);
    },
    setNsfwBlur(state, action: PayloadAction<PostBlurNsfwType>) {
      state.appearance.posts.blurNsfw = action.payload;
      // Per user setting is updated in StoreProvider
    },
    setFilteredKeywords(state, action: PayloadAction<string[]>) {
      state.blocks.keywords = action.payload;
      // Per user setting is updated in StoreProvider
    },
    setDefaultFeed(state, action: PayloadAction<DefaultFeedType>) {
      state.general.defaultFeed = action.payload;
      // Per user setting is updated in StoreProvider
    },
    setNoSubscribedInFeed(state, action: PayloadAction<boolean>) {
      state.general.noSubscribedInFeed = action.payload;
      db.setSetting("no_subscribed_in_feed", action.payload);
    },
    setShowVotingButtons(state, action: PayloadAction<boolean>) {
      state.appearance.compact.showVotingButtons = action.payload;
      db.setSetting("compact_show_voting_buttons", action.payload);
    },
    setCompactThumbnailSize(
      state,
      action: PayloadAction<CompactThumbnailSizeType>,
    ) {
      state.appearance.compact.thumbnailSize = action.payload;
      db.setSetting("compact_thumbnail_size", action.payload);
    },
    setThumbnailPosition(
      state,
      action: PayloadAction<CompactThumbnailPositionType>,
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
    setAutoHideRead(state, action: PayloadAction<boolean>) {
      state.general.posts.autoHideRead = action.payload;

      db.setSetting("auto_hide_read", action.payload);
    },
    setDisableAutoHideInCommunities(state, action: PayloadAction<boolean>) {
      state.general.posts.disableAutoHideInCommunities = action.payload;

      db.setSetting("disable_auto_hide_in_communities", action.payload);
    },
    setInfiniteScrolling(state, action: PayloadAction<boolean>) {
      state.general.posts.infiniteScrolling = action.payload;

      db.setSetting("infinite_scrolling", action.payload);
    },
    setUpvoteOnSave(state, action: PayloadAction<boolean>) {
      state.general.posts.upvoteOnSave = action.payload;

      db.setSetting("upvote_on_save", action.payload);
    },
    setTheme(state, action: PayloadAction<AppThemeType>) {
      state.appearance.theme = action.payload;
      set(LOCALSTORAGE_KEYS.THEME, action.payload);
    },
    setEnableHapticFeedback(state, action: PayloadAction<boolean>) {
      state.general.enableHapticFeedback = action.payload;

      db.setSetting("enable_haptic_feedback", action.payload);
    },
    setLinkHandler(state, action: PayloadAction<LinkHandlerType>) {
      state.general.linkHandler = action.payload;

      db.setSetting("link_handler", action.payload);
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

export const getFilteredKeywords =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    const filteredKeywords = await db.getSetting("filtered_keywords", {
      user_handle: userHandle,
    });

    dispatch(
      setFilteredKeywords(filteredKeywords ?? initialState.blocks.keywords),
    );
  };

export const getDefaultFeed =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    const defaultFeed = await db.getSetting("default_feed", {
      user_handle: userHandle,
    });

    dispatch(setDefaultFeed(defaultFeed ?? { type: ODefaultFeedType.Home }));
  };

export const updateDefaultFeed =
  (defaultFeed: DefaultFeedType) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    dispatch(setDefaultFeed(defaultFeed ?? initialState.general.defaultFeed));

    db.setSetting("default_feed", defaultFeed, {
      user_handle: userHandle,
    });
  };

export const updateFilteredKeywords =
  (filteredKeywords: string[]) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    dispatch(setFilteredKeywords(filteredKeywords));

    db.setSetting("filtered_keywords", filteredKeywords, {
      user_handle: userHandle,
    });
  };

export const fetchSettingsFromDatabase = createAsyncThunk<SettingsState>(
  "appearance/fetchSettingsFromDatabase",
  async (_, thunkApi) => {
    const result = db.transaction("r", db.settings, async () => {
      const state = thunkApi.getState() as RootState;
      const collapse_comment_threads = await db.getSetting(
        "collapse_comment_threads",
      );
      const tap_to_collapse = await db.getSetting("tap_to_collapse");
      const show_jump_button = await db.getSetting("show_jump_button");
      const jump_button_position = await db.getSetting("jump_button_position");
      const highlight_new_account = await db.getSetting(
        "highlight_new_account",
      );
      const user_instance_url_display = await db.getSetting(
        "user_instance_url_display",
      );
      const profile_label = await db.getSetting("profile_label");
      const post_appearance_type = await db.getSetting("post_appearance_type");
      const blur_nsfw = await db.getSetting("blur_nsfw");
      const compact_thumbnail_position_type = await db.getSetting(
        "compact_thumbnail_position_type",
      );
      const compact_show_voting_buttons = await db.getSetting(
        "compact_show_voting_buttons",
      );
      const compact_thumbnail_size = await db.getSetting(
        "compact_thumbnail_size",
      );
      const vote_display_mode = await db.getSetting("vote_display_mode");
      const default_comment_sort = await db.getSetting("default_comment_sort");
      const disable_marking_posts_read = await db.getSetting(
        "disable_marking_posts_read",
      );
      const mark_read_on_scroll = await db.getSetting("mark_read_on_scroll");
      const show_hide_read_button = await db.getSetting(
        "show_hide_read_button",
      );
      const auto_hide_read = await db.getSetting("auto_hide_read");
      const disable_auto_hide_in_communities = await db.getSetting(
        "disable_auto_hide_in_communities",
      );
      const infinite_scrolling = await db.getSetting("infinite_scrolling");
      const upvote_on_save = await db.getSetting("upvote_on_save");
      const enable_haptic_feedback = await db.getSetting(
        "enable_haptic_feedback",
      );
      const link_handler = await db.getSetting("link_handler");
      const filtered_keywords = await db.getSetting("filtered_keywords");
      const touch_friendly_links = await db.getSetting("touch_friendly_links");
      const show_comment_images = await db.getSetting("show_comment_images");
      const no_subscribed_in_feed = await db.getSetting(
        "no_subscribed_in_feed",
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
            thumbnailSize:
              compact_thumbnail_size ??
              initialState.appearance.compact.thumbnailSize,
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
            tapToCollapse:
              tap_to_collapse ?? initialState.general.comments.tapToCollapse,
            sort: default_comment_sort ?? initialState.general.comments.sort,
            showJumpButton:
              show_jump_button ?? initialState.general.comments.showJumpButton,
            jumpButtonPosition:
              jump_button_position ??
              initialState.general.comments.jumpButtonPosition,
            highlightNewAccount:
              highlight_new_account ??
              initialState.general.comments.highlightNewAccount,
            touchFriendlyLinks:
              touch_friendly_links ??
              initialState.general.comments.touchFriendlyLinks,
            showCommentImages:
              show_comment_images ??
              initialState.general.comments.showCommentImages,
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
            autoHideRead:
              auto_hide_read ?? initialState.general.posts.autoHideRead,
            disableAutoHideInCommunities:
              disable_auto_hide_in_communities ??
              initialState.general.posts.disableAutoHideInCommunities,
            infiniteScrolling:
              infinite_scrolling ??
              initialState.general.posts.infiniteScrolling,
            upvoteOnSave:
              upvote_on_save ?? initialState.general.posts.upvoteOnSave,
          },
          linkHandler: link_handler ?? initialState.general.linkHandler,
          enableHapticFeedback:
            enable_haptic_feedback ?? initialState.general.enableHapticFeedback,
          defaultFeed: initialState.general.defaultFeed,
          noSubscribedInFeed:
            no_subscribed_in_feed ?? initialState.general.noSubscribedInFeed,
        },
        blocks: {
          keywords: filtered_keywords ?? initialState.blocks.keywords,
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
  },
);

export const {
  setFontSizeMultiplier,
  setUseSystemFontSize,
  setUserInstanceUrlDisplay,
  setProfileLabel,
  setCommentsCollapsed,
  setTapToCollapse,
  setShowJumpButton,
  setJumpButtonPosition,
  setHighlightNewAccount,
  setTouchFriendlyLinks,
  setShowCommentImages,
  setNsfwBlur,
  setFilteredKeywords,
  setPostAppearance,
  setThumbnailPosition,
  setShowVotingButtons,
  setCompactThumbnailSize,
  setVoteDisplayMode,
  setUserDarkMode,
  setUseSystemDarkMode,
  setDeviceMode,
  setDefaultCommentSort,
  settingsReady,
  setDisableMarkingPostsRead,
  setMarkPostsReadOnScroll,
  setShowHideReadButton,
  setAutoHideRead,
  setDisableAutoHideInCommunities,
  setInfiniteScrolling,
  setUpvoteOnSave,
  setTheme,
  setEnableHapticFeedback,
  setLinkHandler,
  setPureBlack,
  setDefaultFeed,
  setNoSubscribedInFeed,
} = appearanceSlice.actions;

export default appearanceSlice.reducer;

export function getDeviceMode(): Mode {
  // md mode is beta, so default ios for all devices
  return get(LOCALSTORAGE_KEYS.DEVICE_MODE) ?? "ios";
}
