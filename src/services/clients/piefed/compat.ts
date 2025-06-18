import { VgerPostSortType } from "#/services/clients/vger/types";

import { components } from "./schema";

export function compatPiefedCommunity(
  community: components["schemas"]["Community"],
) {
  return {
    ...community,
    posting_restricted_to_mods: community.restricted_to_mods,
  };
}

export function compatPiefedPerson(person: components["schemas"]["Person"]) {
  return {
    ...person,
    name: person.user_name!,
    display_name: person.title,
  };
}

export function compatPiefedPost(post: components["schemas"]["Post"]) {
  return {
    ...post,
    name: post.title,
    featured_community: post.sticky,
    featured_local: false,
  };
}

export function compatPiefedPostView(post: components["schemas"]["PostView"]) {
  return {
    ...post,
    subscribed: post.subscribed === "Subscribed",
    community: compatPiefedCommunity(post.community),
    post: compatPiefedPost(post.post),
    creator: compatPiefedPerson(post.creator),
  };
}

export function compatPiefedCommentView(
  comment: components["schemas"]["CommentView"],
) {
  return {
    ...comment,
    subscribed: comment.subscribed === "Subscribed",
    community: compatPiefedCommunity(comment.community),
    creator: compatPiefedPerson(comment.creator),
    comment: compatPiefedComment(comment.comment),
  };
}

export function compatPiefedComment(comment: components["schemas"]["Comment"]) {
  return {
    ...comment,
    content: comment.body,
  };
}

export function compatPiefedCommunityView(
  community: components["schemas"]["CommunityView"],
) {
  return {
    ...community,
    subscribed: community.subscribed === "Subscribed",
    community: compatPiefedCommunity(community.community),
  };
}

export function compatPiefedGetCommunityResponse(
  response: components["schemas"]["GetCommunityResponse"],
) {
  return {
    community_view: compatPiefedCommunityView(response.community_view),
    moderators: response.moderators.map(compatPiefedCommunityModeratorView),
  };
}

export function compatPiefedCommunityModeratorView(
  view: components["schemas"]["CommunityModeratorView"],
) {
  return {
    ...view,
    community: compatPiefedCommunity(view.community),
    moderator: compatPiefedPerson(view.moderator),
  };
}

export function compatPiefedSortType(sort: VgerPostSortType) {
  if (
    [
      "Active",
      "Hot",
      "New",
      "TopHour",
      "TopSixHour",
      "TopTwelveHour",
      "TopDay",
      "TopWeek",
      "TopMonth",
      "Scaled",
    ].includes(sort)
  ) {
    return sort as components["schemas"]["SortType"];
  }

  throw new Error(`Unsupported sort type: ${sort}`);
}
