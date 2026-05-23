import { Comment, Community, LocalSite, Person, Post } from "threadiverse";

/**
 * v1 inlined what used to be `CommentAggregates` / `CommunityAggregates` / etc.
 * onto the parent entities. These aliases name the count-shaped subsets so UI
 * components can declare what they actually consume without enumerating fields.
 */

export type CommentCounts = Pick<
  Comment,
  "child_count" | "downvotes" | "score" | "upvotes"
>;

export type CommunityCounts = Pick<
  Community,
  | "comments"
  | "posts"
  | "subscribers"
  | "subscribers_local"
  | "users_active_day"
  | "users_active_half_year"
  | "users_active_month"
  | "users_active_week"
>;

export type LocalSiteCounts = Pick<
  LocalSite,
  | "comments"
  | "communities"
  | "posts"
  | "users"
  | "users_active_day"
  | "users_active_half_year"
  | "users_active_month"
  | "users_active_week"
>;

export type PersonCounts = Pick<Person, "comment_count" | "post_count">;

export type PostCounts = Pick<
  Post,
  "comments" | "downvotes" | "newest_comment_time_at" | "score" | "upvotes"
>;
