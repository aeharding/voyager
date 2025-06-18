import { VgerListingType } from "./VgerListingType";
import { VgerPostSortType } from "./VgerPostSortType";

export interface VgerGetPosts {
  type_?: VgerListingType;
  sort?: VgerPostSortType;
  limit?: number;
  community_id?: number;
  community_name?: string;
  saved_only?: boolean;
  liked_only?: boolean;
  disliked_only?: boolean;
  show_hidden?: boolean;
  /**
   * If true, then show the read posts (even if your user setting is to hide them)
   */
  show_read?: boolean;
  /**
   * If true, then show the nsfw posts (even if your user setting is to hide them)
   */
  show_nsfw?: boolean;

  page_cursor?: string;
}
