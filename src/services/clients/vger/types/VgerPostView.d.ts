import { PostAggregates } from "lemmy-js-client";

import { VgerCommunity, VgerPerson, VgerPost } from "./";

export interface VgerPostView {
  post: VgerPost;
  creator: VgerPerson;
  community: VgerCommunity;
  creator_banned_from_community: boolean;
  counts: VgerPostAggregates;
  subscribed: boolean;
  saved: boolean;
  read: boolean;
  creator_blocked: boolean;
  my_vote?: number;
  unread_comments: number;
}

export interface VgerPostAggregates extends PostAggregates {
  comments: number;
  score: number;
  upvotes: number;
  downvotes: number;
  /**
   * The time of the newest comment in the post.
   */
  newest_comment_time: string;
}
