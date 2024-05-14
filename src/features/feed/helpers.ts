import { ListingType } from "lemmy-js-client";
import { getFeedUrlName } from "../community/mod/ModActions";

export type AnyFeed =
  | {
      remoteCommunityHandle: string;
    }
  | {
      listingType: ListingType;
    };

export function serializeFeedName(feed: AnyFeed): string {
  switch (true) {
    case "remoteCommunityHandle" in feed:
      return feed.remoteCommunityHandle; // always contains @ - will never overlap with getFeedUrlName
    case "listingType" in feed:
      return getFeedUrlName(feed.listingType);
    default:
      return feed;
  }
}
