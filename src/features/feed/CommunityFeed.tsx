import { useCallback } from "react";
import Feed, { FeedProps } from "./Feed";
import { CommunityView } from "lemmy-js-client";
import CommunitySummary from "../community/CommunitySummary";

interface PostCommentFeed
  extends Omit<FeedProps<CommunityView>, "renderItemContent"> {}

export default function CommunityFeed({ ...rest }: PostCommentFeed) {
  const renderItemContent = useCallback(
    (community: CommunityView) => <CommunitySummary community={community} />,
    []
  );

  return <Feed renderItemContent={renderItemContent} {...rest} />;
}
