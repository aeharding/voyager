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
  return buildUserLinkFromHandle(getHandle(user));
}

export function buildUserLinkFromHandle(handle: string): string {
  return `/u/${handle}`;
}

// React router will unwrap encoding once, but we need it to stay encoded
// Search examples: "%" "?,=,/,&,:" "%20"
function escapeSearchQuery(search: string): string {
  return encodeURIComponent(encodeURIComponent(search));
}

export function buildSearchPostsLink(search: string): string {
  return `/search/posts/${escapeSearchQuery(search)}`;
}

export function buildSearchCommentsLink(search: string): string {
  return `/search/comments/${escapeSearchQuery(search)}`;
}

export function buildSearchCommunitiesLink(search: string): string {
  return `/search/communities/${escapeSearchQuery(search)}`;
}
