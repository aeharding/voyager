import Dexie, { Table } from "dexie";
import { CommentSortType } from "lemmy-js-client";

export interface IPostMetadata {
  post_id: number;
  user_handle: string;
  hidden: 0 | 1; // Not boolean because dexie doesn't support booleans for indexes
  hidden_updated_at?: number;
}

export const OAppThemeType = {
  Default: "default",
  FieryMario: "mario",
  Pistachio: "pistachio",
  SpookyPumpkin: "pumpkin",
  UV: "uv",
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

export type ProfileLabelType =
  (typeof OProfileLabelType)[keyof typeof OProfileLabelType];

const OSwipeActionBase = {
  None: "none",
  Upvote: "upvote",
  Downvote: "downvote",
  Reply: "reply",
  Save: "save",
} as const;

export const OSwipeActionPost = {
  ...OSwipeActionBase,
  Hide: "hide",
} as const;

export const OSwipeActionComment = {
  ...OSwipeActionBase,
  Collapse: "collapse",
} as const;

export const OSwipeActionInbox = {
  ...OSwipeActionBase,
  MarkUnread: "mark_unread",
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
  blur_nsfw: PostBlurNsfwType;
  favorite_communities: string[];
  default_comment_sort: CommentDefaultSort;
  disable_marking_posts_read: boolean;
  mark_read_on_scroll: boolean;
  show_hide_read_button: boolean;
  gesture_swipe_post: SwipeActions;
  gesture_swipe_comment: SwipeActions;
  gesture_swipe_inbox: SwipeActions;
  disable_left_swipes: boolean;
  disable_right_swipes: boolean;
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
    lastPageItems?: IPostMetadata[]
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
    }
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
    }
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
