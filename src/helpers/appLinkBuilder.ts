import { Comment, Community, Person, Post } from "lemmy-js-client";

import { getHandle } from "./lemmy";

export function buildCommunityLink(community: Community): string {
  return `/c/${getHandle(community)}`;
}

export function buildPostLink(community: Community, post: Post): string {
  return `/c/${getHandle(community)}/comments/${post.id}`;
}

export function buildCommentLink(
  community: Community,
  comment: Comment,
): string {
  return `/c/${getHandle(community)}/comments/${comment.post_id}/${
    comment.path
  }`;
}

export function buildUserLink(user: Person): string {
  return `/u/${getHandle(user)}`;
}
