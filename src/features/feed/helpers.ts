import { ListingType } from "lemmy-js-client";

import { getFeedUrlName } from "#/features/community/mod/ModActions";

type InternalFeedType =
  | "PostsSearch"
  | "CommentsSearch"
  | "CommunitiesSearch"
  | "CommunitiesExplore"
  | "ProfilePosts"
  | "ProfileComments";

export type AnyFeed =
  | {
      remoteCommunityHandle: string;
    }
  | {
      listingType: ListingType;
    }
  | {
      internal: InternalFeedType;
    };

export function serializeFeedName(feed: AnyFeed): string {
  switch (true) {
    case "remoteCommunityHandle" in feed:
      return feed.remoteCommunityHandle; // always contains @ - will never overlap with getFeedUrlName
    case "listingType" in feed:
      return getFeedUrlName(feed.listingType);
    case "internal" in feed:
      return `@@voyager_${feed.internal}`;
    default:
      return feed;
  }
}
