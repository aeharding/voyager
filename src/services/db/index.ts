/* eslint perfectionist/sort-interfaces: ["warn", { partitionByNewLine: true }] */
import { differenceInHours, subHours } from "date-fns";
import Dexie, { Table } from "dexie";
import { FederatedInstances } from "threadiverse";

import {
  VgerCommentSortType,
  VgerCommentSortTypeByMode,
} from "#/features/comment/CommentSort";
import {
  VgerPostSortType,
  VgerPostSortTypeByMode,
} from "#/features/feed/sort/PostSort";
import { VgerSearchSortType } from "#/features/feed/sort/SearchSort";
import { get, LOCALSTORAGE_KEYS, set } from "#/features/settings/syncStorage";
import { arrayOfAll } from "#/helpers/array.js";
import { isAndroid } from "#/helpers/device";
import { VgerCommunitySortType } from "#/routes/pages/search/results/CommunitySort";

import * as types from "./types";

/**

/**
 * Global settings, loaded once at startup
 */
export interface GlobalSettingValueTypes {
  always_show_author: boolean;
  always_use_reader_mode: boolean;
  auto_hide_read: boolean;
  autoplay_media: types.AutoplayMediaType;
  blur_nsfw: types.PostBlurNsfwType;
  collapse_comment_threads: types.CommentThreadCollapse;
  comments_theme: types.CommentsThemeType;
  community_at_top: boolean;
  compact_show_self_post_thumbnails: boolean;
  compact_show_voting_buttons: boolean;
  compact_thumbnail_position_type: types.CompactThumbnailPositionType;
  compact_thumbnail_size: types.CompactThumbnailSizeType;
  confirm_leave_feed_prompt: boolean;
  default_comment_sort_lemmyv0: VgerCommentSortTypeByMode["lemmyv0"];
  default_comment_sort_lemmyv1: VgerCommentSortTypeByMode["lemmyv1"];
  default_comment_sort_piefed: VgerCommentSortTypeByMode["piefed"];
  default_community_sort_by_feed: VgerCommunitySortType;
  default_post_sort_lemmyv0: VgerPostSortTypeByMode["lemmyv0"];
  default_post_sort_lemmyv1: VgerPostSortTypeByMode["lemmyv1"];
  default_post_sort_piefed: VgerPostSortTypeByMode["piefed"];
  default_search_sort_by_feed: VgerSearchSortType;
  default_share: types.PostCommentShareType;
  disable_auto_hide_in_communities: boolean;
  disable_marking_posts_read: boolean;
  embed_crossposts: boolean;
  embed_external_media: boolean;
  enable_haptic_feedback: boolean;
  filtered_keywords: string[];
  filtered_websites: string[];
  hide_alt_text: boolean;
  highlight_new_account: boolean;
  infinite_scrolling: boolean;
  jump_button_position: types.JumpButtonPositionType;
  large_show_voting_buttons: boolean;
  link_handler: types.LinkHandlerType;
  mark_read_on_scroll: boolean;
  never_show_read_posts: boolean;
  no_subscribed_in_feed: boolean;
  post_appearance_type: types.PostAppearanceType;
  prefer_native_apps: boolean;
  profile_label: types.ProfileLabelType;
  quick_switch_dark_mode: boolean;
  remember_community_comment_sort: boolean;
  remember_community_post_sort: boolean;
  remember_post_appearance_type: boolean;
  show_collapsed_comment: boolean;
  show_comment_images: boolean;
  show_community_icons: boolean;
  show_controls_on_open: boolean;
  show_hidden_in_communities: boolean;
  show_hide_read_button: boolean;
  show_jump_button: boolean;
  subscribed_icon: types.ShowSubscribedIcon;
  tags_enabled: boolean;
  tags_hide_instance: boolean;
  tags_save_source: boolean;
  tags_track_votes: boolean;
  tap_to_collapse: types.TapToCollapseType;
  thumbnailinator_enabled: boolean;
  touch_friendly_links: boolean;
  two_column_layout: types.TwoColumnLayout;
  upvote_on_save: boolean;
  user_instance_url_display: types.InstanceUrlDisplayMode;
  vote_display_mode: types.VoteDisplayMode;
  votes_theme: types.VotesThemeType;
}

/**
 * Dynamic settings, can change per community and/or user
 */
interface DynamicSettingValueTypes {
  default_comment_sort_by_feed: VgerCommentSortType;
  default_feed: types.DefaultFeedType;
  default_post_sort_by_feed: VgerPostSortType;
  disable_left_swipes: boolean;
  disable_right_swipes: boolean;
  favorite_communities: string[];
  gesture_swipe_comment: types.SwipeActions;
  gesture_swipe_inbox: types.SwipeActions;
  gesture_swipe_post: types.SwipeActions;
  has_presented_block_nsfw_tip: boolean;
  long_swipe_trigger_point: types.LongSwipeTriggerPointType;
  migration_links: string[];
}

export interface SettingValueTypes
  extends GlobalSettingValueTypes, DynamicSettingValueTypes {}

export const ALL_GLOBAL_SETTINGS = arrayOfAll<keyof GlobalSettingValueTypes>()([
  "always_show_author",
  "always_use_reader_mode",
  "auto_hide_read",
  "autoplay_media",
  "blur_nsfw",
  "collapse_comment_threads",
  "comments_theme",
  "community_at_top",
  "compact_show_self_post_thumbnails",
  "compact_show_voting_buttons",
  "compact_thumbnail_position_type",
  "compact_thumbnail_size",
  "default_comment_sort_lemmyv0",
  "default_comment_sort_lemmyv1",
  "default_comment_sort_piefed",
  "default_post_sort_lemmyv0",
  "default_post_sort_lemmyv1",
  "default_post_sort_piefed",
  "disable_auto_hide_in_communities",
  "disable_marking_posts_read",
  "embed_crossposts",
  "embed_external_media",
  "enable_haptic_feedback",
  "filtered_keywords",
  "filtered_websites",
  "highlight_new_account",
  "infinite_scrolling",
  "jump_button_position",
  "large_show_voting_buttons",
  "link_handler",
  "mark_read_on_scroll",
  "no_subscribed_in_feed",
  "post_appearance_type",
  "prefer_native_apps",
  "profile_label",
  "quick_switch_dark_mode",
  "remember_community_comment_sort",
  "remember_community_post_sort",
  "remember_post_appearance_type",
  "show_collapsed_comment",
  "show_comment_images",
  "show_community_icons",
  "two_column_layout",
  "show_hidden_in_communities",
  "show_hide_read_button",
  "show_jump_button",
  "subscribed_icon",
  "tags_enabled",
  "tags_hide_instance",
  "tags_save_source",
  "tags_track_votes",
  "tap_to_collapse",
  "thumbnailinator_enabled",
  "touch_friendly_links",
  "upvote_on_save",
  "user_instance_url_display",
  "vote_display_mode",
  "never_show_read_posts",
  "votes_theme",
  "hide_alt_text",
  "show_controls_on_open",
  "default_share",
  "default_search_sort_by_feed",
  "default_community_sort_by_feed",
  "confirm_leave_feed_prompt",
]);

export interface ISettingItem<T extends keyof SettingValueTypes> {
  key: T;
  value: SettingValueTypes[T];

  community: string;
  user_handle: string;
}

export const CompoundKeys = {
  postMetadata: {
    post_id_and_user_handle: "[post_id+user_handle]",
    user_handle_and_hidden: "[user_handle+hidden]",
  },
  settings: {
    key_and_user_handle_and_community: "[key+user_handle+community]",
  },
};

export class WefwefDB extends Dexie {
  postMetadatas!: Table<types.IPostMetadata, number>;
  settings!: Table<ISettingItem<keyof SettingValueTypes>, string>;
  cachedFederatedInstanceData!: Table<types.InstanceData, number>;
  providers!: Table<types.ProvidersData, types.Provider>;
  userTags!: Table<types.UserTag, number>;

  constructor() {
    super("WefwefDB");

    /* IMPORTANT: Do not alter the version if you're changing an existing schema.
       If you want to change the schema, create a higher version and provide migration logic.
       Always assume there is a device out there with the first version of the app.
       Also please read the Dexie documentation about versioning.
    */
    this.version(2).stores({
      postMetadatas: `
        ++,
        ${CompoundKeys.postMetadata.post_id_and_user_handle},
        ${CompoundKeys.postMetadata.user_handle_and_hidden},
        post_id,
        user_handle,
        hidden,
        hidden_updated_at
      `,
      settings: `
        ++,
        key,
        ${CompoundKeys.settings.key_and_user_handle_and_community},
        value,
        user_handle,
        community
      `,
    });

    this.version(3).upgrade(async () => {
      await this.setSetting("blur_nsfw", types.OPostBlurNsfw.InFeed);
    });

    this.version(4).stores({
      postMetadatas: `
        ++,
        ${CompoundKeys.postMetadata.post_id_and_user_handle},
        ${CompoundKeys.postMetadata.user_handle_and_hidden},
        post_id,
        user_handle,
        hidden,
        hidden_updated_at
      `,
      settings: `
        ++,
        key,
        ${CompoundKeys.settings.key_and_user_handle_and_community},
        value,
        user_handle,
        community
      `,
      cachedFederatedInstanceData: `
        ++id,
        &domain,
        updated
      `,
    });

    this.version(5).upgrade(async () => {
      // Upgrade comment gesture "collapse" => "collapse-to-top"
      await (async () => {
        const gestures = await this.getSetting("gesture_swipe_comment");

        if (!gestures) return;

        Object.entries(gestures).map(([direction, gesture]) => {
          if (!gestures) return;
          if (gesture === "collapse")
            gestures[direction as keyof typeof gestures] = "collapse-to-top";
        });

        await this.setSetting("gesture_swipe_comment", gestures);
      })();

      // Upgrade inbox gesture "mark_unread" => "mark-unread"
      await (async () => {
        const gestures = await this.getSetting("gesture_swipe_inbox");

        if (!gestures) return;

        Object.entries(gestures).map(([direction, gesture]) => {
          if (!gestures) return;
          if ((gesture as string) === "mark_unread")
            gestures[direction as keyof typeof gestures] = "mark-unread";
        });

        await this.setSetting("gesture_swipe_inbox", gestures);
      })();
    });

    this.version(6).upgrade(async () => {
      // Upgrade collapse comment threads "always" => "root_only"
      await (async () => {
        let default_collapse = await this.getSetting(
          "collapse_comment_threads",
        );

        if (!default_collapse) return;
        if ((default_collapse as string) === "always")
          default_collapse = "root_only";

        await this.setSetting("collapse_comment_threads", default_collapse);
      })();
    });

    this.version(7).stores({
      postMetadatas: `
        ++,
        ${CompoundKeys.postMetadata.post_id_and_user_handle},
        ${CompoundKeys.postMetadata.user_handle_and_hidden},
        post_id,
        user_handle,
        hidden,
        hidden_updated_at
      `,
      settings: `
        ++,
        key,
        ${CompoundKeys.settings.key_and_user_handle_and_community},
        value,
        user_handle,
        community
      `,
      cachedFederatedInstanceData: `
        ++id,
        &domain,
        updated
      `,
      providers: `
        ++,
        &name,
        data
      `,
    });

    this.version(8).upgrade(async () => {
      await this.settings
        .where("key")
        .equals("remember_community_sort")
        .modify({ key: "remember_community_post_sort" });
    });

    this.version(9).stores({
      postMetadatas: `
        ++,
        ${CompoundKeys.postMetadata.post_id_and_user_handle},
        ${CompoundKeys.postMetadata.user_handle_and_hidden},
        post_id,
        user_handle,
        hidden,
        hidden_updated_at
      `,
      settings: `
        ++,
        key,
        ${CompoundKeys.settings.key_and_user_handle_and_community},
        value,
        user_handle,
        community
      `,
      cachedFederatedInstanceData: `
        ++id,
        &domain,
        updated
      `,
      providers: `
        ++,
        &name,
        data
      `,
      userTags: `
        ++,
        &handle
      `,
    });

    this.version(10).upgrade(async () => {
      // Existing installations on Android should default to "ios"
      // to maintain old behavior
      if (isAndroid() && !get(LOCALSTORAGE_KEYS.DEVICE_MODE)) {
        set(LOCALSTORAGE_KEYS.DEVICE_MODE, "ios");

        location.reload();
      }
    });

    this.version(11).upgrade(async () => {
      await this.settings
        .where("key")
        .equals("default_post_sort")
        .modify({ key: "default_post_sort_lemmyv0" });

      await this.settings
        .where("key")
        .equals("default_comment_sort")
        .modify({ key: "default_comment_sort_lemmyv0" });
    });
  }

  /*
   * Providers
   */
  async getProvider(providerName: types.ProvidersData["name"]) {
    return await this.providers.where("name").equals(providerName).first();
  }

  async setProvider(payload: types.ProvidersData) {
    return await this.transaction("rw", this.providers, async () => {
      await this.providers.where("name").equals(payload.name).delete();

      await this.providers.put(payload);
    });
  }

  async resetProviders() {
    return await this.providers.clear();
  }

  /*
   * Post Metadata
   */
  async getPostMetadatas(post_id: number | number[], user_handle: string) {
    const post_ids = Array.isArray(post_id) ? post_id : [post_id];

    return await this.postMetadatas
      .where(CompoundKeys.postMetadata.post_id_and_user_handle)
      .anyOf(post_ids.map((id) => [id, user_handle]))
      .toArray();
  }

  async upsertPostMetadata(postMetadata: types.IPostMetadata) {
    const { post_id, user_handle } = postMetadata;

    await this.transaction("rw", this.postMetadatas, async () => {
      const query = this.postMetadatas
        .where(CompoundKeys.postMetadata.post_id_and_user_handle)
        .equals([post_id, user_handle]);

      const item = await query.first();

      if (item) {
        await query.modify(postMetadata);
        return;
      }

      await this.postMetadatas.add(postMetadata);
    });
  }

  // This is a very specific method to get the hidden posts of a user in a paginated manner.
  // It's efficient when used in a feed style pagination where pages are fetched
  // one after the other. It's not efficient if you want to jump to a specific page
  // because it has to fetch all the previous pages and run a filter on them.
  async getHiddenPostMetadatasPaginated(
    user_handle: string,
    page: number,
    limit: number,
    lastPageItems?: types.IPostMetadata[],
  ) {
    const filterFn = (metadata: types.IPostMetadata) =>
      metadata.user_handle === user_handle && metadata.hidden === 1;

    if (page === 1) {
      // First page, no need to check lastPageItems. We know we're at the beginning
      return await this.postMetadatas
        .orderBy("hidden_updated_at")
        .reverse()
        .filter(filterFn)
        .limit(limit)
        .toArray();
    }

    if (!lastPageItems) {
      // Ideally tis should never happen. It's very not efficient.
      // It runs filterFn on all of the table's items
      return await this.postMetadatas
        .orderBy("hidden_updated_at")
        .reverse()
        .filter(filterFn)
        .offset((page - 1) * limit)
        .limit(limit)
        .toArray();
    }

    if (lastPageItems?.length < limit) {
      // We've reached the end
      return [];
    }

    // We're in the middle of the list
    // We can use the last item of the previous page to get the next page

    const lastPageLastEntry = lastPageItems?.[lastPageItems.length - 1];

    return await this.postMetadatas
      .where("hidden_updated_at")
      .below(lastPageLastEntry?.hidden_updated_at)
      .reverse()
      .filter(filterFn)
      .limit(limit)
      .toArray();
  }

  async clearHiddenPosts(user_handle: string) {
    return await this.postMetadatas
      .where("user_handle")
      .equals(user_handle)
      .delete();
  }

  /*
   * Federated instance data
   */
  async getCachedFederatedInstances(domain: string) {
    const INVALIDATE_AFTER_HOURS = 12;

    const result = await this.cachedFederatedInstanceData.get({ domain });

    // Cleanup stale
    (async () => {
      this.cachedFederatedInstanceData
        .where("updated")
        .below(subHours(new Date(), INVALIDATE_AFTER_HOURS))
        .delete();
    })();

    if (!result) return;

    if (differenceInHours(new Date(), result.updated) > INVALIDATE_AFTER_HOURS)
      return;

    return result.data;
  }

  async setCachedFederatedInstances(
    domain: string,
    federatedInstances: FederatedInstances,
  ) {
    const payload: types.InstanceData = {
      updated: new Date(),
      domain,
      data: federatedInstances,
    };

    await this.transaction("rw", this.cachedFederatedInstanceData, async () => {
      const query = this.cachedFederatedInstanceData
        .where("domain")
        .equals(domain);

      const item = await query.first();

      if (item) {
        await query.modify({ ...payload });
        return;
      }

      await this.cachedFederatedInstanceData.add(payload);
    });
  }

  async fetchTagsForHandles(handles: string[]) {
    return await this.userTags.where("handle").anyOf(handles).toArray();
  }

  async updateTag(tag: types.UserTag) {
    return await this.transaction("rw", this.userTags, async () => {
      await this.userTags.where("handle").equals(tag.handle).delete();

      await this.userTags.put(tag);
    });
  }

  async removeTag(tag: types.UserTag) {
    return await this.transaction("rw", this.userTags, async () => {
      await this.userTags.where("handle").equals(tag.handle).delete();
    });
  }

  async getUserTagsPaginated(
    page: number,
    limit: number,
    filterTagged: boolean,
  ) {
    return await this.userTags
      .orderBy("handle")
      .filter(({ text }) => (filterTagged ? !!text : true))
      .offset((page - 1) * limit)
      .limit(limit)
      .toArray();
  }

  async resetTags() {
    return await this.userTags.clear();
  }

  /*
   * Settings
   */

  private findSetting(key: string, user_handle: string, community: string) {
    return this.settings
      .where(CompoundKeys.settings.key_and_user_handle_and_community)
      .equals([key, user_handle, community])
      .first();
  }

  getSetting<T extends keyof SettingValueTypes>(
    key: T,
    specificity?: {
      user_handle?: string;
      community?: string;
    },
  ) {
    const { user_handle = "", community = "" } = specificity || {};

    return this.transaction("r", this.settings, async () => {
      let setting = await this.findSetting(key, user_handle, community);

      if (!setting && user_handle === "" && community === "") {
        // Already requested the global setting and it's not found, we can stop here
        return;
      }

      if (!setting && user_handle !== "" && community !== "") {
        // Try to find the setting with user_handle only, community only
        setting =
          (await this.findSetting(key, user_handle, "")) ||
          (await this.findSetting(key, "", community));
      }

      if (!setting) {
        // Try to find the global setting
        setting = await this.findSetting(key, "", "");
      }

      if (!setting) {
        return;
      }

      return setting.value as SettingValueTypes[T];
    });
  }

  /**
   * Convenience method for app startup
   *
   * @returns The resulting array will always have the same length as the given array of keys.
   * Every position in the given key array will correspond to the same position in the array of results.
   *
   * `undefined` will be returned for those keys that do not exist in the database.
   */
  async getSettings<T extends keyof SettingValueTypes>(keys: T[]) {
    const result = await this.settings
      .where(CompoundKeys.settings.key_and_user_handle_and_community)
      .anyOf(keys.map((key) => [key, "", ""]))
      .toArray();

    const settingsMap = new Map(result.map((item) => [item.key, item.value]));

    return keys.map((k) => settingsMap.get(k));
  }

  async setSetting<T extends keyof SettingValueTypes>(
    key: T,
    value: SettingValueTypes[T],
    specificity?: {
      /**
       * Note: user_handle can be a user handle (`aeharding@lemmy.world`)
       * or an instance handle (`lemmy.world`) when in guest mode
       */
      user_handle?: string;
      community?: string;
    },
  ) {
    const { user_handle = "", community = "" } = specificity || {};

    this.transaction("rw", this.settings, async () => {
      const query = this.settings
        .where(CompoundKeys.settings.key_and_user_handle_and_community)
        .equals([key, user_handle, community]);

      const item = await query.first();

      if (item) {
        return await query.modify({ value });
      }

      return await this.settings.add({
        key,
        value,
        user_handle,
        community,
      });
    });
  }
}

export const db = new WefwefDB();
