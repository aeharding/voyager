import { VgerCommentSortType } from "./VgerCommentSortType";
import { VgerListingType } from "./VgerListingType";

export interface VgerGetComments {
  type_?: VgerListingType;
  sort?: VgerCommentSortType;
  max_depth?: number;
  page?: number;
  limit?: number;
  community_id?: number;
  community_name?: string;
  post_id?: number;
  parent_id?: number;
  saved_only?: boolean;
  liked_only?: boolean;
  disliked_only?: boolean;
}
