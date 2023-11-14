import { differenceInHours, subHours } from "date-fns";
import Dexie, { Table } from "dexie";
import { CommentSortType, FederatedInstances } from "lemmy-js-client";

export interface IPostMetadata {
  post_id: number;
  user_handle: string;
  hidden: 0 | 1; // Not boolean because dexie doesn't support booleans for indexes
  hidden_updated_at?: number;
}

export interface InstanceData {
  domain: string;
  updated: Date;
  data: FederatedInstances;
}

export const OAppThemeType = {
  Default: "default",
  FieryMario: "mario",
  Pistachio: "pistachio",
  SpookyPumpkin: "pumpkin",
  UV: "uv",
  Mint: "mint",
  Dracula: "dracula",
  Tangerine: "tangerine",
} as const;

export type AppThemeType = (typeof OAppThemeType)[keyof typeof OAppThemeType];

export const OPostAppearanceType = {
  Compact: "compact",
  Large: "large",
} as const;

export type PostAppearanceType =
  (typeof OPostAppearanceType)[keyof typeof OPostAppearanceType];

export const OCompactThumbnailPositionType = {
  Left: "left",
  Right: "right",
} as const;

export type CompactThumbnailPositionType =
  (typeof OCompactThumbnailPositionType)[keyof typeof OCompactThumbnailPositionType];

export const OCompactThumbnailSizeType = {
  Hidden: "hidden",

  /**
   * Default
   */
  Small: "small",

  Medium: "medium",
  Large: "large",
} as const;

export type CompactThumbnailSizeType =
  (typeof OCompactThumbnailSizeType)[keyof typeof OCompactThumbnailSizeType];

export const OCommentThreadCollapse = {
  Always: "always",
  Never: "never",
} as const;

export type CommentThreadCollapse =
  (typeof OCommentThreadCollapse)[keyof typeof OCommentThreadCollapse];

export const OPostBlurNsfw = {
  InFeed: "in_feed",
  Never: "never",
} as const;

export const OCommentDefaultSort: Record<string, CommentSortType> = {
  Hot: "Hot",
  Top: "Top",
  New: "New",
  Controversial: "Controversial",
  Old: "Old",
} as const;

export type CommentDefaultSort = CommentSortType;

export type PostBlurNsfwType =
  (typeof OPostBlurNsfw)[keyof typeof OPostBlurNsfw];

export const OInstanceUrlDisplayMode = {
  WhenRemote: "when-remote",
  Never: "never",
} as const;

export type InstanceUrlDisplayMode =
  (typeof OInstanceUrlDisplayMode)[keyof typeof OInstanceUrlDisplayMode];

export const OVoteDisplayMode = {
  /**
   * Show upvotes and downvotes separately
   */
  Separate: "separate",

  /**
   * Show total score (upvotes + downvotes)
   */
  Total: "total",

  /**
   * Hide scores
   */
  Hide: "hide",
} as const;

export type VoteDisplayMode =
  (typeof OVoteDisplayMode)[keyof typeof OVoteDisplayMode];

export const OProfileLabelType = {
  /**
   * e.g. aeharding@lemmy.world
   */
  Handle: "handle",

  /**
   * e.g. aeharding
   */
  Username: "username",

  /**
   * e.g. lemmy.world
   */
  Instance: "instance",

  /**
   * e.g. Profile
   */
  Hide: "hide",
} as const;

export type LinkHandlerType =
  (typeof OLinkHandlerType)[keyof typeof OLinkHandlerType];

export const OLinkHandlerType = {
  DefaultBrowser: "default-browser",
  InApp: "in-app",
} as const;

export type DefaultFeedType =
  | {
      type:
        | typeof ODefaultFeedType.All
        | typeof ODefaultFeedType.Home
        | typeof ODefaultFeedType.Local
        | typeof ODefaultFeedType.CommunityList
        | typeof ODefaultFeedType.Moderating;
    }
  | {
      type: typeof ODefaultFeedType.Community;

      /**
       * Community handle. If remote, "community@instance.com".
       * If local, "community"
       */
      name: string;
    };

export const ODefaultFeedType = {
  Home: "home",
  All: "all",
  Local: "local",
  Moderating: "moderating",
  CommunityList: "community-list",
  Community: "community",
} as const;

export type JumpButtonPositionType =
  (typeof OJumpButtonPositionType)[keyof typeof OJumpButtonPositionType];

export const OJumpButtonPositionType = {
  LeftTop: "left-top",
  LeftMiddle: "left-middle",
  LeftBottom: "left-bottom",
  Center: "center",
  RightTop: "right-top",
  RightMiddle: "right-middle",
  RightBottom: "right-bottom",
} as const;

export type TapToCollapseType =
  (typeof OTapToCollapseType)[keyof typeof OTapToCollapseType];

export const OTapToCollapseType = {
  OnlyComments: "only-comments",
  OnlyHeaders: "only-headers",
  Both: "both",
  Neither: "neither",
} as const;

export type ProfileLabelType =
  (typeof OProfileLabelType)[keyof typeof OProfileLabelType];

export const OLongSwipeTriggerPointType = {
  Normal: "normal",
  Later: "later",
} as const;

export type LongSwipeTriggerPointType =
  (typeof OLongSwipeTriggerPointType)[keyof typeof OLongSwipeTriggerPointType];

const OSwipeActionBase = {
  None: "none",
  Upvote: "upvote",
  Downvote: "downvote",
  Reply: "reply",
  Save: "save",
  Share: "share",
} as const;

export const OSwipeActionPost = {
  ...OSwipeActionBase,
  Hide: "hide",
} as const;

export const OSwipeActionComment = {
  ...OSwipeActionBase,
  CollapseToTop: "collapse-to-top",
  Collapse: "collapse",
} as const;

export const OSwipeActionInbox = {
  ...OSwipeActionBase,
  MarkUnread: "mark-unread",
} as const;

export const OSwipeActionAll = {
  ...OSwipeActionPost,
  ...OSwipeActionComment,
  ...OSwipeActionInbox,
} as const;

export type SwipeAction =
  (typeof OSwipeActionAll)[keyof typeof OSwipeActionAll];

export type SwipeDirection = "farStart" | "start" | "end" | "farEnd";
export type SwipeActions = Record<SwipeDirection, SwipeAction>;

export type SettingValueTypes = {
  collapse_comment_threads: CommentThreadCollapse;
  user_instance_url_display: InstanceUrlDisplayMode;
  vote_display_mode: VoteDisplayMode;
  profile_label: ProfileLabelType;
  post_appearance_type: PostAppearanceType;
  compact_thumbnail_position_type: CompactThumbnailPositionType;
  compact_show_voting_buttons: boolean;
  compact_thumbnail_size: CompactThumbnailSizeType;
  blur_nsfw: PostBlurNsfwType;
  favorite_communities: string[];
  migration_links: string[];
  default_comment_sort: CommentDefaultSort;
  disable_marking_posts_read: boolean;
  mark_read_on_scroll: boolean;
  show_hide_read_button: boolean;
  auto_hide_read: boolean;
  disable_auto_hide_in_communities: boolean;
  gesture_swipe_post: SwipeActions;
  gesture_swipe_comment: SwipeActions;
  gesture_swipe_inbox: SwipeActions;
  disable_left_swipes: boolean;
  disable_right_swipes: boolean;
  enable_haptic_feedback: boolean;
  link_handler: LinkHandlerType;
  show_jump_button: boolean;
  jump_button_position: JumpButtonPositionType;
  tap_to_collapse: TapToCollapseType;
  filtered_keywords: string[];
  highlight_new_account: boolean;
  default_feed: DefaultFeedType;
  touch_friendly_links: boolean;
  show_comment_images: boolean;
  long_swipe_trigger_point: LongSwipeTriggerPointType;
  has_presented_block_nsfw_tip: boolean;
  no_subscribed_in_feed: boolean;
};

export interface ISettingItem<T extends keyof SettingValueTypes> {
  key: T;
  value: SettingValueTypes[T];
  user_handle: string;
  community: string;
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
  postMetadatas!: Table<IPostMetadata, number>;
  settings!: Table<ISettingItem<keyof SettingValueTypes>, string>;
  cachedFederatedInstanceData!: Table<InstanceData, number>;

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
      await this.setSetting("blur_nsfw", OPostBlurNsfw.InFeed);
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

  async upsertPostMetadata(postMetadata: IPostMetadata) {
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
    lastPageItems?: IPostMetadata[],
  ) {
    const filterFn = (metadata: IPostMetadata) =>
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
      .below(lastPageLastEntry.hidden_updated_at)
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
    const payload: InstanceData = {
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
        await query.modify(payload);
        return;
      }

      await this.cachedFederatedInstanceData.add(payload);
    });
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

  async setSetting<T extends keyof SettingValueTypes>(
    key: T,
    value: SettingValueTypes[T],
    specificity?: {
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
