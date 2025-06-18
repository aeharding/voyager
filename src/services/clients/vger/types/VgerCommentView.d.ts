import { CommentView } from "lemmy-js-client";

import { VgerComment } from "./VgerComment";
import { VgerCommunity } from "./VgerCommunity";
import { VgerPerson } from "./VgerPerson";

export interface VgerCommentView {
  comment: VgerComment;
  creator: VgerPerson;
  community: VgerCommunity;
  counts: VgerCommentAggregates;
  creator_banned_from_community: boolean;
  banned_from_community: boolean;
  creator_is_moderator: boolean;
  creator_is_admin: boolean;
  subscribed: boolean;
  saved: boolean;
  my_vote?: number;
}

export interface VgerCommentAggregates {
  comment_id: number;
  score: number;
  upvotes: number;
  downvotes: number;
  /**
   * The total number of children in this comment branch.
   */
  child_count: number;
}

type v = CommentView["comment"];
