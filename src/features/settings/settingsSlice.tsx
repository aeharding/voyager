/* eslint perfectionist/sort-objects: ["warn", { partitionByNewLine: true }] */
/* eslint perfectionist/sort-variable-declarations: ["warn"] */

import { Mode } from "@ionic/core";
import {
  PayloadAction,
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import Dexie from "dexie";
import { cloneDeep, merge } from "es-toolkit";
import { PostSortType } from "lemmy-js-client";

import { loggedInSelector } from "#/features/auth/authSelectors";
import { MAX_DEFAULT_COMMENT_DEPTH } from "#/helpers/lemmy";
import { DeepPartial } from "#/helpers/typescript";
import {
  AppThemeType,
  AutoplayMediaType,
  CommentDefaultSort,
  CommentThreadCollapse,
  CommentsThemeType,
  CompactThumbnailPositionType,
  CompactThumbnailSizeType,
  DefaultFeedType,
  InstanceUrlDisplayMode,
  JumpButtonPositionType,
  LinkHandlerType,
  OAutoplayMediaType,
  OCommentDefaultSort,
  OCommentThreadCollapse,
  OCompactThumbnailPositionType,
  OCompactThumbnailSizeType,
  ODefaultFeedType,
  OInstanceUrlDisplayMode,
  OJumpButtonPositionType,
  OLinkHandlerType,
  OPostAppearanceType,
  OPostBlurNsfw,
  OProfileLabelType,
  OShowSubscribedIcon,
  OTapToCollapseType,
  OVoteDisplayMode,
  PostAppearanceType,
  PostBlurNsfwType,
  ProfileLabelType,
  ShowSubscribedIcon,
  TapToCollapseType,
  VoteDisplayMode,
  VotesThemeType,
  db,
} from "#/services/db";
import { AppDispatch, RootState } from "#/store";

import {
  LOCALSTORAGE_KEYS,
  get,
  getLocalStorageInitialState,
  set,
} from "./syncStorage";

export {
  type CommentThreadCollapse,
  type PostAppearanceType,
  type CompactThumbnailPositionType,
  OCommentThreadCollapse,
  OPostAppearanceType,
  OCompactThumbnailPositionType,
} from "#/services/db";

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
      sort: PostSortType;
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
  tags: {
    enabled: boolean;
    trackVotes: boolean;
    hideInstance: boolean;
    saveSource: boolean;
  };
  blocks: {
    keywords: string[];
    websites: string[];
  };
}

/**
 * We continue using localstorage for specific items because indexeddb is slow
 * and we don't want to wait for it to load before rendering the app and cause flickering
 */
export function buildInitialState(): SettingsState {
  const localStorageInitialState: DeepPartial<SettingsState> =
    getLocalStorageInitialState();

  return merge(cloneDeep(initialState), localStorageInitialState);
}

export const initialState: SettingsState = {
  ready: false,

  databaseError: undefined,

  appearance: {
    commentsTheme: "rainbow",
    compact: {
      showSelfPostThumbnails: true,
      showVotingButtons: true,
      thumbnailSize: OCompactThumbnailSizeType.Small,
      thumbnailsPosition: OCompactThumbnailPositionType.Left,
    },
    dark: {
      pureBlack: get(LOCALSTORAGE_KEYS.DARK.PURE_BLACK) ?? true,
      quickSwitch: true,
      userDarkMode: get(LOCALSTORAGE_KEYS.DARK.USER_MODE) ?? false,
      usingSystemDarkMode: get(LOCALSTORAGE_KEYS.DARK.USE_SYSTEM) ?? true,
    },
    deviceMode: get(LOCALSTORAGE_KEYS.DEVICE_MODE) ?? "ios",
    font: {
      fontSizeMultiplier: get(LOCALSTORAGE_KEYS.FONT.FONT_SIZE_MULTIPLIER) ?? 1,
      useSystemFontSize: get(LOCALSTORAGE_KEYS.FONT.USE_SYSTEM) ?? false,
    },
    general: {
      profileLabel: OProfileLabelType.Instance,
      userInstanceUrlDisplay: OInstanceUrlDisplayMode.Never,
    },
    large: {
      showVotingButtons: true,
    },
    posts: {
      alwaysShowAuthor: false,
      blurNsfw: OPostBlurNsfw.InFeed,
      communityAtTop: false,
      embedCrossposts: true,
      embedExternalMedia: true,
      rememberType: false,
      showCommunityIcons: true,
      subscribedIcon: OShowSubscribedIcon.Never,
      type: OPostAppearanceType.Large,
    },
    theme: get(LOCALSTORAGE_KEYS.THEME) ?? "default",
    votesTheme: "lemmy",
    voting: {
      voteDisplayMode: OVoteDisplayMode.Total,
    },
  },
  blocks: {
    keywords: [],
    websites: [],
  },
  general: {
    comments: {
      collapseCommentThreads: OCommentThreadCollapse.Never,
      highlightNewAccount: true,
      jumpButtonPosition: OJumpButtonPositionType.RightBottom,
      rememberCommunitySort: false,
      showCollapsed: false,
      showCommentImages: true,
      showJumpButton: false,
      sort: OCommentDefaultSort.Hot,
      tapToCollapse: OTapToCollapseType.Both,
      touchFriendlyLinks: true,
    },
    defaultFeed: undefined,
    enableHapticFeedback: true,
    linkHandler: OLinkHandlerType.InApp,
    noSubscribedInFeed: false,
    posts: {
      autoHideRead: false,
      autoplayMedia: OAutoplayMediaType.Always,
      disableAutoHideInCommunities: false,
      disableMarkingRead: false,
      infiniteScrolling: true,
      markReadOnScroll: false,
      rememberCommunitySort: false,
      showHiddenInCommunities: false,
      showHideReadButton: false,
      sort: "Active",
      upvoteOnSave: false,
    },
    preferNativeApps: true,
    safari: {
      alwaysUseReaderMode: false,
    },
    thumbnailinatorEnabled: true,
  },
  tags: {
    enabled: false,
    hideInstance: true,
    saveSource: true,
    trackVotes: false,
  },
};

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

  initialState: buildInitialState(),

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

    setAlwaysShowAuthor(state, action: PayloadAction<boolean>) {
      state.appearance.posts.alwaysShowAuthor = action.payload;
      db.setSetting("always_show_author", action.payload);
    },
    setAlwaysUseReaderMode(state, action: PayloadAction<boolean>) {
      state.general.safari.alwaysUseReaderMode = action.payload;
      db.setSetting("always_use_reader_mode", action.payload);
    },
    setAutoHideRead(state, action: PayloadAction<boolean>) {
      state.general.posts.autoHideRead = action.payload;

      db.setSetting("auto_hide_read", action.payload);
    },
    setAutoplayMedia(state, action: PayloadAction<AutoplayMediaType>) {
      state.general.posts.autoplayMedia = action.payload;

      db.setSetting("autoplay_media", action.payload);
    },
    setCommentsCollapsed(state, action: PayloadAction<CommentThreadCollapse>) {
      state.general.comments.collapseCommentThreads = action.payload;
      db.setSetting("collapse_comment_threads", action.payload);
    },
    setCommentsTheme(state, action: PayloadAction<CommentsThemeType>) {
      state.appearance.commentsTheme = action.payload;
      db.setSetting("comments_theme", action.payload);
    },
    setCommunityAtTop(state, action: PayloadAction<boolean>) {
      state.appearance.posts.communityAtTop = action.payload;

      db.setSetting("community_at_top", action.payload);
    },
    setCompactShowSelfPostThumbnails(state, action: PayloadAction<boolean>) {
      state.appearance.compact.showSelfPostThumbnails = action.payload;
      db.setSetting("compact_show_self_post_thumbnails", action.payload);
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
    setDefaultCommentSort(state, action: PayloadAction<CommentDefaultSort>) {
      state.general.comments.sort = action.payload;
      db.setSetting("default_comment_sort", action.payload);
    },
    setDefaultFeed(state, action: PayloadAction<DefaultFeedType | undefined>) {
      state.general.defaultFeed = action.payload;
      // Per user setting is updated in StoreProvider
    },
    setDefaultPostSort(state, action: PayloadAction<PostSortType>) {
      state.general.posts.sort = action.payload;
      db.setSetting("default_post_sort", action.payload);
    },
    setDeviceMode(state, action: PayloadAction<Mode>) {
      state.appearance.deviceMode = action.payload;

      set(LOCALSTORAGE_KEYS.DEVICE_MODE, action.payload);
    },
    setDisableAutoHideInCommunities(state, action: PayloadAction<boolean>) {
      state.general.posts.disableAutoHideInCommunities = action.payload;

      db.setSetting("disable_auto_hide_in_communities", action.payload);
    },
    setDisableMarkingPostsRead(state, action: PayloadAction<boolean>) {
      state.general.posts.disableMarkingRead = action.payload;
      db.setSetting("disable_marking_posts_read", action.payload);
    },
    setEmbedCrossposts(state, action: PayloadAction<boolean>) {
      state.appearance.posts.embedCrossposts = action.payload;
      db.setSetting("embed_crossposts", action.payload);
    },
    setEmbedExternalMedia(state, action: PayloadAction<boolean>) {
      state.appearance.posts.embedExternalMedia = action.payload;
      db.setSetting("embed_external_media", action.payload);
    },
    setEnableHapticFeedback(state, action: PayloadAction<boolean>) {
      state.general.enableHapticFeedback = action.payload;

      db.setSetting("enable_haptic_feedback", action.payload);
    },
    setFilteredKeywords(state, action: PayloadAction<string[]>) {
      state.blocks.keywords = action.payload;
      // Per user setting is updated in StoreProvider
    },
    setFilteredWebsites(state, action: PayloadAction<string[]>) {
      state.blocks.websites = action.payload;
      // Per user setting is updated in StoreProvider
    },
    setFontSizeMultiplier(state, action: PayloadAction<number>) {
      state.appearance.font.fontSizeMultiplier = action.payload;
      set(LOCALSTORAGE_KEYS.FONT.FONT_SIZE_MULTIPLIER, action.payload);
    },
    setHighlightNewAccount(state, action: PayloadAction<boolean>) {
      state.general.comments.highlightNewAccount = action.payload;
      db.setSetting("highlight_new_account", action.payload);
    },
    setInfiniteScrolling(state, action: PayloadAction<boolean>) {
      state.general.posts.infiniteScrolling = action.payload;

      db.setSetting("infinite_scrolling", action.payload);
    },
    setJumpButtonPosition(
      state,
      action: PayloadAction<JumpButtonPositionType>,
    ) {
      state.general.comments.jumpButtonPosition = action.payload;
      db.setSetting("jump_button_position", action.payload);
    },
    setLargeShowVotingButtons(state, action: PayloadAction<boolean>) {
      state.appearance.large.showVotingButtons = action.payload;
      db.setSetting("large_show_voting_buttons", action.payload);
    },
    setLinkHandler(state, action: PayloadAction<LinkHandlerType>) {
      state.general.linkHandler = action.payload;

      db.setSetting("link_handler", action.payload);
    },
    setMarkPostsReadOnScroll(state, action: PayloadAction<boolean>) {
      state.general.posts.markReadOnScroll = action.payload;

      db.setSetting("mark_read_on_scroll", action.payload);
    },
    setNoSubscribedInFeed(state, action: PayloadAction<boolean>) {
      state.general.noSubscribedInFeed = action.payload;
      db.setSetting("no_subscribed_in_feed", action.payload);
    },
    setNsfwBlur(state, action: PayloadAction<PostBlurNsfwType>) {
      state.appearance.posts.blurNsfw = action.payload;
      // Per user setting is updated in StoreProvider
    },
    setPostAppearance(state, action: PayloadAction<PostAppearanceType>) {
      state.appearance.posts.type = action.payload;
      db.setSetting("post_appearance_type", action.payload);
    },
    setPreferNativeApps(state, action: PayloadAction<boolean>) {
      state.general.preferNativeApps = action.payload;

      db.setSetting("prefer_native_apps", action.payload);
    },
    setProfileLabel(state, action: PayloadAction<ProfileLabelType>) {
      state.appearance.general.profileLabel = action.payload;
      db.setSetting("profile_label", action.payload);
    },
    setPureBlack(state, action: PayloadAction<boolean>) {
      state.appearance.dark.pureBlack = action.payload;
      set(LOCALSTORAGE_KEYS.DARK.PURE_BLACK, action.payload);
    },
    setQuickSwitchDarkMode(state, action: PayloadAction<boolean>) {
      state.appearance.dark.quickSwitch = action.payload;
      db.setSetting("quick_switch_dark_mode", action.payload);
    },
    setRememberCommunityCommentSort(state, action: PayloadAction<boolean>) {
      state.general.comments.rememberCommunitySort = action.payload;

      db.setSetting("remember_community_comment_sort", action.payload);
    },
    setRememberCommunityPostSort(state, action: PayloadAction<boolean>) {
      state.general.posts.rememberCommunitySort = action.payload;

      db.setSetting("remember_community_post_sort", action.payload);
    },
    setRememberPostAppearance(state, action: PayloadAction<boolean>) {
      state.appearance.posts.rememberType = action.payload;
      db.setSetting("remember_post_appearance_type", action.payload);
    },
    setShowCollapsedComment(state, action: PayloadAction<boolean>) {
      state.general.comments.showCollapsed = action.payload;
      db.setSetting("show_collapsed_comment", action.payload);
    },
    setShowCommentImages(state, action: PayloadAction<boolean>) {
      state.general.comments.showCommentImages = action.payload;
      db.setSetting("show_comment_images", action.payload);
    },
    setShowCommunityIcons(state, action: PayloadAction<boolean>) {
      state.appearance.posts.showCommunityIcons = action.payload;
      db.setSetting("show_community_icons", action.payload);
    },
    setShowHiddenInCommunities(state, action: PayloadAction<boolean>) {
      state.general.posts.showHiddenInCommunities = action.payload;

      db.setSetting("show_hidden_in_communities", action.payload);
    },
    setShowHideReadButton(state, action: PayloadAction<boolean>) {
      state.general.posts.showHideReadButton = action.payload;

      db.setSetting("show_hide_read_button", action.payload);
    },
    setShowJumpButton(state, action: PayloadAction<boolean>) {
      state.general.comments.showJumpButton = action.payload;
      db.setSetting("show_jump_button", action.payload);
    },
    setSubscribedIcon(state, action: PayloadAction<ShowSubscribedIcon>) {
      state.appearance.posts.subscribedIcon = action.payload;

      db.setSetting("subscribed_icon", action.payload);
    },
    setTagsEnabled(state, action: PayloadAction<boolean>) {
      state.tags.enabled = action.payload;

      db.setSetting("tags_enabled", action.payload);
    },
    setTagsHideInstance(state, action: PayloadAction<boolean>) {
      state.tags.hideInstance = action.payload;

      db.setSetting("tags_hide_instance", action.payload);
    },
    setTagsSaveSource(state, action: PayloadAction<boolean>) {
      state.tags.saveSource = action.payload;

      db.setSetting("tags_save_source", action.payload);
    },
    setTagsTrackVotes(state, action: PayloadAction<boolean>) {
      state.tags.trackVotes = action.payload;

      db.setSetting("tags_track_votes", action.payload);
    },
    setTapToCollapse(state, action: PayloadAction<TapToCollapseType>) {
      state.general.comments.tapToCollapse = action.payload;
      db.setSetting("tap_to_collapse", action.payload);
    },
    setTheme(state, action: PayloadAction<AppThemeType>) {
      state.appearance.theme = action.payload;
      set(LOCALSTORAGE_KEYS.THEME, action.payload);
    },
    setThumbnailinatorEnabled(state, action: PayloadAction<boolean>) {
      state.general.thumbnailinatorEnabled = action.payload;
      db.setSetting("thumbnailinator_enabled", action.payload);
    },
    setThumbnailPosition(
      state,
      action: PayloadAction<CompactThumbnailPositionType>,
    ) {
      state.appearance.compact.thumbnailsPosition = action.payload;
      db.setSetting("compact_thumbnail_position_type", action.payload);
    },
    setTouchFriendlyLinks(state, action: PayloadAction<boolean>) {
      state.general.comments.touchFriendlyLinks = action.payload;
      db.setSetting("touch_friendly_links", action.payload);
    },
    setUpvoteOnSave(state, action: PayloadAction<boolean>) {
      state.general.posts.upvoteOnSave = action.payload;

      db.setSetting("upvote_on_save", action.payload);
    },
    setUserDarkMode(state, action: PayloadAction<boolean>) {
      state.appearance.dark.userDarkMode = action.payload;
      set(LOCALSTORAGE_KEYS.DARK.USER_MODE, action.payload);
    },
    setUserInstanceUrlDisplay(
      state,
      action: PayloadAction<InstanceUrlDisplayMode>,
    ) {
      state.appearance.general.userInstanceUrlDisplay = action.payload;
      db.setSetting("user_instance_url_display", action.payload);
    },
    setUseSystemDarkMode(state, action: PayloadAction<boolean>) {
      state.appearance.dark.usingSystemDarkMode = action.payload;
      set(LOCALSTORAGE_KEYS.DARK.USE_SYSTEM, action.payload);
    },
    setUseSystemFontSize(state, action: PayloadAction<boolean>) {
      state.appearance.font.useSystemFontSize = action.payload;
      set(LOCALSTORAGE_KEYS.FONT.USE_SYSTEM, action.payload);
    },
    setVoteDisplayMode(state, action: PayloadAction<VoteDisplayMode>) {
      state.appearance.voting.voteDisplayMode = action.payload;
      db.setSetting("vote_display_mode", action.payload);
    },
    setVotesTheme(state, action: PayloadAction<VotesThemeType>) {
      state.appearance.votesTheme = action.payload;
      db.setSetting("votes_theme", action.payload);
    },

    resetSettings: () => ({
      ...buildInitialState(),
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
      const always_show_author = await db.getSetting("always_show_author"),
        always_use_reader_mode = await db.getSetting("always_use_reader_mode"),
        auto_hide_read = await db.getSetting("auto_hide_read"),
        autoplay_media = await db.getSetting("autoplay_media"),
        blur_nsfw = await db.getSetting("blur_nsfw"),
        collapse_comment_threads = await db.getSetting(
          "collapse_comment_threads",
        ),
        comments_theme = await db.getSetting("comments_theme"),
        community_at_top = await db.getSetting("community_at_top"),
        compact_show_self_post_thumbnails = await db.getSetting(
          "compact_show_self_post_thumbnails",
        ),
        compact_show_voting_buttons = await db.getSetting(
          "compact_show_voting_buttons",
        ),
        compact_thumbnail_position_type = await db.getSetting(
          "compact_thumbnail_position_type",
        ),
        compact_thumbnail_size = await db.getSetting("compact_thumbnail_size"),
        default_comment_sort = await db.getSetting("default_comment_sort"),
        default_post_sort = await db.getSetting("default_post_sort"),
        disable_auto_hide_in_communities = await db.getSetting(
          "disable_auto_hide_in_communities",
        ),
        disable_marking_posts_read = await db.getSetting(
          "disable_marking_posts_read",
        ),
        embed_crossposts = await db.getSetting("embed_crossposts"),
        embed_external_media = await db.getSetting("embed_external_media"),
        enable_haptic_feedback = await db.getSetting("enable_haptic_feedback"),
        filtered_keywords = await db.getSetting("filtered_keywords"),
        filtered_websites = await db.getSetting("filtered_websites"),
        highlight_new_account = await db.getSetting("highlight_new_account"),
        infinite_scrolling = await db.getSetting("infinite_scrolling"),
        jump_button_position = await db.getSetting("jump_button_position"),
        large_show_voting_buttons = await db.getSetting(
          "large_show_voting_buttons",
        ),
        link_handler = await db.getSetting("link_handler"),
        mark_read_on_scroll = await db.getSetting("mark_read_on_scroll"),
        no_subscribed_in_feed = await db.getSetting("no_subscribed_in_feed"),
        post_appearance_type = await db.getSetting("post_appearance_type"),
        prefer_native_apps = await db.getSetting("prefer_native_apps"),
        profile_label = await db.getSetting("profile_label"),
        quick_switch_dark_mode = await db.getSetting("quick_switch_dark_mode"),
        remember_community_comment_sort = await db.getSetting(
          "remember_community_comment_sort",
        ),
        remember_community_post_sort = await db.getSetting(
          "remember_community_post_sort",
        ),
        remember_post_appearance_type = await db.getSetting(
          "remember_post_appearance_type",
        ),
        show_collapsed_comment = await db.getSetting("show_collapsed_comment"),
        show_comment_images = await db.getSetting("show_comment_images"),
        show_community_icons = await db.getSetting("show_community_icons"),
        show_hidden_in_communities = await db.getSetting(
          "show_hidden_in_communities",
        ),
        show_hide_read_button = await db.getSetting("show_hide_read_button"),
        show_jump_button = await db.getSetting("show_jump_button"),
        subscribed_icon = await db.getSetting("subscribed_icon"),
        tags_enabled = await db.getSetting("tags_enabled"),
        tags_hide_instance = await db.getSetting("tags_hide_instance"),
        tags_save_source = await db.getSetting("tags_save_source"),
        tags_track_votes = await db.getSetting("tags_track_votes"),
        tap_to_collapse = await db.getSetting("tap_to_collapse"),
        thumbnailinator_enabled = await db.getSetting(
          "thumbnailinator_enabled",
        ),
        touch_friendly_links = await db.getSetting("touch_friendly_links"),
        upvote_on_save = await db.getSetting("upvote_on_save"),
        user_instance_url_display = await db.getSetting(
          "user_instance_url_display",
        ),
        vote_display_mode = await db.getSetting("vote_display_mode"),
        votes_theme = await db.getSetting("votes_theme");

      const state = thunkApi.getState() as RootState;

      return {
        ...state.settings,
        ready: true,

        appearance: {
          ...state.settings.appearance,
          commentsTheme:
            comments_theme ?? initialState.appearance.commentsTheme,
          compact: {
            showSelfPostThumbnails:
              compact_show_self_post_thumbnails ??
              initialState.appearance.compact.showSelfPostThumbnails,
            showVotingButtons:
              compact_show_voting_buttons ??
              initialState.appearance.compact.showVotingButtons,
            thumbnailSize:
              compact_thumbnail_size ??
              initialState.appearance.compact.thumbnailSize,
            thumbnailsPosition:
              compact_thumbnail_position_type ??
              initialState.appearance.compact.thumbnailsPosition,
          },
          dark: {
            ...state.settings.appearance.dark,
            quickSwitch:
              quick_switch_dark_mode ??
              initialState.appearance.dark.quickSwitch,
          },
          general: {
            profileLabel:
              profile_label ?? initialState.appearance.general.profileLabel,
            userInstanceUrlDisplay:
              user_instance_url_display ??
              initialState.appearance.general.userInstanceUrlDisplay,
          },
          large: {
            showVotingButtons:
              large_show_voting_buttons ??
              initialState.appearance.large.showVotingButtons,
          },
          posts: {
            alwaysShowAuthor:
              always_show_author ??
              initialState.appearance.posts.alwaysShowAuthor,
            blurNsfw: blur_nsfw ?? initialState.appearance.posts.blurNsfw,
            communityAtTop:
              community_at_top ?? initialState.appearance.posts.communityAtTop,
            embedCrossposts:
              embed_crossposts ?? initialState.appearance.posts.embedCrossposts,
            embedExternalMedia:
              embed_external_media ??
              initialState.appearance.posts.embedExternalMedia,
            rememberType:
              remember_post_appearance_type ??
              initialState.appearance.posts.rememberType,
            showCommunityIcons:
              show_community_icons ??
              initialState.appearance.posts.showCommunityIcons,
            subscribedIcon:
              subscribed_icon ?? initialState.appearance.posts.subscribedIcon,
            type: post_appearance_type ?? initialState.appearance.posts.type,
          },
          votesTheme: votes_theme ?? initialState.appearance.votesTheme,
          voting: {
            voteDisplayMode:
              vote_display_mode ??
              initialState.appearance.voting.voteDisplayMode,
          },
        },
        blocks: {
          keywords: filtered_keywords ?? initialState.blocks.keywords,
          websites: filtered_websites ?? initialState.blocks.websites,
        },
        general: {
          comments: {
            collapseCommentThreads:
              collapse_comment_threads ??
              initialState.general.comments.collapseCommentThreads,
            highlightNewAccount:
              highlight_new_account ??
              initialState.general.comments.highlightNewAccount,
            jumpButtonPosition:
              jump_button_position ??
              initialState.general.comments.jumpButtonPosition,
            rememberCommunitySort:
              remember_community_comment_sort ??
              initialState.general.comments.rememberCommunitySort,
            showCollapsed:
              show_collapsed_comment ??
              initialState.general.comments.showCollapsed,
            showCommentImages:
              show_comment_images ??
              initialState.general.comments.showCommentImages,
            showJumpButton:
              show_jump_button ?? initialState.general.comments.showJumpButton,
            sort: default_comment_sort ?? initialState.general.comments.sort,
            tapToCollapse:
              tap_to_collapse ?? initialState.general.comments.tapToCollapse,
            touchFriendlyLinks:
              touch_friendly_links ??
              initialState.general.comments.touchFriendlyLinks,
          },
          defaultFeed: initialState.general.defaultFeed,
          enableHapticFeedback:
            enable_haptic_feedback ?? initialState.general.enableHapticFeedback,
          linkHandler: link_handler ?? initialState.general.linkHandler,
          noSubscribedInFeed:
            no_subscribed_in_feed ?? initialState.general.noSubscribedInFeed,
          posts: {
            autoHideRead:
              auto_hide_read ?? initialState.general.posts.autoHideRead,
            autoplayMedia:
              autoplay_media ?? initialState.general.posts.autoplayMedia,
            disableAutoHideInCommunities:
              disable_auto_hide_in_communities ??
              initialState.general.posts.disableAutoHideInCommunities,
            disableMarkingRead:
              disable_marking_posts_read ??
              initialState.general.posts.disableMarkingRead,
            infiniteScrolling:
              infinite_scrolling ??
              initialState.general.posts.infiniteScrolling,
            markReadOnScroll:
              mark_read_on_scroll ??
              initialState.general.posts.markReadOnScroll,
            rememberCommunitySort:
              remember_community_post_sort ??
              initialState.general.posts.rememberCommunitySort,
            showHiddenInCommunities:
              show_hidden_in_communities ??
              initialState.general.posts.showHiddenInCommunities,
            showHideReadButton:
              show_hide_read_button ??
              initialState.general.posts.showHideReadButton,
            sort: default_post_sort ?? initialState.general.posts.sort,
            upvoteOnSave:
              upvote_on_save ?? initialState.general.posts.upvoteOnSave,
          },
          preferNativeApps:
            prefer_native_apps ?? initialState.general.preferNativeApps,
          safari: {
            alwaysUseReaderMode:
              always_use_reader_mode ??
              initialState.general.safari.alwaysUseReaderMode,
          },
          thumbnailinatorEnabled:
            thumbnailinator_enabled ??
            initialState.general.thumbnailinatorEnabled,
        },
        tags: {
          enabled: tags_enabled ?? initialState.tags.enabled,
          hideInstance: tags_hide_instance ?? initialState.tags.hideInstance,
          saveSource: tags_save_source ?? initialState.tags.saveSource,
          trackVotes: tags_track_votes ?? initialState.tags.trackVotes,
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
  setAlwaysShowAuthor,
  setAlwaysUseReaderMode,
  setAutoHideRead,
  setAutoplayMedia,
  setCommentsCollapsed,
  setCommentsTheme,
  setCommunityAtTop,
  setCompactShowSelfPostThumbnails,
  setCompactShowVotingButtons,
  setCompactThumbnailSize,
  setDatabaseError,
  setDefaultCommentSort,
  setDefaultFeed,
  setDefaultPostSort,
  setDeviceMode,
  setDisableAutoHideInCommunities,
  setDisableMarkingPostsRead,
  setEmbedCrossposts,
  setEmbedExternalMedia,
  setEnableHapticFeedback,
  setFilteredKeywords,
  setFilteredWebsites,
  setFontSizeMultiplier,
  setHighlightNewAccount,
  setInfiniteScrolling,
  setJumpButtonPosition,
  setLargeShowVotingButtons,
  setLinkHandler,
  setMarkPostsReadOnScroll,
  setNoSubscribedInFeed,
  setNsfwBlur,
  setPostAppearance,
  setPreferNativeApps,
  setProfileLabel,
  setPureBlack,
  setQuickSwitchDarkMode,
  setRememberCommunityCommentSort,
  setRememberCommunityPostSort,
  setRememberPostAppearance,
  setShowCollapsedComment,
  setShowCommentImages,
  setShowCommunityIcons,
  setShowHiddenInCommunities,
  setShowHideReadButton,
  setShowJumpButton,
  setSubscribedIcon,
  setTagsEnabled,
  setTagsHideInstance,
  setTagsSaveSource,
  setTagsTrackVotes,
  setTapToCollapse,
  setTheme,
  setThumbnailinatorEnabled,
  setThumbnailPosition,
  settingsReady,
  setTouchFriendlyLinks,
  setUpvoteOnSave,
  setUserDarkMode,
  setUserInstanceUrlDisplay,
  setUseSystemDarkMode,
  setUseSystemFontSize,
  setVoteDisplayMode,
  setVotesTheme,
} = appearanceSlice.actions;

export default appearanceSlice.reducer;
