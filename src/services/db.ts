import Dexie, { Table } from "dexie";
import { LIMIT } from "./lemmy";

export interface IPostMetadata {
  post_id: number;
  user_handle: string;
  hidden: number; // Not boolean because dexie doesn't support booleans for indexes
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
        hidden
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
        await query.delete();
      }

      await this.postMetadatas.add(postMetadata);
    });
  }

  async getHiddenPostMetadatas(user_handle: string, page: number) {
    return await this.postMetadatas
      .where(CompoundKeys.postMetadata.user_handle_and_hidden)
      .equals([user_handle, 1])
      .reverse()
      .offset(LIMIT * (page - 1))
      .limit(LIMIT)
      .toArray();
  }
}

export const db = new WefwefDB();
