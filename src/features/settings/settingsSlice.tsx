/* eslint perfectionist/sort-objects: ["warn", { partitionByNewLine: true }] */
/* eslint perfectionist/sort-variable-declarations: ["warn"] */

import { Mode } from "@ionic/core";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import Dexie from "dexie";
import { merge, zipObject } from "es-toolkit";
import { produce } from "immer";
import { PostSortType } from "lemmy-js-client";

import { loggedInSelector } from "#/features/auth/authSelectors";
import { MAX_DEFAULT_COMMENT_DEPTH } from "#/helpers/lemmy";
import { DeepPartial } from "#/helpers/typescript";
import {
  ALL_GLOBAL_SETTINGS,
  AppThemeType,
  AutoplayMediaType,
  CommentDefaultSort,
  CommentsThemeType,
  CommentThreadCollapse,
  CompactThumbnailPositionType,
  CompactThumbnailSizeType,
  db,
  DefaultFeedType,
  GlobalSettingValueTypes,
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
} from "#/services/db";
import { AppDispatch, RootState } from "#/store";

import {
  getLocalStorageInitialState,
  LOCALSTORAGE_KEYS,
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

export interface SettingsState {
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
    media: {
      hideAltText: boolean;
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

const baseState: SettingsState = {
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
      pureBlack: true,
      quickSwitch: true,
      userDarkMode: false,
      usingSystemDarkMode: true,
    },
    deviceMode: "ios",
    font: {
      fontSizeMultiplier: 1,
      useSystemFontSize: false,
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
    theme: "default",
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
    media: {
      hideAltText: false,
    },
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

/**
 * We continue using localstorage for specific items because indexeddb is slow
 * and we don't want to wait for it to load before rendering the app and cause flickering
 */
export function buildInitialStateWithLocalStorage(): SettingsState {
  return produce(baseState, (draft) => {
    merge(draft, getLocalStorageInitialState());
  });
}

export const initialState = buildInitialStateWithLocalStorage();

export const settingsSlice = createSlice({
  name: "settings",

  initialState,

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
    setHideAltText(state, action: PayloadAction<boolean>) {
      state.general.media.hideAltText = action.payload;
      db.setSetting("hide_alt_text", action.payload);
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
      ...buildInitialStateWithLocalStorage(),
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

    dispatch(setNsfwBlur(blurNsfw ?? baseState.appearance.posts.blurNsfw));
  };

export const getFilteredKeywords =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    const filteredKeywords = await db.getSetting("filtered_keywords", {
      user_handle: userHandle,
    });

    dispatch(
      setFilteredKeywords(filteredKeywords ?? baseState.blocks.keywords),
    );
  };

export const getFilteredWebsites =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const userHandle = getState().auth.accountData?.activeHandle;

    const filteredWebsites = await db.getSetting("filtered_websites", {
      user_handle: userHandle,
    });

    dispatch(
      setFilteredWebsites(filteredWebsites ?? baseState.blocks.websites),
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

    dispatch(setDefaultFeed(defaultFeed ?? baseState.general.defaultFeed));

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
    let settings;

    try {
      settings = zipObject(
        ALL_GLOBAL_SETTINGS,
        await db.getSettings(ALL_GLOBAL_SETTINGS),
      ) as unknown as Partial<GlobalSettingValueTypes>;
    } catch (error) {
      if (error instanceof Dexie.MissingAPIError) {
        thunkApi.dispatch(setDatabaseError(error));
      }

      // In the event of a database error, attempt to render the UI anyways
      thunkApi.dispatch(settingsReady());

      throw error;
    }

    const state = thunkApi.getState() as RootState;

    return produce(state.settings, (draft) => {
      merge(draft, {
        ...hydrateStateWithGlobalSettings(settings),
        ready: true,
      });
    });
  },
);

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
  setHideAltText,
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
} = settingsSlice.actions;

export default settingsSlice.reducer;

/**
 * Hydrates the state with the global settings from the database.
 *
 * For user settings, please see `store.tsx` -> `SetupStore` -> `afterSetup`.
 *
 * @param settings - The global settings from the database.
 * @returns The hydrated state.
 */
function hydrateStateWithGlobalSettings(
  settings: Partial<GlobalSettingValueTypes>,
): DeepPartial<SettingsState> {
  return {
    appearance: {
      commentsTheme: settings.comments_theme,
      compact: {
        showSelfPostThumbnails: settings.compact_show_self_post_thumbnails,
        showVotingButtons: settings.compact_show_voting_buttons,
        thumbnailSize: settings.compact_thumbnail_size,
        thumbnailsPosition: settings.compact_thumbnail_position_type,
      },
      dark: {
        quickSwitch: settings.quick_switch_dark_mode,
      },
      general: {
        profileLabel: settings.profile_label,
        userInstanceUrlDisplay: settings.user_instance_url_display,
      },
      large: {
        showVotingButtons: settings.large_show_voting_buttons,
      },
      posts: {
        alwaysShowAuthor: settings.always_show_author,
        blurNsfw: settings.blur_nsfw,
        communityAtTop: settings.community_at_top,
        embedCrossposts: settings.embed_crossposts,
        embedExternalMedia: settings.embed_external_media,
        rememberType: settings.remember_post_appearance_type,
        showCommunityIcons: settings.show_community_icons,
        subscribedIcon: settings.subscribed_icon,
        type: settings.post_appearance_type,
      },
      votesTheme: settings.votes_theme,
      voting: {
        voteDisplayMode: settings.vote_display_mode,
      },
    },
    blocks: {
      keywords: settings.filtered_keywords,
      websites: settings.filtered_websites,
    },
    general: {
      comments: {
        collapseCommentThreads: settings.collapse_comment_threads,
        highlightNewAccount: settings.highlight_new_account,
        jumpButtonPosition: settings.jump_button_position,
        rememberCommunitySort: settings.remember_community_comment_sort,
        showCollapsed: settings.show_collapsed_comment,
        showCommentImages: settings.show_comment_images,
        showJumpButton: settings.show_jump_button,
        sort: settings.default_comment_sort,
        tapToCollapse: settings.tap_to_collapse,
        touchFriendlyLinks: settings.touch_friendly_links,
      },
      enableHapticFeedback: settings.enable_haptic_feedback,
      linkHandler: settings.link_handler,
      media: {
        hideAltText: settings.hide_alt_text,
      },
      noSubscribedInFeed: settings.no_subscribed_in_feed,
      posts: {
        autoHideRead: settings.auto_hide_read,
        autoplayMedia: settings.autoplay_media,
        disableAutoHideInCommunities: settings.disable_auto_hide_in_communities,
        disableMarkingRead: settings.disable_marking_posts_read,
        infiniteScrolling: settings.infinite_scrolling,
        markReadOnScroll: settings.mark_read_on_scroll,
        rememberCommunitySort: settings.remember_community_post_sort,
        showHiddenInCommunities: settings.show_hidden_in_communities,
        showHideReadButton: settings.show_hide_read_button,
        sort: settings.default_post_sort,
        upvoteOnSave: settings.upvote_on_save,
      },
      preferNativeApps: settings.prefer_native_apps,
      safari: {
        alwaysUseReaderMode: settings.always_use_reader_mode,
      },
      thumbnailinatorEnabled: settings.thumbnailinator_enabled,
    },
    tags: {
      enabled: settings.tags_enabled,
      hideInstance: settings.tags_hide_instance,
      saveSource: settings.tags_save_source,
      trackVotes: settings.tags_track_votes,
    },
  };
}
