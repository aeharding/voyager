import Dexie, { Table, Transaction } from "dexie";

export interface IPostMetadata {
  post_id: number;
  user_handle: string;
  hidden: 0 | 1; // Not boolean because dexie doesn't support booleans for indexes
  hidden_updated_at?: number;
}

export const OPostAppearanceType = {
  Compact: "compact",
  Large: "large",
} as const;

export type PostAppearanceType =
  (typeof OPostAppearanceType)[keyof typeof OPostAppearanceType];

export const OCommentThreadCollapse = {
  Always: "always",
  Never: "never",
} as const;

export type CommentThreadCollapse =
  (typeof OCommentThreadCollapse)[keyof typeof OCommentThreadCollapse];

export type SettingValueTypes = {
  font_size_multiplier: number;
  use_system_font_size: boolean;
  collapse_comment_threads: CommentThreadCollapse;
  post_appearance_type: PostAppearanceType;
  use_system_dark_mode: boolean;
  user_dark_mode: boolean;
  blur_nsfw: boolean;
};

export interface ISettingItem<T extends keyof SettingValueTypes> {
  key: T;
  value: SettingValueTypes[T];
  user_handle: string;
  community: string;
}

const defaultSettings: ISettingItem<keyof SettingValueTypes>[] = [
  {
    key: "font_size_multiplier",
    value: 1,
    user_handle: "",
    community: "",
  },
  {
    key: "use_system_font_size",
    value: false,
    user_handle: "",
    community: "",
  },
  {
    key: "collapse_comment_threads",
    value: OCommentThreadCollapse.Never,
    user_handle: "",
    community: "",
  },
  {
    key: "post_appearance_type",
    value: OPostAppearanceType.Large,
    user_handle: "",
    community: "",
  },
  {
    key: "use_system_dark_mode",
    value: true,
    user_handle: "",
    community: "",
  },
  {
    key: "user_dark_mode",
    value: false,
    user_handle: "",
    community: "",
  },
  {
    key: "blur_nsfw",
    value: true,
    user_handle: "",
    community: "",
  },
];

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
    this.version(2)
      .stores({
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
      })
      .upgrade(async (tx) => {
        await this.populateDefaultSettings(tx);
        await this.migrateFromLocalStorageSettings(tx);
      });

    this.on("populate", async () => {
      this.transaction("rw", this.settings, async (tx) => {
        await this.populateDefaultSettings(tx);
        await this.migrateFromLocalStorageSettings(tx);
      });
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

  private async populateDefaultSettings(tx: Transaction) {
    const settingsTable = tx.table("settings");
    settingsTable.bulkAdd(defaultSettings);
  }

  private async migrateFromLocalStorageSettings(tx: Transaction) {
    const localStorageMigrationKeys = {
      font_size_multiplier: "appearance--font-size-multiplier",
      use_system_font_size: "appearance--font-use-system",
      collapse_comment_threads: "appearance--collapse-comment-threads",
      post_appearance_type: "appearance--post-type",
      use_system_dark_mode: "appearance--dark-use-system",
      user_dark_mode: "appearance--dark-user-mode",
    };

    const settingsTable = tx.table("settings");

    return await Promise.all(
      Object.entries(localStorageMigrationKeys).map(
        ([key, localStorageKey]) => {
          const localStorageValue = localStorage.getItem(localStorageKey);

          if (!localStorageValue) {
            return Promise.resolve();
          }

          return settingsTable
            .where(CompoundKeys.settings.key_and_user_handle_and_community)
            .equals([key, "", ""])
            .modify({
              value: JSON.parse(localStorageValue),
            });
        }
      )
    );
  }

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
        throw new Error(`Setting ${key} not found`);
      }

      if (!setting && community !== "") {
        // Fall back to user settings if no specific setting for the community is found
        setting = await this.findSetting(key, user_handle, "");
      }

      if (!setting && user_handle !== "") {
        // Fall back to community settings if no specific setting for the user is found
        setting = await this.findSetting(key, "", community);
      }

      if (!setting) {
        // Fall back to global settings if no specific setting for the user is found
        setting = await this.findSetting(key, "", "");
      }

      if (!setting) {
        throw new Error(`Setting ${key} not found`);
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
