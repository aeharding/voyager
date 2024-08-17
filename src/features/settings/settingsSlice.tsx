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
  AutoplayMediaType,
  OAutoplayMediaType,
  CommentsThemeType,
  VotesThemeType,
  ShowSubscribedIcon,
  OShowSubscribedIcon,
} from "../../services/db";
import { LOCALSTORAGE_KEYS, get, set } from "./syncStorage";
import { Mode } from "@ionic/core";
import { SortType } from "lemmy-js-client";
import { loggedInSelector } from "../auth/authSelectors";
import Dexie from "dexie";

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
  databaseError: Error | undefined;
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
      rememberType: boolean;
      embedCrossposts: boolean;
      showCommunityIcons: boolean;
      embedExternalMedia: boolean;
      alwaysShowAuthor: boolean;
      communityAtTop: boolean;
      subscribedIcon: ShowSubscribedIcon;
    };
    large: {
      showVotingButtons: boolean;
    };
    compact: {
      thumbnailsPosition: CompactThumbnailPositionType;
      showVotingButtons: boolean;
      thumbnailSize: CompactThumbnailSizeType;
      showSelfPostThumbnails: boolean;
    };
    voting: {
      voteDisplayMode: VoteDisplayMode;
    };
    dark: {
      usingSystemDarkMode: boolean;
      userDarkMode: boolean;
      pureBlack: boolean;
      quickSwitch: boolean;
    };
    deviceMode: Mode;
    theme: AppThemeType;
    commentsTheme: CommentsThemeType;
    votesTheme: VotesThemeType;
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
      showCollapsed: boolean;
      rememberCommunitySort: boolean;
    };
    posts: {
      sort: SortType;
      disableMarkingRead: boolean;
      markReadOnScroll: boolean;
      showHideReadButton: boolean;
      showHiddenInCommunities: boolean;
      autoHideRead: boolean;
      disableAutoHideInCommunities: boolean;
      infiniteScrolling: boolean;
      upvoteOnSave: boolean;
      rememberCommunitySort: boolean;
      autoplayMedia: AutoplayMediaType;
    };
    safari: {
      alwaysUseReaderMode: boolean;
    };
    enableHapticFeedback: boolean;
    linkHandler: LinkHandlerType;
    preferNativeApps: boolean;
    defaultFeed: DefaultFeedType | undefined;
    noSubscribedInFeed: boolean;
    thumbnailinatorEnabled: boolean;
  };
  blocks: {
    keywords: string[];
    websites: string[];
  };
}

export const initialState: SettingsState = {
  ready: false,
  databaseError: undefined,
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
      rememberType: false,
      embedCrossposts: true,
      showCommunityIcons: true,
      embedExternalMedia: true,
      alwaysShowAuthor: false,
      communityAtTop: false,
      subscribedIcon: OShowSubscribedIcon.Never,
    },
    large: {
      showVotingButtons: true,
    },
    compact: {
      thumbnailsPosition: OCompactThumbnailPositionType.Left,
      showVotingButtons: true,
      thumbnailSize: OCompactThumbnailSizeType.Small,
      showSelfPostThumbnails: true,
    },
    voting: {
      voteDisplayMode: OVoteDisplayMode.Total,
    },
    dark: {
      usingSystemDarkMode: true,
      userDarkMode: false,
      pureBlack: true,
      quickSwitch: true,
    },
    deviceMode: "ios",
    theme: "default",
    commentsTheme: "rainbow",
    votesTheme: "lemmy",
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
      showCollapsed: false,
      rememberCommunitySort: false,
    },
    posts: {
      sort: "Active",
      disableMarkingRead: false,
      markReadOnScroll: false,
      showHideReadButton: false,
      showHiddenInCommunities: false,
      autoHideRead: false,
      disableAutoHideInCommunities: false,
      infiniteScrolling: true,
      upvoteOnSave: false,
      rememberCommunitySort: false,
      autoplayMedia: OAutoplayMediaType.Always,
    },
    safari: {
      alwaysUseReaderMode: false,
    },
    enableHapticFeedback: true,
    linkHandler: OLinkHandlerType.InApp,
    preferNativeApps: true,
    defaultFeed: undefined,
    noSubscribedInFeed: false,
    thumbnailinatorEnabled: true,
  },
  blocks: {
    keywords: [],
    websites: [],
  },
};

// We continue using localstorage for specific items because indexeddb is slow
// and we don't want to wait for it to load before rendering the app and cause flickering
export const stateWithLocalstorageItems: SettingsState = merge(initialState, {
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
      case OCommentThreadCollapse.RootOnly:
      case OCommentThreadCollapse.All:
        return 1;
      case OCommentThreadCollapse.Never:
        return MAX_DEFAULT_COMMENT_DEPTH;
    }
  },
);

export const defaultThreadCollapse = createSelector(
  [
    (state: RootState) =>
      state.settings.general.comments.collapseCommentThreads,
  ],
  (collapseCommentThreads): string => {
    return collapseCommentThreads;
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
    setDatabaseError(state, action: PayloadAction<Error>) {
      state.databaseError = action.payload;
    },
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
    setShowCollapsedComment(state, action: PayloadAction<boolean>) {
      state.general.comments.showCollapsed = action.payload;
      db.setSetting("show_collapsed_comment", action.payload);
    },
    setPostAppearance(state, action: PayloadAction<PostAppearanceType>) {
      state.appearance.posts.type = action.payload;
      db.setSetting("post_appearance_type", action.payload);
    },
    setRememberPostAppearance(state, action: PayloadAction<boolean>) {
      state.appearance.posts.rememberType = action.payload;
      db.setSetting("remember_post_appearance_type", action.payload);
    },
    setNsfwBlur(state, action: PayloadAction<PostBlurNsfwType>) {
      state.appearance.posts.blurNsfw = action.payload;
      // Per user setting is updated in StoreProvider
    },
    setEmbedCrossposts(state, action: PayloadAction<boolean>) {
      state.appearance.posts.embedCrossposts = action.payload;
      db.setSetting("embed_crossposts", action.payload);
    },
    setShowCommunityIcons(state, action: PayloadAction<boolean>) {
      state.appearance.posts.showCommunityIcons = action.payload;
      db.setSetting("show_community_icons", action.payload);
    },
    setCommunityAtTop(state, action: PayloadAction<boolean>) {
      state.appearance.posts.communityAtTop = action.payload;

      db.setSetting("community_at_top", action.payload);
    },
    setFilteredKeywords(state, action: PayloadAction<string[]>) {
      state.blocks.keywords = action.payload;
      // Per user setting is updated in StoreProvider
    },
    setFilteredWebsites(state, action: PayloadAction<string[]>) {
      state.blocks.websites = action.payload;
      // Per user setting is updated in StoreProvider
    },
    setDefaultFeed(state, action: PayloadAction<DefaultFeedType | undefined>) {
      state.general.defaultFeed = action.payload;
      // Per user setting is updated in StoreProvider
    },
    setNoSubscribedInFeed(state, action: PayloadAction<boolean>) {
      state.general.noSubscribedInFeed = action.payload;
      db.setSetting("no_subscribed_in_feed", action.payload);
    },
    setThumbnailinatorEnabled(state, action: PayloadAction<boolean>) {
      state.general.thumbnailinatorEnabled = action.payload;
      db.setSetting("thumbnailinator_enabled", action.payload);
    },
    setEmbedExternalMedia(state, action: PayloadAction<boolean>) {
      state.appearance.posts.embedExternalMedia = action.payload;
      db.setSetting("embed_external_media", action.payload);
    },
    setAlwaysShowAuthor(state, action: PayloadAction<boolean>) {
      state.appearance.posts.alwaysShowAuthor = action.payload;
      db.setSetting("always_show_author", action.payload);
    },
    setAlwaysUseReaderMode(state, action: PayloadAction<boolean>) {
      state.general.safari.alwaysUseReaderMode = action.payload;
      db.setSetting("always_use_reader_mode", action.payload);
    },
    setLargeShowVotingButtons(state, action: PayloadAction<boolean>) {
      state.appearance.large.showVotingButtons = action.payload;
      db.setSetting("large_show_voting_buttons", action.payload);
    },
    setCompactShowVotingButtons(state, action: PayloadAction<boolean>) {
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
    setCompactShowSelfPostThumbnails(state, action: PayloadAction<boolean>) {
      state.appearance.compact.showSelfPostThumbnails = action.payload;
      db.setSetting("compact_show_self_post_thumbnails", action.payload);
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
    setQuickSwitchDarkMode(state, action: PayloadAction<boolean>) {
      state.appearance.dark.quickSwitch = action.payload;
      db.setSetting("quick_switch_dark_mode", action.payload);
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
    setDefaultPostSort(state, action: PayloadAction<SortType>) {
      state.general.posts.sort = action.payload;
      db.setSetting("default_post_sort", action.payload);
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
    setShowHiddenInCommunities(state, action: PayloadAction<boolean>) {
      state.general.posts.showHiddenInCommunities = action.payload;

      db.setSetting("show_hidden_in_communities", action.payload);
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
    setRememberCommunityPostSort(state, action: PayloadAction<boolean>) {
      state.general.posts.rememberCommunitySort = action.payload;

      db.setSetting("remember_community_post_sort", action.payload);
    },
    setRememberCommunityCommentSort(state, action: PayloadAction<boolean>) {
      state.general.comments.rememberCommunitySort = action.payload;

      db.setSetting("remember_community_comment_sort", action.payload);
    },
    setAutoplayMedia(state, action: PayloadAction<AutoplayMediaType>) {
      state.general.posts.autoplayMedia = action.payload;

      db.setSetting("autoplay_media", action.payload);
    },
    setTheme(state, action: PayloadAction<AppThemeType>) {
      state.appearance.theme = action.payload;
      set(LOCALSTORAGE_KEYS.THEME, action.payload);
    },
    setCommentsTheme(state, action: PayloadAction<CommentsThemeType>) {
      state.appearance.commentsTheme = action.payload;
      db.setSetting("comments_theme", action.payload);
    },
    setVotesTheme(state, action: PayloadAction<VotesThemeType>) {
      state.appearance.votesTheme = action.payload;
      db.setSetting("votes_theme", action.payload);
    },
    setEnableHapticFeedback(state, action: PayloadAction<boolean>) {
      state.general.enableHapticFeedback = action.payload;

      db.setSetting("enable_haptic_feedback", action.payload);
    },
    setLinkHandler(state, action: PayloadAction<LinkHandlerType>) {
      state.general.linkHandler = action.payload;

      db.setSetting("link_handler", action.payload);
    },
    setPreferNativeApps(state, action: PayloadAction<boolean>) {
      state.general.preferNativeApps = action.payload;

      db.setSetting("prefer_native_apps", action.payload);
    },
    setSubscribedIcon(state, action: PayloadAction<ShowSubscribedIcon>) {
      state.appearance.posts.subscribedIcon = action.payload;

      db.setSetting("subscribed_icon", action.payload);
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

export const getFilteredWebsites =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    const filteredWebsites = await db.getSetting("filtered_websites", {
      user_handle: userHandle,
    });

    dispatch(
      setFilteredWebsites(filteredWebsites ?? initialState.blocks.websites),
    );
  };

export const getDefaultFeed =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;
    const loggedIn = loggedInSelector(getState());

    let defaultFeed;

    try {
      defaultFeed = await db.getSetting("default_feed", {
        user_handle: userHandle,
      });
    } catch (error) {
      console.error("Error receiving default feed", error);
    }

    dispatch(
      setDefaultFeed(
        defaultFeed ?? {
          type: loggedIn ? ODefaultFeedType.Home : ODefaultFeedType.All,
        },
      ),
    );
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

export const updateFilteredWebsites =
  (filteredWebsites: string[]) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    dispatch(setFilteredWebsites(filteredWebsites));

    db.setSetting("filtered_websites", filteredWebsites, {
      user_handle: userHandle,
    });
  };

export const fetchSettingsFromDatabase = createAsyncThunk<SettingsState>(
  "appearance/fetchSettingsFromDatabase",
  async (_, thunkApi) => {
    const result = db.transaction("r", db.settings, async () => {
      const state = thunkApi.getState() as RootState;
      const comments_theme = await db.getSetting("comments_theme");
      const votes_theme = await db.getSetting("votes_theme");
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
      const remember_post_appearance_type = await db.getSetting(
        "remember_post_appearance_type",
      );
      const blur_nsfw = await db.getSetting("blur_nsfw");
      const embed_crossposts = await db.getSetting("embed_crossposts");
      const show_community_icons = await db.getSetting("show_community_icons");
      const community_at_top = await db.getSetting("community_at_top");
      const large_show_voting_buttons = await db.getSetting(
        "large_show_voting_buttons",
      );
      const compact_thumbnail_position_type = await db.getSetting(
        "compact_thumbnail_position_type",
      );
      const compact_show_voting_buttons = await db.getSetting(
        "compact_show_voting_buttons",
      );
      const compact_thumbnail_size = await db.getSetting(
        "compact_thumbnail_size",
      );
      const compact_show_self_post_thumbnails = await db.getSetting(
        "compact_show_self_post_thumbnails",
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
      const show_hidden_in_communities = await db.getSetting(
        "show_hidden_in_communities",
      );
      const auto_hide_read = await db.getSetting("auto_hide_read");
      const disable_auto_hide_in_communities = await db.getSetting(
        "disable_auto_hide_in_communities",
      );
      const infinite_scrolling = await db.getSetting("infinite_scrolling");
      const upvote_on_save = await db.getSetting("upvote_on_save");
      const remember_community_post_sort = await db.getSetting(
        "remember_community_post_sort",
      );
      const remember_community_comment_sort = await db.getSetting(
        "remember_community_comment_sort",
      );
      const autoplay_media = await db.getSetting("autoplay_media");
      const enable_haptic_feedback = await db.getSetting(
        "enable_haptic_feedback",
      );
      const link_handler = await db.getSetting("link_handler");
      const prefer_native_apps = await db.getSetting("prefer_native_apps");
      const filtered_keywords = await db.getSetting("filtered_keywords");
      const filtered_websites = await db.getSetting("filtered_websites");
      const touch_friendly_links = await db.getSetting("touch_friendly_links");
      const show_comment_images = await db.getSetting("show_comment_images");
      const show_collapsed_comment = await db.getSetting(
        "show_collapsed_comment",
      );
      const no_subscribed_in_feed = await db.getSetting(
        "no_subscribed_in_feed",
      );
      const thumbnailinator_enabled = await db.getSetting(
        "thumbnailinator_enabled",
      );
      const embed_external_media = await db.getSetting("embed_external_media");
      const always_show_author = await db.getSetting("always_show_author");
      const always_use_reader_mode = await db.getSetting(
        "always_use_reader_mode",
      );
      const default_post_sort = await db.getSetting("default_post_sort");
      const quick_switch_dark_mode = await db.getSetting(
        "quick_switch_dark_mode",
      );
      const subscribed_icon = await db.getSetting("subscribed_icon");

      return {
        ...state.settings,
        ready: true,
        appearance: {
          ...state.settings.appearance,
          commentsTheme:
            comments_theme ?? initialState.appearance.commentsTheme,
          votesTheme: votes_theme ?? initialState.appearance.votesTheme,
          general: {
            userInstanceUrlDisplay:
              user_instance_url_display ??
              initialState.appearance.general.userInstanceUrlDisplay,
            profileLabel:
              profile_label ?? initialState.appearance.general.profileLabel,
          },
          dark: {
            ...state.settings.appearance.dark,
            quickSwitch:
              quick_switch_dark_mode ??
              initialState.appearance.dark.quickSwitch,
          },
          posts: {
            type: post_appearance_type ?? initialState.appearance.posts.type,
            rememberType:
              remember_post_appearance_type ??
              initialState.appearance.posts.rememberType,
            blurNsfw: blur_nsfw ?? initialState.appearance.posts.blurNsfw,
            embedCrossposts:
              embed_crossposts ?? initialState.appearance.posts.embedCrossposts,
            showCommunityIcons:
              show_community_icons ??
              initialState.appearance.posts.showCommunityIcons,
            embedExternalMedia:
              embed_external_media ??
              initialState.appearance.posts.embedExternalMedia,
            alwaysShowAuthor:
              always_show_author ??
              initialState.appearance.posts.alwaysShowAuthor,
            communityAtTop:
              community_at_top ?? initialState.appearance.posts.communityAtTop,
            subscribedIcon:
              subscribed_icon ?? initialState.appearance.posts.subscribedIcon,
          },
          large: {
            showVotingButtons:
              large_show_voting_buttons ??
              initialState.appearance.large.showVotingButtons,
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
            showSelfPostThumbnails:
              compact_show_self_post_thumbnails ??
              initialState.appearance.compact.showSelfPostThumbnails,
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
            showCollapsed:
              show_collapsed_comment ??
              initialState.general.comments.showCollapsed,
            rememberCommunitySort:
              remember_community_comment_sort ??
              initialState.general.comments.rememberCommunitySort,
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
            showHiddenInCommunities:
              show_hidden_in_communities ??
              initialState.general.posts.showHiddenInCommunities,
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
            sort: default_post_sort ?? initialState.general.posts.sort,
            rememberCommunitySort:
              remember_community_post_sort ??
              initialState.general.posts.rememberCommunitySort,
            autoplayMedia:
              autoplay_media ?? initialState.general.posts.autoplayMedia,
          },
          safari: {
            alwaysUseReaderMode:
              always_use_reader_mode ??
              initialState.general.safari.alwaysUseReaderMode,
          },
          linkHandler: link_handler ?? initialState.general.linkHandler,
          preferNativeApps:
            prefer_native_apps ?? initialState.general.preferNativeApps,
          enableHapticFeedback:
            enable_haptic_feedback ?? initialState.general.enableHapticFeedback,
          defaultFeed: initialState.general.defaultFeed,
          noSubscribedInFeed:
            no_subscribed_in_feed ?? initialState.general.noSubscribedInFeed,
          thumbnailinatorEnabled:
            thumbnailinator_enabled ??
            initialState.general.thumbnailinatorEnabled,
        },
        blocks: {
          keywords: filtered_keywords ?? initialState.blocks.keywords,
          websites: filtered_websites ?? initialState.blocks.websites,
        },
      };
    });

    try {
      return await result;
    } catch (error) {
      if (error instanceof Dexie.MissingAPIError) {
        thunkApi.dispatch(setDatabaseError(error));
      }

      // In the event of a database error, attempt to render the UI anyways
      thunkApi.dispatch(settingsReady());

      throw error;
    }
  },
);

export const {
  setCommentsTheme,
  setVotesTheme,
  setDatabaseError,
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
  setEmbedCrossposts,
  setShowCommunityIcons,
  setCommunityAtTop,
  setFilteredKeywords,
  setFilteredWebsites,
  setPostAppearance,
  setRememberPostAppearance,
  setThumbnailPosition,
  setLargeShowVotingButtons,
  setCompactShowVotingButtons,
  setCompactThumbnailSize,
  setCompactShowSelfPostThumbnails,
  setVoteDisplayMode,
  setUserDarkMode,
  setUseSystemDarkMode,
  setDeviceMode,
  setDefaultCommentSort,
  setDefaultPostSort,
  settingsReady,
  setDisableMarkingPostsRead,
  setMarkPostsReadOnScroll,
  setShowHideReadButton,
  setShowHiddenInCommunities,
  setAutoHideRead,
  setDisableAutoHideInCommunities,
  setInfiniteScrolling,
  setUpvoteOnSave,
  setRememberCommunityPostSort,
  setRememberCommunityCommentSort,
  setAutoplayMedia,
  setTheme,
  setEnableHapticFeedback,
  setLinkHandler,
  setPreferNativeApps,
  setPureBlack,
  setDefaultFeed,
  setNoSubscribedInFeed,
  setThumbnailinatorEnabled,
  setEmbedExternalMedia,
  setAlwaysShowAuthor,
  setAlwaysUseReaderMode,
  setShowCollapsedComment,
  setQuickSwitchDarkMode,
  setSubscribedIcon,
} = appearanceSlice.actions;

export default appearanceSlice.reducer;
