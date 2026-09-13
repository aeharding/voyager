import { Comment, Community, Person, Post } from "threadiverse";

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
  return buildUserLinkFromHandle(getHandle(user));
}

export function buildUserLinkFromHandle(handle: string): string {
  return `/u/${handle}`;
}

export function buildSearchPostsLink(search: string): string {
  return `/search/posts/${encodeURIComponent(search)}`;
}

export function buildSearchCommentsLink(search: string): string {
  return `/search/comments/${encodeURIComponent(search)}`;
}

export function buildSearchCommunitiesLink(search: string): string {
  return `/search/communities/${encodeURIComponent(search)}`;
}
