import Dexie, { Table } from "dexie";

export interface IPostMetadata {
  post_id: number;
  user_handle: string;
  hidden: 0 | 1; // Not boolean because dexie doesn't support booleans for indexes
  hidden_updated_at?: number;
}

export const CompoundKeys = {
  postMetadata: {
    post_id_and_user_handle: "[post_id+user_handle]",
    user_handle_and_hidden: "[user_handle+hidden]",
  },
};

export class WefwefDB extends Dexie {
  postMetadatas!: Table<IPostMetadata, number>;

  constructor() {
    super("WefwefDB");

    /* IMPORTANT: Do not alter the version. If you want to change the schema,
       create a higher version and provide migration logic.
       Always assume there is a device out there with the first version of the app.
    */
    this.version(1).stores({
      postMetadatas: `
        ++,
        ${CompoundKeys.postMetadata.post_id_and_user_handle},
        ${CompoundKeys.postMetadata.user_handle_and_hidden},
        post_id, 
        user_handle,
        hidden,
        hidden_updated_at
      `,
    });
  }

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
}

export const db = new WefwefDB();
